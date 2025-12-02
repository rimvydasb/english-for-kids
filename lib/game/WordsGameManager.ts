import {
    GameManager,
    GameManagerOptions,
    GameStatisticsAdapter,
} from '@/lib/game/GameManager';
import { GameVariant, InGameStatistics, WordRecord } from '@/lib/types';
import { StorageLike } from '@/lib/statistics/AStatisticsManager';
import {
    WordStatisticsManager,
    WordStatisticsSnapshot,
} from '@/lib/statistics/WordStatisticsManager';

export class WordsGameManager extends GameManager<WordRecord, WordStatisticsSnapshot> {
    private readonly variant: GameVariant;

    constructor(
        subjects: WordRecord[],
        variant: GameVariant,
        options?: GameManagerOptions<WordRecord>,
        storage?: StorageLike,
    ) {
        const manager = new WordStatisticsManager(subjects, storage);
        super(subjects, WordsGameManager.createAdapter(manager, variant), options);
        this.variant = variant;
    }

    private static createAdapter(
        manager: WordStatisticsManager,
        variant: GameVariant,
    ): GameStatisticsAdapter<WordStatisticsSnapshot> {
        return {
            loadAll: () => manager.loadAll(),
            recordAttempt: (subject: string, isCorrect: boolean) =>
                manager.recordAttempt(variant, subject, isCorrect),
            finalizeVariant: () => manager.finalizeVariant(),
            resetVariant: () => manager.resetVariant(variant),
            resetGlobal: () => manager.resetGlobal(),
            getInGameStats: (snapshot: WordStatisticsSnapshot): Record<string, InGameStatistics> =>
                snapshot.variantWordStats[variant],
            getGlobalStats: (snapshot: WordStatisticsSnapshot) => snapshot.globalStats,
        };
    }

    getVariantStats(): WordStatisticsSnapshot['variantStats'][GameVariant] {
        return this.getSnapshot().variantStats[this.variant];
    }

    getVariantWordStats(): Record<string, InGameStatistics> {
        return this.getSnapshot().variantWordStats[this.variant];
    }
}
