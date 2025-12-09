import { getGameSettings } from '@/lib/Config';
import {
    BaseStatisticsManager,
    GlobalStatsMap,
    InGameAggregatedStatistics,
    InGameStatsMap,
    StorageLike,
} from '@/lib/statistics/AStatisticsManager';
import { WordGameVariant, WordRecord } from '@/lib/types';

export interface WordStatisticsState {
    inGameStats: InGameStatsMap;
    aggregated: InGameAggregatedStatistics;
    globalStats: GlobalStatsMap;
}

export class WordStatisticsManager extends BaseStatisticsManager {
    constructor(words: WordRecord[], variant: WordGameVariant, storage?: StorageLike) {
        const { storageKey, globalStorageKey } = getGameSettings(variant);
        super(words, storageKey, globalStorageKey, storage);
    }

    loadState(): WordStatisticsState {
        const inGameStats = this.loadInGameStatistics();
        return {
            inGameStats,
            aggregated: this.aggregate(inGameStats),
            globalStats: this.loadGlobalStatistics(),
        };
    }
}
