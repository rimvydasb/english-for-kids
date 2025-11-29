import { WordStatisticsManager } from '@/lib/WordStatisticsManager';
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

describe('WordStatisticsManager', () => {
    const words: WordRecord[] = [
        new WordRecord({ word: 'apple', translation: 'obuolys' }),
        new WordRecord({ word: 'dog', translation: 'šuo' }),
    ];

    const createManager = () => new WordStatisticsManager(words, new MockStorage());

    it('initializes empty stats', () => {
        const manager = createManager();
        const { globalStats, variantStats, variantWordStats } = manager.loadAll();

        expect(globalStats.apple.correctAttempts).toBe(0);
        expect(globalStats.dog.wrongAttempts).toBe(0);
        expect(variantStats.guessTheWord.totalAttempts).toBe(0);
        expect(variantWordStats.guessTheWord.apple.totalAttempts).toBe(0);
    });

    it('records a correct attempt and marks as learned', () => {
        const manager = createManager();
        const afterAttempt = manager.recordAttempt('guessTheWord', 'apple', true);

        expect(afterAttempt.variantStats.guessTheWord.correctAttempts).toBe(1);
        expect(afterAttempt.variantWordStats.guessTheWord.apple.learned).toBe(true);
        expect(afterAttempt.globalStats.apple.correctAttempts).toBe(0);

        const afterFinalize = manager.finalizeVariant();
        expect(afterFinalize.globalStats.apple.correctAttempts).toBe(1);
        expect(afterFinalize.globalStats.apple.wrongAttempts).toBe(0);
    });

    it('records an incorrect attempt and keeps word unlearned', () => {
        const manager = createManager();
        const { variantStats, variantWordStats } = manager.recordAttempt('guessTheWord', 'dog', false);

        expect(variantWordStats.guessTheWord.dog.wrongAttempts).toBe(1);
        expect(variantWordStats.guessTheWord.dog.learned).toBe(false);
        expect(variantStats.guessTheWord.wrongAttempts).toBe(1);
    });

    it('tracks stats separately per variant', () => {
        const manager = createManager();
        manager.recordAttempt('guessTheWord', 'apple', true);
        const { variantStats } = manager.recordAttempt('listenAndGuess', 'apple', false);

        expect(variantStats.guessTheWord.correctAttempts).toBe(1);
        expect(variantStats.listenAndGuess.wrongAttempts).toBe(1);
    });

    it('resets only variant stats on restart', () => {
        const manager = createManager();
        manager.recordAttempt('guessTheWord', 'apple', true);
        const { variantWordStats } = manager.resetVariant('guessTheWord');

        expect(variantWordStats.guessTheWord.apple.correctAttempts).toBe(0);
        expect(variantWordStats.listenAndGuess.dog.correctAttempts).toBe(0);
    });

    it('finalizes into global and supports reset', () => {
        const manager = createManager();
        manager.recordAttempt('guessTheWord', 'apple', true);
        manager.recordAttempt('listenAndGuess', 'dog', false);
        manager.finalizeVariant();
        const { globalStats } = manager.getSnapshot();
        expect(globalStats.apple.correctAttempts).toBe(1);
        expect(globalStats.dog.wrongAttempts).toBe(1);

        const afterReset = manager.resetGlobal();
        expect(afterReset.globalStats.apple.correctAttempts).toBe(0);
        expect(afterReset.globalStats.dog.wrongAttempts).toBe(0);
    });
});
