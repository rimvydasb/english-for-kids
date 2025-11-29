import { WordCardMode } from '@/components/WordCard';

export type GameVariant = 'guessTheWord' | 'listenAndGuess';
export type OptionMode = 'word' | 'translation';

export interface WordStatistics {
    word: string;
    learned: boolean;
    totalAttempts: number;
    correctAttempts: number;
    wrongAttempts: number;
}

export interface VariantStats {
    totalAttempts: number;
    correctAttempts: number;
    wrongAttempts: number;
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
