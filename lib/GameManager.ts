import { SubjectRecord } from '@/lib/types';

const DEFAULT_DECOYS = 4;

export interface GameManagerOptions<T extends SubjectRecord> {
    decoysNeeded?: number;
    groupBy?: (subject: T) => string | undefined;
}

export class GameManager<T extends SubjectRecord> {
    private subjects: T[];

    private decoysNeeded: number;

    private groupBy?: (subject: T) => string | undefined;

    constructor(subjects: T[], options?: GameManagerOptions<T>) {
        this.subjects = subjects;
        this.decoysNeeded = options?.decoysNeeded ?? DEFAULT_DECOYS;
        this.groupBy = options?.groupBy;
    }

    getSubjects(): T[] {
        return [...this.subjects];
    }

    getCandidates(answer: T): T[] {
        const subjectKey = answer.getSubject();
        return this.subjects.filter((item) => item.getSubject() !== subjectKey);
    }

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

    private static shuffle<T>(values: T[]): T[] {
        const arr = [...values];
        for (let i = arr.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}
