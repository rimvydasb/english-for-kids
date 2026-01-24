import {GlobalConfig, KNOWN_GAME_STORAGE_KEYS} from '@/lib/Config';
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

    protected constructor(subjects: T[], statistics: BaseStatisticsManager, options?: GameManagerOptions<T>) {
        this.subjects = subjects;
        this.statistics = statistics;
        this.groupBy = options?.groupBy;
        this.decoysNeeded = options?.decoysNeeded ?? GlobalConfig.DEFAULT_DECOYS;
    }

    abstract getGameRules(): GameRules;

    startTheGame(): T[] {
        const existingSelection = this.statistics
            .loadActiveSubjects()
            .map((key) => this.findBySubject(key))
            .filter((item): item is T => Boolean(item));

        if (existingSelection.length > 0) {
            if (existingSelection.length > GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN) {
                const truncated = existingSelection.slice(0, GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN);
                this.statistics.saveActiveSubjects(truncated.map((item) => item.getSubject()));
                return truncated;
            }
            return existingSelection;
        }

        const globalStats = this.statistics.loadGlobalStatistics();
        const prioritized = GameManager.sortByDifficulty(this.subjects, globalStats);
        const chosen = prioritized.slice(0, GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN);
        this.statistics.saveActiveSubjects(chosen.map((item) => item.getSubject()));
        return chosen;
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
        const basePool = activeSubjects.filter((item) => item.getSubject() !== answer.getSubject());
        const groupKey = this.groupBy?.(answer);
        const primaryPool =
            groupKey !== undefined ? basePool.filter((candidate) => this.groupBy?.(candidate) === groupKey) : basePool;

        let decoys = GameManager.shuffle(primaryPool).slice(0, this.decoysNeeded);

        if (decoys.length < this.decoysNeeded) {
            const used = new Set(decoys.map((item) => item.getSubject()));
            const secondaryPool = basePool.filter((candidate) => !used.has(candidate.getSubject()));
            const remaining = this.decoysNeeded - decoys.length;
            decoys = [...decoys, ...GameManager.shuffle(secondaryPool).slice(0, remaining)];
        }

        const usedSubjects = new Set<string>();
        const uniqueOptions: T[] = [];
        const addUnique = (item: T) => {
            const key = item.getSubject();
            if (usedSubjects.has(key)) return;
            usedSubjects.add(key);
            uniqueOptions.push(item);
        };

        addUnique(answer);
        decoys.forEach(addUnique);

        if (uniqueOptions.length < this.decoysNeeded + 1) {
            const fallbackPool = this.subjects.filter((item) => !usedSubjects.has(item.getSubject()));
            GameManager.shuffle(fallbackPool).forEach((candidate) => {
                if (uniqueOptions.length >= this.decoysNeeded + 1) return;
                addUnique(candidate);
            });
        }

        return GameManager.shuffle(uniqueOptions).map((item) => item.getSubject());
    }

    recordAttempt(current: InGameStatsMap, subject: T, guess: string, activeSubjects: T[]): GameRoundResult {
        const isCorrect = subject.getSubject() === guess;
        const inGameStats = this.statistics.recordAttempt(current, subject.getSubject(), isCorrect);
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

    private static sortByDifficulty<U extends SubjectRecord>(subjects: U[], globalStats: GlobalStatsMap): U[] {
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

            const aScore = aStats.wrongAttempts - aStats.correctAttempts;
            const bScore = bStats.wrongAttempts - bStats.correctAttempts;
            if (aScore !== bScore) {
                return bScore - aScore;
            }
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
