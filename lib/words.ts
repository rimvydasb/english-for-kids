import { WORDS_DICTIONARY_DATA } from '@/lib/WORDS_DICTIONARY_DATA';
import { WordEntry, WordRecord } from '@/lib/types';

export type { WordEntry };
export { WordRecord };

export const WORDS_DICTIONARY: WordRecord[] = WORDS_DICTIONARY_DATA.map(
    (entry) => new WordRecord(entry),
);
