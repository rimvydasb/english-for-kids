// @Todo: move to lib/types.ts - create if not exists
export interface WordEntry {
    word: string;
    translation?: string;
    examples?: string[];
    type: 'noun' | 'verb' | 'adjective' | 'color';
}

// @Todo: move to lib/types.ts - create if not exists
export class WordRecord {
    word: string;
    translation?: string;
    examples?: string[];
    type: WordEntry['type'];

    constructor(entry: WordEntry) {
        this.word = entry.word;
        this.translation = entry.translation;
        this.examples = entry.examples;
        this.type = entry.type;
    }

    getImageUrl(): string {
        return `/images/${this.word}.png`;
    }
}

// @Todo: this is a completely different configuration, so move it to WORDS_DICTIONARY_DATA.ts
export const WORDS_DICTIONARY_DATA: WordEntry[] = [
    {
        word: 'apple',
        translation: 'obuolys',
        examples: ['The apple is red.'],
        type: 'noun',
    },
    {
        word: 'baloon',
        translation: 'balionas',
        examples: ['The baloon floats in the sky.'],
        type: 'noun',
    },
    {
        word: 'black',
        translation: 'juodas',
        examples: ['The cat is black.'],
        type: 'color',
    },
    {
        word: 'brown',
        translation: 'rudas',
        examples: ['The desk is brown.'],
        type: 'color',
    },
    {
        word: 'cat',
        translation: 'katė',
        examples: ['The cat naps on the mat.'],
        type: 'noun',
    },
    {
        word: 'crayon',
        translation: 'kreidelė',
        examples: ['I draw with a crayon.'],
        type: 'noun',
    },
    {
        word: 'desk',
        translation: 'rašomasis stalas',
        examples: ['My desk is tidy.'],
        type: 'noun',
    },
    {
        word: 'dog',
        translation: 'šuo',
        examples: ['The dog wags its tail.'],
        type: 'noun',
    },
    {
        word: 'egg',
        translation: 'kiaušinis',
        examples: ['I cooked an egg.'],
        type: 'noun',
    },
    {
        word: 'elephant',
        translation: 'dramblys',
        examples: ['The elephant has big ears.'],
        type: 'noun',
    },
    {
        word: 'farm',
        translation: 'ferma',
        examples: ['The farm has many animals.'],
        type: 'noun',
    },
    {
        word: 'fish',
        translation: 'žuvis',
        examples: ['The fish swims in the pond.'],
        type: 'noun',
    },
    {
        word: 'green',
        translation: 'žalias',
        examples: ['Grass is green.'],
        type: 'color',
    },
    {
        word: 'notebook',
        translation: 'sąsiuvinis',
        examples: ['I write in my notebook.'],
        type: 'noun',
    },
    {
        word: 'pencil',
        translation: 'pieštukas',
        examples: ['Sharpen the pencil.'],
        type: 'noun',
    },
    {
        word: 'pink',
        translation: 'rožinis',
        examples: ['The flower is pink.'],
        type: 'color',
    },
    {
        word: 'plain',
        translation: 'lyguma',
        examples: ['A wide plain stretches to the horizon.'],
        type: 'noun',
    },
    {
        word: 'puppet',
        translation: 'lėlė',
        examples: ['The puppet waves hello.'],
        type: 'noun',
    },
    {
        word: 'purple',
        translation: 'violetinis',
        examples: ['The hat is purple.'],
        type: 'color',
    },
    {
        word: 'red',
        translation: 'raudonas',
        examples: ['The balloon is red.'],
        type: 'color',
    },
    {
        word: 'teddy',
        translation: 'meškiukas',
        examples: ['I hug my teddy.'],
        type: 'noun',
    },
    {
        word: 'white',
        translation: 'baltas',
        examples: ['The clouds are white.'],
        type: 'color',
    },
    {
        word: 'yellow',
        translation: 'geltonas',
        examples: ['The sun looks yellow.'],
        type: 'color',
    },
];

export const WORDS_DICTIONARY: WordRecord[] = WORDS_DICTIONARY_DATA.map(
    (entry) => new WordRecord(entry),
);
