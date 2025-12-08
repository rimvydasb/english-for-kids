import { GameManager, GameManagerOptions } from '@/lib/game/GameManager';
import { PhrasesStatisticsManager } from '@/lib/statistics/PhrasesStatisticsManager';
import { StorageLike } from '@/lib/statistics/AStatisticsManager';
import { GameVariant, PhraseRecord } from '@/lib/types';

export class PhasesGameManager extends GameManager<PhraseRecord> {
    constructor(subjects: PhraseRecord[], options?: GameManagerOptions<PhraseRecord>, storage?: StorageLike) {
        const statistics = new PhrasesStatisticsManager(subjects, storage);
        super(subjects, statistics, options);
    }

    getVariant(): GameVariant {
        return 'guessPhrase';
    }
}
