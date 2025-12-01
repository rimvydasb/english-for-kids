import { PHRASES_DICTIONARY_DATA } from '@/lib/PHRASES_DICTIONARY_DATA';
import { PhraseEntry, PhraseRecord } from '@/lib/types';

export type { PhraseEntry };
export { PhraseRecord };

export const PHRASES_DICTIONARY: PhraseRecord[] = PHRASES_DICTIONARY_DATA.map(
    (entry) => new PhraseRecord(entry),
);
