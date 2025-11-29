import { WordCardMode } from '@/components/WordCard';

export type GameVariant = 'guessTheWord' | 'listenAndGuess';
export type OptionMode = 'word' | 'translation';

export interface GlobalWordStatistics {
    word: string;
    correctAttempts: number;
    wrongAttempts: number;
}

export interface WordStatistics extends GlobalWordStatistics {
    word: string;
    totalAttempts: number;
    learned: boolean;
}

export interface VariantStats {
    totalAttempts: number;
    correctAttempts: number;
    wrongAttempts: number;
    learnedWordsCount: number;
    totalWordsCount: number;
}

export const VARIANT_CONFIG: Record<
    GameVariant,
    { label: string; cardMode: WordCardMode; optionMode: OptionMode; statsKey: string }
> = {
    guessTheWord: {
        label: 'Guess The Word',
        cardMode: WordCardMode.GuessWord,
        optionMode: 'word',
        statsKey: 'GUESS_THE_WORD_STATS',
    },
    listenAndGuess: {
        label: 'Listen & Guess',
        cardMode: WordCardMode.ListenAndGuess,
        optionMode: 'translation',
        statsKey: 'LISTEN_AND_GUESS_STATS',
    },
};
