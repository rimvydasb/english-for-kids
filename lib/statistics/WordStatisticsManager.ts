import { VARIANT_CONFIG } from '@/lib/guessConfig';
import { GameVariant, WordRecord } from '@/lib/types';
import {
    AStatisticsManager,
    GeneralPhraseVariantStats,
    GlobalStatsMap,
    InGameStatsMap,
    StorageLike,
} from '@/lib/statistics/AStatisticsManager';

export interface WordStatisticsSnapshot {
    globalStats: GlobalStatsMap;
    variantStats: Record<GameVariant, GeneralPhraseVariantStats>;
    variantWordStats: Record<GameVariant, InGameStatsMap>;
}

export class WordStatisticsManager extends AStatisticsManager {
    private words: WordRecord[];

    private globalStats: GlobalStatsMap;

    private variantWordStats: Record<GameVariant, InGameStatsMap>;

    constructor(words: WordRecord[], storage?: StorageLike) {
        super(storage);
        this.words = words;
        this.globalStats = this.createEmptyGlobalStats(words);
        this.variantWordStats = {
            guessTheWord: this.createEmptyInGameStats(words),
            listenAndGuess: this.createEmptyInGameStats(words),
        };
        this.loadAll();
    }

    loadAll(): WordStatisticsSnapshot {
        this.globalStats = this.loadGlobalStats();
        this.variantWordStats = this.loadVariantWordStats();
        return this.getSnapshot();
    }

    getSnapshot(): WordStatisticsSnapshot {
        return {
            globalStats: this.cloneGlobalStats(this.globalStats),
            variantStats: this.computeVariantStatsSnapshot(),
            variantWordStats: this.cloneVariantStats(),
        };
    }

    getGlobalStats() {
        return this.cloneGlobalStats(this.globalStats);
    }

    recordAttempt(variant: GameVariant, word: string, isCorrect: boolean): WordStatisticsSnapshot {
        const variantWordStats = this.variantWordStats[variant];
        const updated = this.ensureInGameEntry(variantWordStats, word);

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

    resetVariant(variant: GameVariant): WordStatisticsSnapshot {
        this.variantWordStats[variant] = this.createEmptyInGameStats(this.words);
        this.saveVariantWordStats(variant);
        return this.getSnapshot();
    }

    resetGlobal(): WordStatisticsSnapshot {
        this.globalStats = this.createEmptyGlobalStats(this.words);
        this.saveGlobalStats();
        return this.getSnapshot();
    }

    finalizeVariant(): WordStatisticsSnapshot {
        this.globalStats = this.rebuildGlobalFromVariants(this.variantWordStats, this.words);
        this.saveGlobalStats();
        return this.getSnapshot();
    }

    private cloneVariantStats(): Record<GameVariant, InGameStatsMap> {
        return {
            guessTheWord: this.cloneInGameStats(this.variantWordStats.guessTheWord),
            listenAndGuess: this.cloneInGameStats(this.variantWordStats.listenAndGuess),
        };
    }

    private loadGlobalStats() {
        return this.loadFromStorage(
            'GLOBAL_WORD_STATS',
            () => this.createEmptyGlobalStats(this.words),
            (parsed) => this.sanitizeGlobalStats(parsed, this.words),
        );
    }

    private saveGlobalStats() {
        this.saveToStorage('GLOBAL_WORD_STATS', this.globalStats);
    }

    private loadVariantWordStats(): Record<GameVariant, InGameStatsMap> {
        const result: Record<GameVariant, InGameStatsMap> = {
            guessTheWord: this.createEmptyInGameStats(this.words),
            listenAndGuess: this.createEmptyInGameStats(this.words),
        };

        (Object.keys(VARIANT_CONFIG) as GameVariant[]).forEach((variant) => {
            const key = VARIANT_CONFIG[variant].statsKey;
            result[variant] = this.loadFromStorage(
                key,
                () => this.createEmptyInGameStats(this.words),
                (parsed) => this.sanitizeInGameStats(parsed, this.words),
            );
        });

        return result;
    }

    private saveVariantWordStats(variant: GameVariant) {
        const key = VARIANT_CONFIG[variant].statsKey;
        this.saveToStorage(key, this.variantWordStats[variant]);
    }

    private computeVariantStatsSnapshot(): Record<GameVariant, GeneralPhraseVariantStats> {
        return {
            guessTheWord: this.computeVariantStats(this.variantWordStats.guessTheWord),
            listenAndGuess: this.computeVariantStats(this.variantWordStats.listenAndGuess),
        };
    }
}
