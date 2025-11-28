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

export const WRODS_DICTIONARY_DATA: WordEntry[] = [
  { word: 'crayon' },
  { word: 'desk' },
  { word: 'painting' },
  { word: 'pencil' },
];

export const WRODS_DICTIONARY: WordRecord[] = WRODS_DICTIONARY_DATA.map(
  (entry) => new WordRecord(entry.word),
);
