import { WordCardMode } from '@/components/WordCard';
import { getGameSettings } from '@/lib/Config';
import { GameVariant, OptionMode, WordGameVariant } from '@/lib/types';

export interface GuessVariantConfig {
    label: string;
    cardMode: WordCardMode;
    optionMode: OptionMode;
    storageKey: string;
    globalStorageKey: string;
}

export const VARIANT_CONFIG: Record<WordGameVariant, GuessVariantConfig> = {
    guessTheWord: {
        label: 'Guess The Word',
        cardMode: WordCardMode.GuessWord,
        optionMode: 'word',
        storageKey: getGameSettings('guessTheWord').storageKey,
        globalStorageKey: getGameSettings('guessTheWord').globalStorageKey,
    },
    listenAndGuess: {
        label: 'Listen & Guess',
        cardMode: WordCardMode.ListenAndGuess,
        optionMode: 'translation',
        storageKey: getGameSettings('listenAndGuess').storageKey,
        globalStorageKey: getGameSettings('listenAndGuess').globalStorageKey,
    },
};

export type { GameVariant, OptionMode, WordGameVariant };
