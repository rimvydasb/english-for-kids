import {GlobalConfig, KNOWN_GAME_STORAGE_KEYS} from '@/lib/config';
import {
    AStatisticsManager,
    BaseStatisticsManager,
    GlobalStatsMap,
    InGameAggregatedStatistics,
    InGameStatsMap,
    StorageLike,
} from '@/lib/statistics/AStatisticsManager';
import {GameRules, SubjectRecord} from '@/lib/types';

export interface GameRoundResult {
    isCorrect: boolean;
    isComplete: boolean;
    inGameStats: InGameStatsMap;
    aggregated: InGameAggregatedStatistics;
}

export interface FinishResult {
    aggregated: InGameAggregatedStatistics;
    globalStats: GlobalStatsMap;
}

export interface GameManagerOptions<T extends SubjectRecord> {
    decoysNeeded?: number;
    groupBy?: (subject: T) => string | undefined;
}

export abstract class GameManager<T extends SubjectRecord> {
    protected subjects: T[];

    protected decoysNeeded: number;

    protected groupBy?: (subject: T) => string | undefined;

    protected statistics: BaseStatisticsManager;

    protected activeConfig: Partial<GameRules> = {};

    protected constructor(subjects: T[], statistics: BaseStatisticsManager, options?: GameManagerOptions<T>) {
        this.subjects = subjects;
        this.statistics = statistics;
        this.groupBy = options?.groupBy;
        this.decoysNeeded = options?.decoysNeeded ?? GlobalConfig.DEFAULT_DECOYS;
    }

    abstract getGameRules(): GameRules;

    setConfig(config: Partial<GameRules>) {
        this.activeConfig = config;
        this.statistics.saveConfig(config);
    }

    /**
     * Start a new game or resume existing one.
     * Returns the list of all subjects user needs to learn in this game.
     */
    startTheGame(): T[] {
        this.restoreSession();
        const rules = this.getGameRules();
        const limit = rules.totalInGameSubjectsToLearn ?? GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN;
        const types = rules.selectedWordEntryTypes ?? [];

        // Helper to check if subject matches selected types
        const matchesType = (subject: T) => {
            if (types.length === 0) return true;
            // Check if subject has 'type' property and it matches
            const type = (subject as any).type;
            if (type && !types.includes(type)) return false;
            return true;
        };

        let activeSelection = this.statistics
            .loadActiveSubjects()
            .map((key) => this.findBySubject(key))
            .filter((item): item is T => Boolean(item))
            .filter(matchesType);

        if (activeSelection.length < limit) {
            const needed = limit - activeSelection.length;
            const existingKeys = new Set(activeSelection.map((s) => s.getSubject()));

            const pool = this.subjects.filter((s) => !existingKeys.has(s.getSubject()) && matchesType(s));
            
            const globalStats = this.statistics.loadGlobalStatistics();
            const prioritized = GameManager.sortByDifficulty(pool, globalStats);
            const nextBatch = prioritized.slice(0, needed);
            
            activeSelection = [...activeSelection, ...nextBatch];
        } else if (activeSelection.length > limit) {
            activeSelection = activeSelection.slice(0, limit);
        }

        this.statistics.saveActiveSubjects(activeSelection.map((item) => item.getSubject()));
        return activeSelection;
    }

    hasActiveGame(): boolean {
        return this.statistics.loadActiveSubjects().length > 0;
    }

    protected restoreSession() {
        this.activeConfig = this.statistics.loadConfig(this.activeConfig);
    }

    loadInGameStatistics(): InGameStatsMap {
        return this.statistics.loadInGameStatistics();
    }

    loadGlobalStatistics(): GlobalStatsMap {
        return this.statistics.loadGlobalStatistics();
    }

    aggregate(current: InGameStatsMap): InGameAggregatedStatistics {
        return this.statistics.aggregate(current);
    }

    drawNextCandidate(activeSubjects: T[], inGameStats: InGameStatsMap): T | null {
        const candidates = activeSubjects.filter((item) => {
            const record = inGameStats[item.getSubject()];
            return !record || !record.learned || record.correctAttempts === 0;
        });
        if (candidates.length === 0) {
            return null;
        }
        return GameManager.shuffle(candidates)[0];
    }

    buildOptions(answer: T, activeSubjects: T[]): string[] {
        const groupKey = this.groupBy?.(answer);

        // Pool of all possible decoys (excluding the answer)
        const globalBasePool = this.subjects.filter((item) => item.getSubject() !== answer.getSubject());
        // Pool of active decoys (excluding the answer)
        const activeBasePool = activeSubjects.filter((item) => item.getSubject() !== answer.getSubject());

        let decoys: T[] = [];

        // 1. Try to find decoys of the same group first
        if (groupKey !== undefined) {
            // Active same type
            const activeSameType = activeBasePool.filter((item) => this.groupBy?.(item) === groupKey);
            decoys = GameManager.shuffle(activeSameType);

            // Global same type
            if (decoys.length < this.decoysNeeded) {
                const used = new Set(decoys.map((d) => d.getSubject()));
                const globalSameType = globalBasePool.filter(
                    (item) => this.groupBy?.(item) === groupKey && !used.has(item.getSubject()),
                );
                const remaining = this.decoysNeeded - decoys.length;
                decoys = [...decoys, ...GameManager.shuffle(globalSameType).slice(0, remaining)];
            }
        }

        // 2. Fill remaining spots with any available subjects if needed
        if (decoys.length < this.decoysNeeded) {
            const used = new Set(decoys.map((d) => d.getSubject()));

            // Active any type
            const activeRemaining = activeBasePool.filter((item) => !used.has(item.getSubject()));
            const remainingAfterActive = this.decoysNeeded - decoys.length;
            const addedFromActive = GameManager.shuffle(activeRemaining).slice(0, remainingAfterActive);
            decoys = [...decoys, ...addedFromActive];

            // Global any type
            if (decoys.length < this.decoysNeeded) {
                const usedNow = new Set(decoys.map((d) => d.getSubject()));
                const globalRemaining = globalBasePool.filter((item) => !usedNow.has(item.getSubject()));
                const remainingFinal = this.decoysNeeded - decoys.length;
                const addedFromGlobal = GameManager.shuffle(globalRemaining).slice(0, remainingFinal);
                decoys = [...decoys, ...addedFromGlobal];
            }
        }

        const options = GameManager.shuffle([answer, ...decoys]);
        return options.map((item) => item.getSubject());
    }

