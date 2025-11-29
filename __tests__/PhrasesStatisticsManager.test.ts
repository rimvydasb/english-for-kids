import { PhrasesStatisticsManager } from '@/lib/PhrasesStatisticsManager';
import { PhraseRecord } from '@/lib/phrases';

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

describe('PhrasesStatisticsManager', () => {
    const phrases: PhraseRecord[] = [
        new PhraseRecord({ phrase: 'Hello', translation: 'Labas' }),
        new PhraseRecord({ phrase: 'Goodbye', translation: 'Viso gero' }),
    ];

    const createManager = () => new PhrasesStatisticsManager(phrases, new MockStorage());

    it('initializes empty stats', () => {
        const manager = createManager();
        const { globalStats, inGameStats, variantStats } = manager.loadAll();

        expect(globalStats.Hello.correctAttempts).toBe(0);
        expect(inGameStats.Goodbye.totalAttempts).toBe(0);
        expect(variantStats.totalAttempts).toBe(0);
        expect(variantStats.learnedItemsCount).toBe(0);
    });

    it('records attempts and marks learned on correct', () => {
        const manager = createManager();
        const afterAttempt = manager.recordAttempt('Hello', true);

        expect(afterAttempt.inGameStats.Hello.correctAttempts).toBe(1);
        expect(afterAttempt.inGameStats.Hello.learned).toBe(true);
        expect(afterAttempt.globalStats.Hello.correctAttempts).toBe(0);

        const finalized = manager.finalizeVariant();
        expect(finalized.globalStats.Hello.correctAttempts).toBe(1);
        expect(finalized.globalStats.Hello.wrongAttempts).toBe(0);
    });

    it('marks learned false on incorrect attempts', () => {
        const manager = createManager();
        const afterAttempt = manager.recordAttempt('Goodbye', false);

        expect(afterAttempt.inGameStats.Goodbye.wrongAttempts).toBe(1);
        expect(afterAttempt.inGameStats.Goodbye.learned).toBe(false);
        expect(afterAttempt.variantStats.wrongAttempts).toBe(1);
    });

    it('supports resetting variant and global stats independently', () => {
        const manager = createManager();
        manager.recordAttempt('Hello', true);
        manager.finalizeVariant();
        const afterVariantReset = manager.resetVariant();

        expect(afterVariantReset.inGameStats.Hello.correctAttempts).toBe(0);
        expect(afterVariantReset.globalStats.Hello.correctAttempts).toBe(1);

        const afterGlobalReset = manager.resetGlobal();
        expect(afterGlobalReset.globalStats.Hello.correctAttempts).toBe(0);
        expect(afterGlobalReset.globalStats.Goodbye.wrongAttempts).toBe(0);
    });
});
