import { getGameSettings } from '@/lib/Config';
import {
    BaseStatisticsManager,
    GlobalStatsMap,
    InGameAggregatedStatistics,
    InGameStatsMap,
    StorageLike,
} from '@/lib/statistics/AStatisticsManager';
import { PhraseRecord } from '@/lib/types';

export interface PhraseStatisticsState {
    inGameStats: InGameStatsMap;
    aggregated: InGameAggregatedStatistics;
    globalStats: GlobalStatsMap;
}

export class PhrasesStatisticsManager extends BaseStatisticsManager {
    constructor(phrases: PhraseRecord[], storage?: StorageLike) {
        const { storageKey, globalStorageKey } = getGameSettings('guessPhrase');
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
