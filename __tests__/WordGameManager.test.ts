import { GameManager } from '@/lib/GameManager';
import { WordRecord } from '@/lib/words';

const getType = (records: WordRecord[], word: string) =>
    records.find((item) => item.word === word)?.type;

describe('buildWordOptions', () => {
    const words: WordRecord[] = [
        new WordRecord({ word: 'red', translation: 'raudonas', type: 'color' }),
        new WordRecord({ word: 'green', translation: 'žalias', type: 'color' }),
        new WordRecord({ word: 'yellow', translation: 'geltonas', type: 'color' }),
        new WordRecord({ word: 'black', translation: 'juodas', type: 'color' }),
        new WordRecord({ word: 'white', translation: 'baltas', type: 'color' }),
        new WordRecord({ word: 'cat', translation: 'katė', type: 'noun' }),
        new WordRecord({ word: 'dog', translation: 'šuo', type: 'noun' }),
        new WordRecord({ word: 'desk', translation: 'rašomasis stalas', type: 'noun' }),
    ];
    const manager = new GameManager(words, { groupBy: (record) => record.type });

    it('returns 1 answer + 4 decoys, all from the same type when enough options exist', () => {
        const answer = words[0];
        const options = manager.buildOptions(answer);
        const decoys = options.filter((option) => option !== answer.word);

        expect(options).toHaveLength(5);
        expect(new Set(options).size).toBe(5);
        expect(decoys.every((word) => getType(words, word) === answer.type)).toBe(true);
    });

    it('fills remaining decoys with other types if there are not enough of the same type', () => {
        const shortList = words.filter((item) => item.word !== 'green' && item.word !== 'yellow');
        const answer = shortList.find((item) => item.word === 'black') as WordRecord;
        const options = new GameManager(shortList, { groupBy: (record) => record.type }).buildOptions(
            answer,
        );
        const decoys = options.filter((option) => option !== answer.word);

        expect(options).toHaveLength(5);
        expect(new Set(options).size).toBe(5);
        const decoyTypes = decoys.map((word) => getType(shortList, word));
        expect(decoyTypes.filter((type) => type === answer.type).length).toBeGreaterThan(0);
        expect(decoyTypes.filter((type) => type !== answer.type).length).toBeGreaterThan(0);
    });
});
