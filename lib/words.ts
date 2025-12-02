import { WORDS_DICTIONARY_DATA } from '@/lib/Config';
import { WordRecord } from '@/lib/types';

export type { WordEntry } from '@/lib/types';
export { WordRecord };

export const WORDS_DICTIONARY = WORDS_DICTIONARY_DATA.map((entry) => new WordRecord(entry));

export { WORDS_DICTIONARY_DATA };
