import {GameManager} from '@/lib/game/GameManager';
import {StorageLike} from '@/lib/statistics/AStatisticsManager';
import {WordStatisticsManager} from '@/lib/statistics/WordStatisticsManager';
import {GameRules, WordCardMode, WordRecord} from '@/lib/types';
import {WORDS_DICTIONARY} from '@/lib/words';

abstract class BaseWordsGameManager extends GameManager<WordRecord> {
    protected constructor(subjects: WordRecord[] = WORDS_DICTIONARY, storage?: StorageLike) {
        // We pass a placeholder for statistics because we need to access this.getGameRules()
        // to determine the variant, which is required to create the real statistics manager.
        // GameManager constructor does not use statistics, so this is safe.
        super(subjects, null as unknown as WordStatisticsManager, {groupBy: (record) => record.type});

        const rules = this.getGameRules();
        this.statistics = new WordStatisticsManager(subjects, rules.storageKey, rules.globalStorageKey, storage);
    }

    abstract getGameRules(): GameRules;
}

export class GuessTheWordGameManager extends BaseWordsGameManager {
    constructor(subjects?: WordRecord[], storage?: StorageLike) {
        super(subjects, storage);
    }

    getGameRules(): GameRules {
        return {
            name: 'Guess The Word',
            variant: 'guessTheWord',
            storageKey: 'GUESS_THE_WORD_GAME_STATS',
            globalStorageKey: 'GLOBAL_WORD_STATS',
            wordCardMode: WordCardMode.GuessWord,
            showImage: true,
            showTranslation: true,
            showWord: false,
            showWordPronunciation: false,
            options: 'word',
            optionPronunciation: true,
        };
    }
}

export class ListenAndGuessGameManager extends BaseWordsGameManager {
    constructor(subjects?: WordRecord[], storage?: StorageLike) {
        super(subjects, storage);
    }

    getGameRules(): GameRules {
        return {
            name: 'Listen & Guess',
            variant: 'listenAndGuess',
            storageKey: 'LISTEN_AND_GUESS_GAME_STATS',
            globalStorageKey: 'GLOBAL_WORD_STATS',
            wordCardMode: WordCardMode.ListenAndGuess,
            showImage: false,
            showTranslation: false,
            showWord: false,
            showWordPronunciation: true,
            options: 'translation',
            optionPronunciation: false,
        };
    }
}
