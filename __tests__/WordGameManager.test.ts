import { WordsGameManager } from '@/lib/WordsGameManager';
import { WordRecord } from '@/lib/words';

class MockStorage implements Storage {
    private store: Record<string, string> = {};

    getItem(key: string): string | null {
        return this.store[key] ?? null;
    }

    setItem(key: string, value: string): void {
        this.store[key] = value;
    }

    removeItem(key: string): void {
        delete this.store[key];
    }

    clear(): void {
        this.store = {};
    }

    key(index: number): string | null {
        return Object.keys(this.store)[index] ?? null;
    }

    get length(): number {
        return Object.keys(this.store).length;
    }
}

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
    const manager = new WordsGameManager(words, 'guessTheWord', { groupBy: (record) => record.type });

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
        const options = new WordsGameManager(shortList, 'guessTheWord', {
            groupBy: (record) => record.type,
        }).buildOptions(answer);
        const decoys = options.filter((option) => option !== answer.word);

        expect(options).toHaveLength(5);
        expect(new Set(options).size).toBe(5);
        const decoyTypes = decoys.map((word) => getType(shortList, word));
        expect(decoyTypes.filter((type) => type === answer.type).length).toBeGreaterThan(0);
        expect(decoyTypes.filter((type) => type !== answer.type).length).toBeGreaterThan(0);
    });
});

describe('doGuess', () => {
    const words: WordRecord[] = [
        new WordRecord({ word: 'red', translation: 'raudonas', type: 'color' }),
        new WordRecord({ word: 'green', translation: 'žalias', type: 'color' }),
    ];

    it('records attempts and reports completion', () => {
        const manager = new WordsGameManager(words, 'guessTheWord');
        const answer = words[0];

        const firstGuess = manager.doGuess(answer, answer.word);
        expect(firstGuess.isCorrect).toBe(true);
        expect(firstGuess.isComplete).toBe(false);
        expect(firstGuess.snapshot.variantWordStats.guessTheWord.red.correctAttempts).toBe(1);
        expect(firstGuess.snapshot.variantWordStats.guessTheWord.red.learned).toBe(true);

        const secondGuess = manager.doGuess(words[1], words[1].word);
        expect(secondGuess.isComplete).toBe(true);
        expect(secondGuess.snapshot.variantStats.guessTheWord.correctAttempts).toBe(2);
    });
});

describe('game flow with statistics', () => {
    const words: WordRecord[] = [
        new WordRecord({ word: 'red', translation: 'raudonas', type: 'color' }),
        new WordRecord({ word: 'green', translation: 'žalias', type: 'color' }),
        new WordRecord({ word: 'cat', translation: 'katė', type: 'noun' }),
    ];

    it('plays through guesses, finalizes, resets, and surfaces weakest words', () => {
        const manager = new WordsGameManager(words, 'guessTheWord', undefined, new MockStorage());

        const firstCandidate = manager.drawNextCandidate();
        expect(firstCandidate).not.toBeNull();

        const wrong = manager.doGuess(words[0], words[1].word);
        expect(wrong.isCorrect).toBe(false);
        expect(wrong.snapshot.variantWordStats.guessTheWord.red.wrongAttempts).toBe(1);

        const correct = manager.doGuess(words[0], words[0].word);
        expect(correct.isCorrect).toBe(true);
        expect(correct.snapshot.variantWordStats.guessTheWord.red.correctAttempts).toBe(1);

        manager.doGuess(words[1], words[1].word);
        manager.finalizeVariant();
        const afterFinalize = manager.getSnapshot();
        expect(afterFinalize.globalStats.red.wrongAttempts).toBe(1);
        expect(afterFinalize.globalStats.green.correctAttempts).toBe(1);

        const worst = manager.getWorstGuesses(2).map((item) => item.word);
        expect(worst[0]).toBe('red');
        expect(worst).toContain('green');

        const afterResetVariant = manager.resetVariant();
        expect(afterResetVariant.variantWordStats.guessTheWord.red.totalAttempts).toBe(0);
        expect(afterResetVariant.globalStats.red.wrongAttempts).toBe(1);

        const afterResetGlobal = manager.resetGlobal();
        expect(afterResetGlobal.globalStats.red.wrongAttempts).toBe(0);
        expect(afterResetGlobal.globalStats.green.correctAttempts).toBe(0);
    });
});
