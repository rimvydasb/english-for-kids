import { GameManager, GameManagerOptions } from '@/lib/game/GameManager';
import { StorageLike } from '@/lib/statistics/AStatisticsManager';
import { WordStatisticsManager } from '@/lib/statistics/WordStatisticsManager';
import { WordGameVariant, WordRecord } from '@/lib/types';

abstract class BaseWordsGameManager extends GameManager<WordRecord> {
    private readonly variant: WordGameVariant;

    protected constructor(
        subjects: WordRecord[],
        variant: WordGameVariant,
        options?: GameManagerOptions<WordRecord>,
        storage?: StorageLike,
    ) {
        const statistics = new WordStatisticsManager(subjects, variant, storage);
        super(subjects, statistics, { groupBy: (record) => record.type, ...options });
        this.variant = variant;
    }

    getVariant(): WordGameVariant {
        return this.variant;
    }
}

export class GuessTheWordGameManager extends BaseWordsGameManager {
    constructor(subjects: WordRecord[], options?: GameManagerOptions<WordRecord>, storage?: StorageLike) {
        super(subjects, 'guessTheWord', options, storage);
    }
}

export class ListenAndGuessGameManager extends BaseWordsGameManager {
    constructor(subjects: WordRecord[], options?: GameManagerOptions<WordRecord>, storage?: StorageLike) {
        super(subjects, 'listenAndGuess', options, storage);
    }
}
