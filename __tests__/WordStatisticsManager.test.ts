import { WordStatisticsManager } from '@/app/guess/WordStatisticsManager';
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
        { word: 'apple', translation: 'obuolys' },
        { word: 'dog', translation: 'šuo' },
    ];

    const createManager = () => new WordStatisticsManager(words, new MockStorage());

    it('initializes empty stats', () => {
        const manager = createManager();
        const { globalStats, variantStats } = manager.loadAll();

        expect(globalStats.apple.totalAttempts).toBe(0);
        expect(globalStats.dog.correctAttempts).toBe(0);
        expect(variantStats.guessTheWord.totalAttempts).toBe(0);
    });

    it('records a correct attempt and marks as learned', () => {
        const manager = createManager();
        const { globalStats, variantStats } = manager.recordAttempt('guessTheWord', 'apple', true);

        expect(globalStats.apple.correctAttempts).toBe(1);
        expect(globalStats.apple.learned).toBe(true);
        expect(variantStats.guessTheWord.correctAttempts).toBe(1);
        expect(variantStats.guessTheWord.wrongAttempts).toBe(0);
    });

    it('records an incorrect attempt and keeps word unlearned', () => {
        const manager = createManager();
        const { globalStats, variantStats } = manager.recordAttempt('guessTheWord', 'dog', false);

        expect(globalStats.dog.wrongAttempts).toBe(1);
        expect(globalStats.dog.learned).toBe(false);
        expect(variantStats.guessTheWord.wrongAttempts).toBe(1);
    });

    it('tracks stats separately per variant', () => {
        const manager = createManager();
        manager.recordAttempt('guessTheWord', 'apple', true);
        const { variantStats } = manager.recordAttempt('listenAndGuess', 'apple', false);

        expect(variantStats.guessTheWord.correctAttempts).toBe(1);
        expect(variantStats.listenAndGuess.wrongAttempts).toBe(1);
    });

    it('resets learned flags but preserves counts', () => {
        const manager = createManager();
        manager.recordAttempt('guessTheWord', 'apple', true);
        const { globalStats } = manager.resetLearnedFlags();

        expect(globalStats.apple.learned).toBe(false);
        expect(globalStats.apple.correctAttempts).toBe(1);
    });

    it('resets all stats', () => {
        const manager = createManager();
        manager.recordAttempt('guessTheWord', 'apple', true);
        manager.recordAttempt('listenAndGuess', 'dog', false);
        const { globalStats, variantStats } = manager.resetAll();

        expect(globalStats.apple.totalAttempts).toBe(0);
        expect(globalStats.dog.totalAttempts).toBe(0);
        expect(variantStats.guessTheWord.totalAttempts).toBe(0);
        expect(variantStats.listenAndGuess.totalAttempts).toBe(0);
    });
});
