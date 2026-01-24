export type OptionMode = 'word' | 'translation';

export enum WordCardMode {
    Learning = 'learning',
    GuessWord = 'guessWord',
    ListenAndGuess = 'listenAndGuess',
}

export interface GameRules {
    name: string;
    variant: GameVariant;
    storageKey: string;
    globalStorageKey: string;
    wordCardMode?: WordCardMode;
    showImage: boolean;
    showTranslation: boolean;
    showWord: boolean;
    showWordPronunciation: boolean;
    options: OptionMode;
    optionPronunciation: boolean;
}

export const DEFAULT_RULES: Partial<GameRules> = {
    wordCardMode: WordCardMode.Learning,
    showImage: true,
    showTranslation: true,
    showWord: true,
    showWordPronunciation: true,
};

export type GameVariant = 'guessTheWord' | 'listenAndGuess' | 'guessPhrase';

export type WordGameVariant = Extract<GameVariant, 'guessTheWord' | 'listenAndGuess'>;

export interface GlobalStatistics {
    key: string;
    correctAttempts: number;
    wrongAttempts: number;
}

export interface InGameStatistics extends GlobalStatistics {
    totalAttempts: number;
    learned: boolean;
}

export interface WordEntry {
    word: string;
    translation?: string;
    examples?: string[];
    type: 'noun' | 'verb' | 'adjective' | 'color' | 'number';
    imageFile?: string;

    // Optional display override
    displayAs?: string;
}

export abstract class SubjectRecord {
    abstract getSubjectType(): 'word' | 'phrase';

    abstract getSubject(): string;

    abstract getTranslation(): string | undefined;
}

export class WordRecord extends SubjectRecord {
    word: string;

    translation?: string;

    examples?: string[];

    type: WordEntry['type'];

    imageFile?: string;

    entry: WordEntry;

    constructor(entry: WordEntry) {
        super();
        this.entry = entry;
        this.word = entry.word;
        this.translation = entry.translation;
        this.examples = entry.examples;
        this.type = entry.type;
        this.imageFile = entry.imageFile;
    }

    getSubjectType(): 'word' | 'phrase' {
        return 'word';
    }

    getSubject(): string {
        return this.word;
    }

    getImageUrl(): string | null {
        if (this.type === 'number') return null;
        return `/images/${this.imageFile || this.word + '.png'}`;
    }

    getTranslation(): string | undefined {
        return this.translation;
    }
}

export interface PhraseEntry {
    phrase: string;
    translation?: string;
}

export class PhraseRecord extends SubjectRecord {
    phrase: string;

    translation?: string;

    // Alias to interop with speech helpers that expect `word`.
    word: string;

    constructor(entry: PhraseEntry) {
        super();
        this.translation = entry.translation;
        this.phrase = entry.phrase;
        this.word = entry.phrase;
    }

    getSubjectType(): 'word' | 'phrase' {
        return 'phrase';
    }

    getSubject(): string {
        return this.phrase;
    }

    getTranslation(): string | undefined {
        return this.translation;
    }
}
