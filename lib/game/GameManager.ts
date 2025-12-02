import {GlobalStatistics, InGameStatistics, SubjectRecord} from '@/lib/types';

const DEFAULT_DECOYS = 4;

export interface GameManagerOptions<T extends SubjectRecord> {
    decoysNeeded?: number;
    groupBy?: (subject: T) => string | undefined;
}

export interface GuessResult<Snapshot> {
    isCorrect: boolean;
    isComplete: boolean;
    snapshot: Snapshot;
}

export interface GameStatisticsAdapter<Snapshot> {
    loadAll(): Snapshot;

    recordAttempt(subject: string, isCorrect: boolean): Snapshot;

    finalizeVariant(): Snapshot;

    resetVariant(): Snapshot;

    resetGlobal(): Snapshot;

    getInGameStats(snapshot: Snapshot): Record<string, InGameStatistics>;

    getGlobalStats(snapshot: Snapshot): Record<string, GlobalStatistics>;
}

/**
 * Abstract game manager to handle common logic for different types of games (words, phrases, etc.)
 */
export abstract class GameManager<T extends SubjectRecord, Snapshot> {
    protected subjects: T[];

    protected decoysNeeded: number;

    protected groupBy?: (subject: T) => string | undefined;

    protected statistics: GameStatisticsAdapter<Snapshot>;

    private snapshot: Snapshot;

    protected constructor(
        subjects: T[],
        statistics: GameStatisticsAdapter<Snapshot>,
        options?: GameManagerOptions<T>,
    ) {
        this.decoysNeeded = options?.decoysNeeded ?? DEFAULT_DECOYS;
        this.groupBy = options?.groupBy;
        this.statistics = statistics;
        this.snapshot = statistics.loadAll();
        this.subjects = subjects.slice(0, 3);
    }

    getSubjects(): T[] {
        return [...this.subjects];
    }

    getSnapshot(): Snapshot {
        return this.snapshot;
    }

    protected updateSnapshot(snapshot: Snapshot): Snapshot {
        this.snapshot = snapshot;
        return snapshot;
    }

    getCandidates(answer: T): T[] {
        const subjectKey = answer.getSubject();
        return this.subjects.filter((item) => item.getSubject() !== subjectKey);
    }

    /**
     * When each round starts, draw the next candidate that has not been learned yet
     */
    drawNextCandidate(): T | null {
        const stats = this.getInGameStats(this.snapshot);
        const candidates = this.subjects.filter((item) => {
            const record = stats[item.getSubject()];
            return !record || !record.learned || record.correctAttempts === 0;
        });

        if (candidates.length === 0) {
            return null;
        }

        return GameManager.shuffle(candidates)[0];
    }

    /**
     * For the current round, build the list of options including the answer and decoys
     *
     * @param answer - the correct answer for the current round
     */
    buildOptions(answer: T): string[] {
        const candidates = this.getCandidates(answer);
        const groupKey = this.groupBy?.(answer);
        const primaryPool =
            groupKey !== undefined
                ? candidates.filter((candidate) => this.groupBy?.(candidate) === groupKey)
                : candidates;

        let decoys = GameManager.shuffle(primaryPool).slice(0, this.decoysNeeded);

        if (decoys.length < this.decoysNeeded) {
            const used = new Set(decoys.map((item) => item.getSubject()));
            const secondaryPool = candidates.filter((candidate) => !used.has(candidate.getSubject()));
            const remaining = this.decoysNeeded - decoys.length;
            decoys = [...decoys, ...GameManager.shuffle(secondaryPool).slice(0, remaining)];
        }

        return GameManager.shuffle([answer, ...decoys]).map((item) => item.getSubject());
    }

    findBySubject(subject: string): T | undefined {
        return this.subjects.find((item) => item.getSubject() === subject);
    }

    /**
     * Process the user's guess for the current round and update statistics
     */
    doGuess(answer: T, guess: string): GuessResult<Snapshot> {
        const isCorrect = answer.getSubject() === guess;
        const snapshot = this.updateSnapshot(
            this.statistics.recordAttempt(answer.getSubject(), isCorrect),
        );
        const isComplete = this.hasCompletedAll(this.getInGameStats(snapshot));

        return {
            isCorrect,
            isComplete,
            snapshot,
        };
    }

    finalizeVariant(): Snapshot {
        return this.updateSnapshot(this.statistics.finalizeVariant());
    }

    resetVariant(): Snapshot {
        return this.updateSnapshot(this.statistics.resetVariant());
    }

    resetGlobal(): Snapshot {
        return this.updateSnapshot(this.statistics.resetGlobal());
    }

    private hasCompletedAll(stats: Record<string, InGameStatistics>): boolean {
        return this.subjects.every((item) => {
            const record = stats[item.getSubject()];
            return Boolean(record && record.learned && record.correctAttempts > 0);
        });
    }

    getWorstGuesses(count: number): T[] {
        const inGameStats = this.statistics.getInGameStats(this.snapshot);
        const subjects = this.subjects
            .map((subject) => {
                const stats = inGameStats[subject.getSubject()];
                if (stats && stats.wrongAttempts > 0) {
                    return {subject, wrong: stats.wrongAttempts};
                } else {
                    return null;
                }
            })
            .filter((item): item is { subject: T; wrong: number } => item !== null)
            .sort((a, b) => a.wrong - b.wrong)
            .map((item) => item.subject)
            .slice(0, count);

        if (subjects.length <= 0) {
            console.warn('No worst guesses found.');
        }

        return subjects;
    }

    private getInGameStats(snapshot: Snapshot): Record<string, InGameStatistics> {
        return this.statistics.getInGameStats(snapshot);
    }

    private static shuffle<U>(values: U[]): U[] {
        const arr = [...values];
        for (let i = arr.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}
