import { PhraseRecord } from '@/lib/phrases';
import {
    AStatisticsManager,
    GeneralPhraseVariantStats,
    StorageLike,
} from '@/lib/statistics/AStatisticsManager';

export interface GlobalPhraseStatistics {
    phrase: string;
    correctAttempts: number;
    wrongAttempts: number;
}

export interface InGamePhraseStatistics extends GlobalPhraseStatistics {
    totalAttempts: number;
    learned: boolean;
}

const GLOBAL_KEY = 'GLOBAL_PHRASE_STATS';
const VARIANT_KEY = 'PHRASES_GUESS_STATS';

const createEmptyGlobalStats = (phrases: PhraseRecord[]): Record<string, GlobalPhraseStatistics> =>
    phrases.reduce<Record<string, GlobalPhraseStatistics>>((acc, item) => {
        acc[item.phrase] = {
            phrase: item.phrase,
            correctAttempts: 0,
            wrongAttempts: 0,
        };
        return acc;
    }, {});

const createEmptyInGameStats = (phrases: PhraseRecord[]): Record<string, InGamePhraseStatistics> =>
    phrases.reduce<Record<string, InGamePhraseStatistics>>((acc, item) => {
        acc[item.phrase] = {
            phrase: item.phrase,
            totalAttempts: 0,
            correctAttempts: 0,
            wrongAttempts: 0,
            learned: false,
        };
        return acc;
    }, {});

const cloneInGameStats = (stats: Record<string, InGamePhraseStatistics>) =>
    Object.keys(stats).reduce<Record<string, InGamePhraseStatistics>>((acc, key) => {
        acc[key] = { ...stats[key] };
        return acc;
    }, {});

export class PhrasesStatisticsManager extends AStatisticsManager {
    private phrases: PhraseRecord[];

    private globalStats: Record<string, GlobalPhraseStatistics>;

    private inGameStats: Record<string, InGamePhraseStatistics>;

    constructor(phrases: PhraseRecord[], storage?: StorageLike) {
        super(storage);
        this.phrases = phrases;
        this.globalStats = createEmptyGlobalStats(phrases);
        this.inGameStats = createEmptyInGameStats(phrases);
        this.loadAll();
    }

    loadAll() {
        this.globalStats = this.loadGlobalStats();
        this.inGameStats = this.loadInGameStats();
        return this.getSnapshot();
    }

    getSnapshot() {
        return {
            globalStats: { ...this.globalStats },
            inGameStats: cloneInGameStats(this.inGameStats),
            variantStats: this.computeVariantStatsSnapshot(),
        };
    }

    recordAttempt(phrase: string, isCorrect: boolean) {
        const current = this.ensurePhrase(this.inGameStats, phrase);
        const updated = { ...current };
        updated.totalAttempts += 1;
        if (isCorrect) {
            updated.correctAttempts += 1;
            updated.learned = true;
        } else {
            updated.wrongAttempts += 1;
            updated.learned = false;
        }
        this.inGameStats[phrase] = updated;
        this.saveInGameStats();
        return this.getSnapshot();
    }

    resetVariant() {
        this.inGameStats = createEmptyInGameStats(this.phrases);
        this.saveInGameStats();
        return this.getSnapshot();
    }

    resetGlobal() {
        this.globalStats = createEmptyGlobalStats(this.phrases);
        this.saveGlobalStats();
        return this.getSnapshot();
    }

    finalizeVariant() {
        this.globalStats = this.rebuildGlobalStats();
        this.saveGlobalStats();
        return this.getSnapshot();
    }

    private loadGlobalStats() {
        return this.loadFromStorage(
            GLOBAL_KEY,
            () => createEmptyGlobalStats(this.phrases),
            (parsed) => {
                if (!parsed || typeof parsed !== 'object') return null;
                const incoming = parsed as Record<string, GlobalPhraseStatistics>;
                const merged = createEmptyGlobalStats(this.phrases);
                Object.keys(incoming).forEach((phraseKey) => {
                    const value = incoming[phraseKey];
                    if (
                        value &&
                        typeof value.correctAttempts === 'number' &&
                        typeof value.wrongAttempts === 'number'
                    ) {
                        merged[phraseKey] = {
                            phrase: phraseKey,
                            correctAttempts: value.correctAttempts,
                            wrongAttempts: value.wrongAttempts,
                        };
                    }
                });
                return merged;
            },
        );
    }

    private saveGlobalStats() {
        this.saveToStorage(GLOBAL_KEY, this.globalStats);
    }

    private loadInGameStats() {
        return this.loadFromStorage(
            VARIANT_KEY,
            () => createEmptyInGameStats(this.phrases),
            (parsed) => {
                if (!parsed || typeof parsed !== 'object') return null;
                const incoming = parsed as Record<string, InGamePhraseStatistics>;
                const merged = createEmptyInGameStats(this.phrases);
                Object.keys(incoming).forEach((phraseKey) => {
                    const value = incoming[phraseKey];
                    if (
                        value &&
                        typeof value.totalAttempts === 'number' &&
                        typeof value.correctAttempts === 'number' &&
                        typeof value.wrongAttempts === 'number' &&
                        typeof value.learned === 'boolean'
                    ) {
                        merged[phraseKey] = { ...merged[phraseKey], ...value, phrase: phraseKey };
                    }
                });
                return merged;
            },
        );
    }

    private saveInGameStats() {
        this.saveToStorage(VARIANT_KEY, this.inGameStats);
    }

    private ensurePhrase(
        stats: Record<string, InGamePhraseStatistics>,
        phrase: string,
    ): InGamePhraseStatistics {
        if (!stats[phrase]) {
            stats[phrase] = {
                phrase,
                totalAttempts: 0,
                correctAttempts: 0,
                wrongAttempts: 0,
                learned: false,
            };
        }
        return stats[phrase];
    }

    private computeVariantStatsSnapshot(): GeneralPhraseVariantStats {
        const values = Object.values(this.inGameStats);
        const totalAttempts = values.reduce((sum, item) => sum + item.totalAttempts, 0);
        const correctAttempts = values.reduce((sum, item) => sum + item.correctAttempts, 0);
        const wrongAttempts = values.reduce((sum, item) => sum + item.wrongAttempts, 0);
        const learnedItemsCount = values.filter(
            (item) => item.learned && item.correctAttempts > 0,
        ).length;
        const totalItemsCount = values.length;

        return {
            totalAttempts,
            correctAttempts,
            wrongAttempts,
            learnedItemsCount,
            totalItemsCount,
        };
    }

    private rebuildGlobalStats(): Record<string, GlobalPhraseStatistics> {
        const totals = createEmptyGlobalStats(this.phrases);
        Object.values(this.inGameStats).forEach(({ phrase, correctAttempts, wrongAttempts }) => {
            if (!totals[phrase]) {
                totals[phrase] = {
                    phrase,
                    correctAttempts: 0,
                    wrongAttempts: 0,
                };
            }
            totals[phrase].correctAttempts += correctAttempts;
            totals[phrase].wrongAttempts += wrongAttempts;
        });
        return totals;
    }
}
