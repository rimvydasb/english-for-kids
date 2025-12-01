// @Todo: move to lib/types.ts - create if not exists
export interface PhraseEntry {
    phrase: string;
    translation?: string;
}

// @Todo: move to lib/types.ts - create if not exists
export class PhraseRecord {
    phrase: string;

    translation?: string;

    // Alias to reuse pronunciation helpers that expect a `word` field.
    word: string;

    constructor(entry: PhraseEntry) {
        this.phrase = entry.phrase;
        this.translation = entry.translation;
        this.word = entry.phrase;
    }
}

// @Todo: this is a completely different configuration, so move it to PHRASES_DICTIONARY_DATA.ts
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

export const PHRASES_DICTIONARY: PhraseRecord[] = PHRASES_DICTIONARY_DATA.map(
    (entry) => new PhraseRecord(entry),
);
