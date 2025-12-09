export type OptionMode = 'word' | 'translation';

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
    type: 'noun' | 'verb' | 'adjective' | 'color';
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

    constructor(entry: WordEntry) {
        super();
        this.word = entry.word;
        this.translation = entry.translation;
        this.examples = entry.examples;
        this.type = entry.type;
    }

    getSubjectType(): 'word' | 'phrase' {
        return 'word';
    }

    getSubject(): string {
        return this.word;
    }

    getImageUrl(): string {
        return `/images/${this.word}.png`;
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
