import { PHRASES_DICTIONARY_DATA } from '@/lib/Config';
import { PhraseRecord } from '@/lib/types';

export type { PhraseEntry } from '@/lib/types';
export { PhraseRecord };

export const PHRASES_DICTIONARY = PHRASES_DICTIONARY_DATA.map((entry) => new PhraseRecord(entry));

export { PHRASES_DICTIONARY_DATA };
