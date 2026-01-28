import {GlobalStatistics, InGameStatistics, SubjectRecord} from '@/lib/types';

export interface StorageLike {
    getItem(key: string): string | null;

    setItem(key: string, value: string): void;

    removeItem?(key: string): void;
}

export interface InGameAggregatedStatistics {
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

    protected storageKey: string;

    protected constructor(storage?: StorageLike) {
        this.storage =
            storage ?? (typeof window !== 'undefined' ? window.localStorage : AStatisticsManager.createMemoryStorage());
        this.storageKey = 'GENERIC_STATS';
    }

    public static createMemoryStorage(): StorageLike {
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

    protected loadFromStorage<T>(key: string, fallbackFactory: () => T, sanitizer: (value: unknown) => T | null): T {
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
            acc[key] = {key, correctAttempts: 0, wrongAttempts: 0};
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
            acc[key] = {...stats[key]};
            return acc;
        }, {});
    }

    protected cloneInGameStats(stats: InGameStatsMap): InGameStatsMap {
        return Object.keys(stats).reduce<InGameStatsMap>((acc, key) => {
            acc[key] = {...stats[key]};
            return acc;
        }, {});
    }

    protected computeAggregatedStats(stats: InGameStatsMap): InGameAggregatedStatistics {
        const values = Object.values(stats);
        const totalAttempts = values.reduce((sum, item) => sum + item.totalAttempts, 0);
        const correctAttempts = values.reduce((sum, item) => sum + item.correctAttempts, 0);
        const wrongAttempts = values.reduce((sum, item) => sum + item.wrongAttempts, 0);
        const learnedItemsCount = values.filter((item) => item.learned && item.correctAttempts > 0).length;

        return {
            totalAttempts,
            correctAttempts,
            wrongAttempts,
            learnedItemsCount,
            totalItemsCount: values.length,
        };
    }

    protected rebuildGlobalFromInGame(inGameStats: InGameStatsMap, subjects: SubjectRecord[]): GlobalStatsMap {
        const totals = this.createEmptyGlobalStats(subjects);
        Object.values(inGameStats).forEach(({key, correctAttempts, wrongAttempts}) => {
            if (!totals[key]) {
                totals[key] = {key, correctAttempts: 0, wrongAttempts: 0};
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
            Object.values(variantStats).forEach(({key, correctAttempts, wrongAttempts}) => {
                if (!totals[key]) {
                    totals[key] = {key, correctAttempts: 0, wrongAttempts: 0};
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
        return {...stats[key]};
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
                base[key] = {key, correctAttempts: value.correctAttempts, wrongAttempts: value.wrongAttempts};
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
                base[key] = {...base[key], ...value, key};
            }
        });
        return base;
    }
}

export class BaseStatisticsManager extends AStatisticsManager {
    private readonly globalStorageKey: string;

    private readonly activeSubjectsKey: string;

    private readonly configKey: string;

    private readonly subjects: SubjectRecord[];

    constructor(subjects: SubjectRecord[], storageKey: string, globalStorageKey: string, storage?: StorageLike) {
        super(storage);
        this.subjects = subjects;
        this.storageKey = storageKey;
        this.globalStorageKey = globalStorageKey;
        this.activeSubjectsKey = `${storageKey}_ACTIVE_SUBJECTS`;
        this.configKey = `${storageKey}_CONFIG`;
    }

    loadInGameStatistics(): InGameStatsMap {
        return this.loadFromStorage(
            this.storageKey,
            () => this.createEmptyInGameStats(this.subjects),
            (parsed) => this.sanitizeInGameStats(parsed, this.subjects),
        );
    }

    loadGlobalStatistics(): GlobalStatsMap {
        return this.loadFromStorage(
            this.globalStorageKey,
            () => this.createEmptyGlobalStats(this.subjects),
            (parsed) => this.sanitizeGlobalStats(parsed, this.subjects),
        );
    }

    recordAttempt(current: InGameStatsMap, subject: string, isCorrect: boolean): InGameStatsMap {
        const next = this.cloneInGameStats(current);
        const entry = this.ensureInGameEntry(next, subject);

        entry.totalAttempts += 1;
        if (isCorrect) {
            entry.correctAttempts += 1;
            entry.learned = true;
        } else {
            entry.wrongAttempts += 1;
            entry.learned = false;
        }

        next[subject] = entry;
        this.saveToStorage(this.storageKey, next);
        return next;
    }

    aggregate(current: InGameStatsMap): InGameAggregatedStatistics {
        return this.computeAggregatedStats(current);
    }

    finishGame(current: InGameStatsMap): InGameAggregatedStatistics {
        const updatedGlobal = this.mergeIntoGlobal(this.loadGlobalStatistics(), current);
        this.saveToStorage(this.globalStorageKey, updatedGlobal);
        return this.aggregate(current);
    }

    resetGlobalStatistics(): void {
        this.saveToStorage(this.globalStorageKey, this.createEmptyGlobalStats(this.subjects));
    }

    resetInGameStatistics(): void {
        this.saveToStorage(this.storageKey, this.createEmptyInGameStats(this.subjects));
        this.clearActiveSubjects();
        this.clearConfig();
    }

    private mergeIntoGlobal(global: GlobalStatsMap, current: InGameStatsMap): GlobalStatsMap {
        const merged = this.cloneGlobalStats(global);
        Object.values(current).forEach(({key, correctAttempts, wrongAttempts}) => {
            if (!merged[key]) {
                merged[key] = {key, correctAttempts: 0, wrongAttempts: 0};
            }
            merged[key].correctAttempts += correctAttempts;
            merged[key].wrongAttempts += wrongAttempts;
        });
        return merged;
    }

    loadActiveSubjects(): string[] {
        const stored = this.storage.getItem(this.activeSubjectsKey);
        if (!stored) return [];
        try {
            const parsed: unknown = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
                return parsed as string[];
            }
        } catch {
            // ignore parsing errors and fall back to empty
        }
        return [];
    }

    saveActiveSubjects(subjectKeys: string[]): void {
        this.storage.setItem(this.activeSubjectsKey, JSON.stringify(subjectKeys));
    }

    clearActiveSubjects(): void {
        this.storage.removeItem?.(this.activeSubjectsKey);
    }

    loadConfig<T>(fallback: T): T {
        const stored = this.storage.getItem(this.configKey);
        if (!stored) return fallback;
        try {
            return JSON.parse(stored) as T;
        } catch {
            return fallback;
        }
    }

    saveConfig<T>(config: T): void {
        this.storage.setItem(this.configKey, JSON.stringify(config));
    }

    clearConfig(): void {
        this.storage.removeItem?.(this.configKey);
    }
}
