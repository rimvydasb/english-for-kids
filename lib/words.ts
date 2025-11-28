export interface WordEntry {
    word: string;
    translation?: string;
    examples?: string[];
}

export class WordRecord {
    word: string;
    translation?: string;
    examples?: string[];

    constructor(entry: WordEntry) {
        this.word = entry.word;
        this.translation = entry.translation;
        this.examples = entry.examples;
    }

    getImageUrl(): string {
        return `/images/${this.word}.png`;
    }
}

export const WORDS_DICTIONARY_DATA: WordEntry[] = [
    {word: 'apple', translation: 'obuolys', examples: ['A red apple.']},
    {word: 'crayon', translation: 'kreidelė', examples: ['I draw with a crayon.']},
    {word: 'desk', translation: 'rašomasis stalas', examples: ['My desk is tidy.']},
    {word: 'dog', translation: 'šuo', examples: ['The dog is barking.']},
    {word: 'egg', translation: 'kiaušinis', examples: ['Boil an egg.']},
    {word: 'farm', translation: 'ferma', examples: ['She lives on a farm.']},
    {word: 'fish', translation: 'žuvis', examples: ['The fish swims fast.']},
    {word: 'painting', translation: 'paveikslas', examples: ['The painting is colorful.']},
    {word: 'pencil', translation: 'pieštukas', examples: ['Sharpen the pencil.']},
];

export const WORDS_DICTIONARY: WordRecord[] = WORDS_DICTIONARY_DATA.map(
    (entry) => new WordRecord(entry),
);
