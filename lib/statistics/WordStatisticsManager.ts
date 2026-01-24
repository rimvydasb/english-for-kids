import {
    BaseStatisticsManager,
    GlobalStatsMap,
    InGameAggregatedStatistics,
    InGameStatsMap,
    StorageLike,
} from '@/lib/statistics/AStatisticsManager';
import {WordRecord} from '@/lib/types';

export interface WordStatisticsState {
    inGameStats: InGameStatsMap;
    aggregated: InGameAggregatedStatistics;
    globalStats: GlobalStatsMap;
}

export class WordStatisticsManager extends BaseStatisticsManager {
    constructor(
        words: WordRecord[],
        storageKey: string,
        globalStorageKey: string,
        storage?: StorageLike,
    ) {
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
