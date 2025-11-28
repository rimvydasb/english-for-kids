export interface WordEntry {
    word: string;
}

export class WordRecord {
    word: string;

    constructor(word: string) {
        this.word = word;
    }

    getImageUrl(): string {
        return `/images/${this.word}.png`;
    }
}

// @Todo: Fix typo in "WRODS"
export const WRODS_DICTIONARY_DATA: WordEntry[] = [
    {word: 'apple'},
    {word: 'crayon'},
    {word: 'desk'},
    {word: 'dog'},
    {word: 'egg'},
    {word: 'farm'},
    {word: 'fish'},
    {word: 'painting'},
    {word: 'pencil'},
];

// @Todo: Fix typo in "WRODS"
export const WRODS_DICTIONARY: WordRecord[] = WRODS_DICTIONARY_DATA.map(
    (entry) => new WordRecord(entry.word),
);