    /**
     * User selects an answer - record that attempt
     *
     * @param current - current in-game statistics
     * @param subject - the actual subject user tries to guess
     * @param guess - user's guess
     * @param activeSubjects - list of all subjects user needs to learn in this game
     */
    recordAttempt(current: InGameStatsMap, subject: T, guess: string, activeSubjects: T[]): GameRoundResult {
        const isCorrect = subject.getSubject() === guess;
        let inGameStats = this.statistics.recordAttempt(current, subject.getSubject(), isCorrect);

        if (!isCorrect) {
            const guessedSubject = this.findBySubject(guess);
            if (guessedSubject) {
                inGameStats = this.statistics.recordAttempt(inGameStats, guess, false);
            }
        }

        const aggregated = this.statistics.aggregate(inGameStats);
        const isComplete = this.hasCompletedAll(activeSubjects, inGameStats);

        return {
            isCorrect,
            isComplete,
            inGameStats,
            aggregated,
        };
    }

    finishGame(current: InGameStatsMap): FinishResult {
        const aggregated = this.statistics.finishGame(current);
        return {
            aggregated,
            globalStats: this.statistics.loadGlobalStatistics(),
        };
    }

    resetInGameStatistics(): {inGameStats: InGameStatsMap; aggregated: InGameAggregatedStatistics} {
        this.statistics.resetInGameStatistics();
        this.activeConfig = {};
        const inGameStats = this.statistics.loadInGameStatistics();
        return {inGameStats, aggregated: this.statistics.aggregate(inGameStats)};
    }

    resetGlobalStatistics(): GlobalStatsMap {
        this.statistics.resetGlobalStatistics();
        return this.statistics.loadGlobalStatistics();
    }

    findBySubject(subject: string): T | undefined {
        return this.subjects.find((item) => item.getSubject() === subject);
    }

    getWorstGuesses(count = GlobalConfig.WORST_GUESSES_COUNT, stats: InGameStatsMap, subjects?: T[]): T[] {
        const scope = subjects ?? this.subjects;
        return scope
            .map((subject) => {
                const record = stats[subject.getSubject()];
                if (!record || record.wrongAttempts <= 0) {
                    return null;
                }
                return {subject, wrong: record.wrongAttempts};
            })
            .filter((item): item is {subject: T; wrong: number} => Boolean(item))
            .sort((a, b) => b.wrong - a.wrong)
            .slice(0, count)
            .map((item) => item.subject);
    }

    protected hasCompletedAll(subjects: T[], stats: InGameStatsMap): boolean {
        return subjects.every((item) => {
            const record = stats[item.getSubject()];
            return Boolean(record && record.learned && record.correctAttempts > 0);
        });
    }

    public static sortByDifficulty<U extends SubjectRecord>(subjects: U[], globalStats: GlobalStatsMap): U[] {
        const shuffled = GameManager.shuffle(subjects);
        return shuffled.sort((a, b) => {
            const aStats = globalStats[a.getSubject()] ?? {
                key: a.getSubject(),
                correctAttempts: 0,
                wrongAttempts: 0,
            };
            const bStats = globalStats[b.getSubject()] ?? {
                key: b.getSubject(),
                correctAttempts: 0,
                wrongAttempts: 0,
            };

            // 1. Prioritize completely new words (0 attempts)
            const aIsNew = aStats.correctAttempts === 0 && aStats.wrongAttempts === 0;
            const bIsNew = bStats.correctAttempts === 0 && bStats.wrongAttempts === 0;
            if (aIsNew && !bIsNew) return -1;
            if (!aIsNew && bIsNew) return 1;

            // 2. Struggle Score (Higher is harder)
            const aScore = aStats.wrongAttempts - aStats.correctAttempts;
            const bScore = bStats.wrongAttempts - bStats.correctAttempts;
            if (aScore !== bScore) {
                return bScore - aScore;
            }

            // 3. Total Attempts (Higher frequency first)
            const aAttempts = aStats.correctAttempts + aStats.wrongAttempts;
            const bAttempts = bStats.correctAttempts + bStats.wrongAttempts;
            if (aAttempts !== bAttempts) {
                return bAttempts - aAttempts;
            }

            return a.getSubject().localeCompare(b.getSubject());
        });
    }

    private static shuffle<U>(values: U[]): U[] {
        const arr = [...values];
        for (let i = arr.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    static resetAllOngoingGames(storage?: StorageLike): void {
        const store =
            storage ?? (typeof window !== 'undefined' ? window.localStorage : AStatisticsManager.createMemoryStorage());

        KNOWN_GAME_STORAGE_KEYS.forEach((key) => {
            store.removeItem?.(key);
            store.removeItem?.(`${key}_ACTIVE_SUBJECTS`);
        });
    }
}
