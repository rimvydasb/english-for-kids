import {
    GameManager,
    GameManagerOptions,
    GameStatisticsAdapter,
} from '@/lib/game/GameManager';
import { InGameStatistics, PhraseRecord } from '@/lib/types';
import { StorageLike } from '@/lib/statistics/AStatisticsManager';
import {
    PhraseStatisticsSnapshot,
    PhrasesStatisticsManager,
} from '@/lib/statistics/PhrasesStatisticsManager';

export class PhasesGameManager extends GameManager<PhraseRecord, PhraseStatisticsSnapshot> {
    constructor(subjects: PhraseRecord[], options?: GameManagerOptions<PhraseRecord>, storage?: StorageLike) {
        const manager = new PhrasesStatisticsManager(subjects, storage);
        super(subjects, PhasesGameManager.createAdapter(manager), options);
    }

    private static createAdapter(
        manager: PhrasesStatisticsManager,
    ): GameStatisticsAdapter<PhraseStatisticsSnapshot> {
        return {
            loadAll: () => manager.loadAll(),
            recordAttempt: (subject: string, isCorrect: boolean) =>
                manager.recordAttempt(subject, isCorrect),
            finalizeVariant: () => manager.finalizeVariant(),
            resetVariant: () => manager.resetVariant(),
            resetGlobal: () => manager.resetGlobal(),
            getInGameStats: (snapshot: PhraseStatisticsSnapshot): Record<string, InGameStatistics> =>
                snapshot.inGameStats,
            getGlobalStats: (snapshot: PhraseStatisticsSnapshot) => snapshot.globalStats,
        };
    }
}
