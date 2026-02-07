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
    totalInGameSubjectsToLearn: number;
    selectedWordEntryTypes: WordEntryType[];
    useSelectedWords?: boolean;
}

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

export type WordEntryType = 'noun' | 'verb' | 'adjective' | 'color' | 'number';

export interface WordEntry {
    word: string;
    translation?: string;
    examples?: string[];
    type: WordEntryType;
    imageFile?: string;

    // Optional display override
    displayAs?: string;

    // when the word was added to the learning list
    addedAt?: number;
}

export abstract class SubjectRecord {
    abstract getSubjectType(): 'word' | 'phrase';

    abstract getSubject(): string;

    abstract getTranslation(): string | undefined;
}

export class OptionRecord extends SubjectRecord {

    private copy: SubjectRecord;

    public readonly isExtra: boolean;

    public readonly isAnswer: boolean;

    public readonly key: string;

    constructor(copy: SubjectRecord, isExtra: boolean, isAnswer: boolean) {
        super();
        this.key = "key-" + copy.getSubject();
        this.copy = copy;
        this.isExtra = isExtra;
        this.isAnswer = isAnswer;
    }

    getSubjectType(): 'word' | 'phrase' {
        return this.copy.getSubjectType();
    }

    getSubject(): string {
        return this.copy.getSubject();
    }

    getTranslation(): string | undefined {
        return this.copy.getTranslation();
    }
}

export class WordRecord extends SubjectRecord {
    word: string;

    translation?: string;

    examples?: string[];

    type: WordEntryType;

    imageFile?: string;

    displayAs?: string;

    addedAt?: number;

    constructor(entry: WordEntry) {
        super();
        this.word = entry.word;
        this.translation = entry.translation;
        this.examples = entry.examples;
        this.type = entry.type;
        this.imageFile = entry.imageFile;
        this.displayAs = entry.displayAs;
        this.addedAt = entry.addedAt;
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
