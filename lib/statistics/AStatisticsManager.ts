import { GlobalStatistics, InGameStatistics, SubjectRecord } from '@/lib/types';

export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem?(key: string): void;
}

export interface GeneralPhraseVariantStats {
    totalAttempts: number;
    correctAttempts: number;
    wrongAttempts: number;
    learnedItemsCount: number;
    totalItemsCount: number;
}

export type GlobalStatsMap = Record<string, GlobalStatistics>;
export type InGameStatsMap = Record<string, InGameStatistics>;

export abstract class AStatisticsManager {
    protected storage: StorageLike;

    protected constructor(storage?: StorageLike) {
        this.storage =
            storage ??
            (typeof window !== 'undefined' ? window.localStorage : AStatisticsManager.createMemoryStorage());
    }

    protected static createMemoryStorage(): StorageLike {
        const store: Record<string, string> = {};
        return {
            getItem: (key) => (key in store ? store[key] : null),
            setItem: (key, value) => {
                store[key] = value;
            },
            removeItem: (key) => {
                delete store[key];
            },
        };
    }

    protected loadFromStorage<T>(
        key: string,
        fallbackFactory: () => T,
        sanitizer: (value: unknown) => T | null,
    ): T {
        const stored = this.storage.getItem(key);
        if (!stored) return fallbackFactory();
        try {
            const parsed: unknown = JSON.parse(stored);
            const sanitized = sanitizer(parsed);
            return sanitized ?? fallbackFactory();
        } catch {
            return fallbackFactory();
        }
    }

    protected saveToStorage(key: string, value: unknown) {
        this.storage.setItem(key, JSON.stringify(value));
    }

    protected createEmptyGlobalStats(subjects: SubjectRecord[]): GlobalStatsMap {
        return subjects.reduce<GlobalStatsMap>((acc, subject) => {
            const key = subject.getSubject();
            acc[key] = { key, correctAttempts: 0, wrongAttempts: 0 };
            return acc;
        }, {});
    }

    protected createEmptyInGameStats(subjects: SubjectRecord[]): InGameStatsMap {
        return subjects.reduce<InGameStatsMap>((acc, subject) => {
            const key = subject.getSubject();
            acc[key] = {
                key,
                totalAttempts: 0,
                correctAttempts: 0,
                wrongAttempts: 0,
                learned: false,
            };
            return acc;
        }, {});
    }

    protected cloneGlobalStats(stats: GlobalStatsMap): GlobalStatsMap {
        return Object.keys(stats).reduce<GlobalStatsMap>((acc, key) => {
            acc[key] = { ...stats[key] };
            return acc;
        }, {});
    }

    protected cloneInGameStats(stats: InGameStatsMap): InGameStatsMap {
        return Object.keys(stats).reduce<InGameStatsMap>((acc, key) => {
            acc[key] = { ...stats[key] };
            return acc;
        }, {});
    }

    protected computeVariantStats(stats: InGameStatsMap): GeneralPhraseVariantStats {
        const values = Object.values(stats);
        const totalAttempts = values.reduce((sum, item) => sum + item.totalAttempts, 0);
        const correctAttempts = values.reduce((sum, item) => sum + item.correctAttempts, 0);
        const wrongAttempts = values.reduce((sum, item) => sum + item.wrongAttempts, 0);
        const learnedItemsCount = values.filter(
            (item) => item.learned && item.correctAttempts > 0,
        ).length;

        return {
            totalAttempts,
            correctAttempts,
            wrongAttempts,
            learnedItemsCount,
            totalItemsCount: values.length,
        };
    }

    protected rebuildGlobalFromInGame(
        inGameStats: InGameStatsMap,
        subjects: SubjectRecord[],
    ): GlobalStatsMap {
        const totals = this.createEmptyGlobalStats(subjects);
        Object.values(inGameStats).forEach(({ key, correctAttempts, wrongAttempts }) => {
            if (!totals[key]) {
                totals[key] = { key, correctAttempts: 0, wrongAttempts: 0 };
            }
            totals[key].correctAttempts += correctAttempts;
            totals[key].wrongAttempts += wrongAttempts;
        });
        return totals;
    }

    protected rebuildGlobalFromVariants(
        variants: Record<string, InGameStatsMap>,
        subjects: SubjectRecord[],
    ): GlobalStatsMap {
        const totals = this.createEmptyGlobalStats(subjects);
        Object.values(variants).forEach((variantStats) => {
            Object.values(variantStats).forEach(({ key, correctAttempts, wrongAttempts }) => {
                if (!totals[key]) {
                    totals[key] = { key, correctAttempts: 0, wrongAttempts: 0 };
                }
                totals[key].correctAttempts += correctAttempts;
                totals[key].wrongAttempts += wrongAttempts;
            });
        });
        return totals;
    }

    protected ensureInGameEntry(stats: InGameStatsMap, key: string): InGameStatistics {
        if (!stats[key]) {
            stats[key] = {
                key,
                totalAttempts: 0,
                correctAttempts: 0,
                wrongAttempts: 0,
                learned: false,
            };
        }
        return { ...stats[key] };
    }

    protected sanitizeGlobalStats(parsed: unknown, subjects: SubjectRecord[]): GlobalStatsMap | null {
        if (!parsed || typeof parsed !== 'object') return null;
        const allowed = new Set(subjects.map((subject) => subject.getSubject()));
        const base = this.createEmptyGlobalStats(subjects);
        const incoming = parsed as Record<string, Partial<GlobalStatistics> & Record<string, unknown>>;

        Object.keys(incoming).forEach((key) => {
            if (!allowed.has(key)) return;
            const value = incoming[key];
            if (value && typeof value.correctAttempts === 'number' && typeof value.wrongAttempts === 'number') {
                base[key] = { key, correctAttempts: value.correctAttempts, wrongAttempts: value.wrongAttempts };
            }
        });
        return base;
    }

    protected sanitizeInGameStats(parsed: unknown, subjects: SubjectRecord[]): InGameStatsMap | null {
        if (!parsed || typeof parsed !== 'object') return null;
        const allowed = new Set(subjects.map((subject) => subject.getSubject()));
        const base = this.createEmptyInGameStats(subjects);
        const incoming = parsed as Record<string, Partial<InGameStatistics> & Record<string, unknown>>;

        Object.keys(incoming).forEach((key) => {
            if (!allowed.has(key)) return;
            const value = incoming[key];
            if (
                value &&
                typeof value.totalAttempts === 'number' &&
                typeof value.correctAttempts === 'number' &&
                typeof value.wrongAttempts === 'number' &&
                typeof value.learned === 'boolean'
            ) {
                base[key] = { ...base[key], ...value, key };
            }
        });
        return base;
    }
}
