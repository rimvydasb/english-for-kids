import {PhraseEntry, PhraseRecord, WordEntry, WordRecord} from '@/lib/types';

export const PHRASES_DICTIONARY_DATA: PhraseEntry[] = [
    { phrase: 'The Hello Song', translation: 'Pasisveikinimo daina' },
    { phrase: 'Hello', translation: 'Labas' },
    { phrase: 'Hello, hello', translation: 'Labas, labas' },
    { phrase: 'How are you today?', translation: 'Kaip šiandien sekasi?' },
    { phrase: 'How are you?', translation: 'Kaip tu laikaisi?' },
    { phrase: 'And how about you?', translation: 'O kaip tau?' },
    { phrase: 'How about you?', translation: 'O kaip tu? / O tavo?' },
    { phrase: "I'm fine, thank you", translation: 'Man viskas gerai, ačiū' },
    { phrase: "I'm fine, thank you.", translation: 'Puikiai, ačiū.' },
    { phrase: "What's your name?", translation: 'Koks tavo vardas?' },
    { phrase: 'My name is Ariele', translation: 'Mano vardas yra Arielė' },
    { phrase: 'Goodbye!', translation: 'Viso gero!' },
    { phrase: "What's your favourite colour?", translation: 'Kokia yra tavo mėgstamiausia spalva?' },
    { phrase: 'My favourite colour is red.', translation: 'Mano mėgstamiausia spalva yra raudona.' },
    { phrase: 'My favourite colour is green.', translation: 'Mano mėgstamiausia spalva yra žalia.' },
    { phrase: "What's this?", translation: 'Kas tai?' },
    { phrase: "It's a desk.", translation: 'Tai yra rašomasis stalas.' },
    { phrase: 'Is it a plane?', translation: 'Ar tai lėktuvas?' },
    { phrase: 'Yes, it is.', translation: 'Taip, tai yra.' },
    { phrase: "No, it isn't.", translation: 'Ne, tai nėra.' },
];

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
        translation: 'lėktuvas',
        examples: ['Is it a plane?'],
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

export const PHRASES_DICTIONARY: PhraseRecord[] = PHRASES_DICTIONARY_DATA.map(
    (entry) => new PhraseRecord(entry),
);

export const WORDS_DICTIONARY: WordRecord[] = WORDS_DICTIONARY_DATA.map(
    (entry) => new WordRecord(entry),
);
