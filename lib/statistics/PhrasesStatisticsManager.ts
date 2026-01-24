import {
    BaseStatisticsManager,
    GlobalStatsMap,
    InGameAggregatedStatistics,
    InGameStatsMap,
    StorageLike,
} from '@/lib/statistics/AStatisticsManager';
import {PhraseRecord} from '@/lib/types';

export interface PhraseStatisticsState {
    inGameStats: InGameStatsMap;
    aggregated: InGameAggregatedStatistics;
    globalStats: GlobalStatsMap;
}

export class PhrasesStatisticsManager extends BaseStatisticsManager {
    constructor(phrases: PhraseRecord[], storageKey: string, globalStorageKey: string, storage?: StorageLike) {
        super(phrases, storageKey, globalStorageKey, storage);
    }

    loadState(): PhraseStatisticsState {
        const inGameStats = this.loadInGameStatistics();
        return {
            inGameStats,
            aggregated: this.aggregate(inGameStats),
            globalStats: this.loadGlobalStatistics(),
        };
    }
}
