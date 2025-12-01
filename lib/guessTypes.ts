// @Todo: rename this file to lib/types.ts

import { WordCardMode } from '@/components/WordCard';
import {InGameStatistics} from "@/lib/PhrasesStatisticsManager";

export type GameVariant = 'guessTheWord' | 'listenAndGuess';
export type OptionMode = 'word' | 'translation';

// @Todo: move to lib/types.ts - create if not exists
export interface GlobalWordStatistics {
    word: string;
    correctAttempts: number;
    wrongAttempts: number;
}

// @Todo: move to lib/types.ts - create if not exists
export interface WordStatistics extends GlobalWordStatistics, InGameStatistics {

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
