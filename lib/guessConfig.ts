import { WordCardMode } from '@/components/WordCard';
import { GameVariant, OptionMode } from '@/lib/types';

export interface GuessVariantConfig {
    label: string;
    cardMode: WordCardMode;
    optionMode: OptionMode;
    statsKey: string;
}

export const VARIANT_CONFIG: Record<GameVariant, GuessVariantConfig> = {
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

export type { GameVariant, OptionMode };
