import { WordRecord } from '@/lib/words';
import {
    GameVariant,
    GlobalWordStatistics,
    VARIANT_CONFIG,
    WordStatistics,
} from '@/lib/guessTypes';
import {
    AStatisticsManager,
    GeneralPhraseVariantStats,
    StorageLike,
} from '@/lib/statistics/AStatisticsManager';

const GLOBAL_KEY = 'GLOBAL_WORD_STATS';

const createEmptyGlobalStats = (words: WordRecord[]): Record<string, GlobalWordStatistics> =>
    words.reduce<Record<string, GlobalWordStatistics>>((acc, item) => {
        acc[item.word] = {
            word: item.word,
            correctAttempts: 0,
            wrongAttempts: 0,
        };
        return acc;
    }, {});

const createEmptyWordStats = (words: WordRecord[]): Record<string, WordStatistics> =>
    words.reduce<Record<string, WordStatistics>>((acc, item) => {
        acc[item.word] = {
            word: item.word,
            learned: false,
            totalAttempts: 0,
            correctAttempts: 0,
            wrongAttempts: 0,
        };
        return acc;
    }, {});

const cloneWordStats = (stats: Record<string, WordStatistics>) =>
    Object.keys(stats).reduce<Record<string, WordStatistics>>((acc, key) => {
        acc[key] = { ...stats[key] };
        return acc;
    }, {});

const cloneVariantWordStats = (stats: Record<GameVariant, Record<string, WordStatistics>>) => ({
    guessTheWord: cloneWordStats(stats.guessTheWord),
    listenAndGuess: cloneWordStats(stats.listenAndGuess),
});

export class WordStatisticsManager extends AStatisticsManager {
    private words: WordRecord[];

    private globalStats: Record<string, GlobalWordStatistics>;

    private variantWordStats: Record<GameVariant, Record<string, WordStatistics>>;

    constructor(words: WordRecord[], storage?: StorageLike) {
        super(storage);
        this.words = words;
        this.globalStats = createEmptyGlobalStats(words);
        this.variantWordStats = {
            guessTheWord: createEmptyWordStats(words),
            listenAndGuess: createEmptyWordStats(words),
        };
        this.loadAll();
    }

    loadAll() {
        this.globalStats = this.loadGlobalStats();
        this.variantWordStats = this.loadVariantWordStats();
        return this.getSnapshot();
    }

    getSnapshot() {
        return {
            globalStats: { ...this.globalStats },
            variantStats: this.computeVariantStatsSnapshot(),
            variantWordStats: cloneVariantWordStats(this.variantWordStats),
        };
    }

    getGlobalStats() {
        return { ...this.globalStats };
    }

    recordAttempt(variant: GameVariant, word: string, isCorrect: boolean) {
        const variantWordStats = this.variantWordStats[variant];
        const updated = this.ensureVariantWord(variantWordStats, word);

        updated.totalAttempts += 1;
        if (isCorrect) {
            updated.correctAttempts += 1;
            updated.learned = true;
        } else {
            updated.wrongAttempts += 1;
            updated.learned = false;
        }

        variantWordStats[word] = updated;
        this.variantWordStats[variant] = variantWordStats;
        this.saveVariantWordStats(variant);

        return this.getSnapshot();
    }

    resetVariant(variant: GameVariant) {
        this.variantWordStats[variant] = createEmptyWordStats(this.words);
        this.saveVariantWordStats(variant);
        return this.getSnapshot();
    }

    resetGlobal() {
        this.globalStats = createEmptyGlobalStats(this.words);
        this.saveGlobalStats();
        return this.getSnapshot();
    }

    finalizeVariant() {
        this.globalStats = this.rebuildGlobalStats();
        this.saveGlobalStats();
        return this.getSnapshot();
    }

    private ensureVariantWord(stats: Record<string, WordStatistics>, word: string): WordStatistics {
        if (!stats[word]) {
            stats[word] = {
                word,
                learned: false,
                totalAttempts: 0,
                correctAttempts: 0,
                wrongAttempts: 0,
            };
        }
        return { ...stats[word] };
    }

    private loadGlobalStats() {
        return this.loadFromStorage(
            GLOBAL_KEY,
            () => createEmptyGlobalStats(this.words),
            (parsed) => {
                if (!parsed || typeof parsed !== 'object') return null;
                const incoming = parsed as Record<string, GlobalWordStatistics>;
                const fresh = createEmptyGlobalStats(this.words);
                Object.keys(incoming).forEach((key) => {
                    const value = incoming[key];
                    if (
                        value &&
                        typeof value.correctAttempts === 'number' &&
                        typeof value.wrongAttempts === 'number'
                    ) {
                        fresh[key] = {
                            word: key,
                            correctAttempts: value.correctAttempts,
                            wrongAttempts: value.wrongAttempts,
                        };
                    }
                });
                return fresh;
            },
        );
    }

    private saveGlobalStats() {
        this.saveToStorage(GLOBAL_KEY, this.globalStats);
    }

    private loadVariantWordStats(): Record<GameVariant, Record<string, WordStatistics>> {
        const result: Record<GameVariant, Record<string, WordStatistics>> = {
            guessTheWord: createEmptyWordStats(this.words),
            listenAndGuess: createEmptyWordStats(this.words),
        };

        (Object.keys(VARIANT_CONFIG) as GameVariant[]).forEach((variant) => {
            const key = VARIANT_CONFIG[variant].statsKey;
            result[variant] = this.loadFromStorage(
                key,
                () => createEmptyWordStats(this.words),
                (parsed) => {
                    if (!parsed || typeof parsed !== 'object') return null;
                    const incoming = parsed as Record<string, WordStatistics>;
                    const merged = createEmptyWordStats(this.words);
                    Object.keys(incoming).forEach((wordKey) => {
                        const value = incoming[wordKey];
                        if (
                            value &&
                            typeof value.totalAttempts === 'number' &&
                            typeof value.correctAttempts === 'number' &&
                            typeof value.wrongAttempts === 'number' &&
                            typeof value.learned === 'boolean'
                        ) {
                            merged[wordKey] = { ...merged[wordKey], ...value, word: wordKey };
                        }
                    });
                    return merged;
                },
            );
        });

        return result;
    }

    private saveVariantWordStats(variant: GameVariant) {
        const key = VARIANT_CONFIG[variant].statsKey;
        this.saveToStorage(key, this.variantWordStats[variant]);
    }

    private computeVariantStatsSnapshot(): Record<GameVariant, GeneralPhraseVariantStats> {
        const compute = (stats: Record<string, WordStatistics>): GeneralPhraseVariantStats => {
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
        };

        return {
            guessTheWord: compute(this.variantWordStats.guessTheWord),
            listenAndGuess: compute(this.variantWordStats.listenAndGuess),
        };
    }

    private rebuildGlobalStats(): Record<string, GlobalWordStatistics> {
        const totals = createEmptyGlobalStats(this.words);
        (Object.keys(this.variantWordStats) as GameVariant[]).forEach((variant) => {
            Object.values(this.variantWordStats[variant]).forEach(
                ({ word, correctAttempts, wrongAttempts }) => {
                    if (!totals[word]) {
                        totals[word] = { word, correctAttempts: 0, wrongAttempts: 0 };
                    }
                    totals[word].correctAttempts += correctAttempts;
                    totals[word].wrongAttempts += wrongAttempts;
                },
            );
        });
        return totals;
    }
}
