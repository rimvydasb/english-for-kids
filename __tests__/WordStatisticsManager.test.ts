import {WordStatisticsManager} from '@/lib/statistics/WordStatisticsManager';
import {WordRecord} from '@/lib/types';
import {MemoryStorage} from './helpers/mockStorage';

describe('WordStatisticsManager', () => {
    const words: WordRecord[] = [
        new WordRecord({word: 'apple', translation: 'obuolys', type: 'noun'}),
        new WordRecord({word: 'dog', translation: 'šuo', type: 'noun'}),
    ];

    it('tracks attempts, aggregates, and updates global stats on finish', () => {
        const manager = new WordStatisticsManager(words, 'guessTheWord', new MemoryStorage());
        const initial = manager.loadState();

        expect(initial.inGameStats.apple.totalAttempts).toBe(0);
        expect(initial.globalStats.apple.correctAttempts).toBe(0);

        const afterCorrect = manager.recordAttempt(initial.inGameStats, 'apple', true);
        expect(afterCorrect.apple.correctAttempts).toBe(1);
        expect(afterCorrect.apple.learned).toBe(true);
        expect(manager.aggregate(afterCorrect).correctAttempts).toBe(1);

        const afterWrong = manager.recordAttempt(afterCorrect, 'dog', false);
        expect(afterWrong.dog.wrongAttempts).toBe(1);
        expect(afterWrong.dog.learned).toBe(false);

        const aggregated = manager.aggregate(afterWrong);
        expect(aggregated.totalAttempts).toBe(2);
        expect(aggregated.correctAttempts).toBe(1);
        expect(aggregated.wrongAttempts).toBe(1);

        manager.finishGame(afterWrong);
        const globalStats = manager.loadGlobalStatistics();
        expect(globalStats.apple.correctAttempts).toBe(1);
        expect(globalStats.dog.wrongAttempts).toBe(1);

        manager.resetInGameStatistics();
        const resetInGame = manager.loadInGameStatistics();
        expect(resetInGame.apple.totalAttempts).toBe(0);
        expect(resetInGame.dog.totalAttempts).toBe(0);

        manager.resetGlobalStatistics();
        const resetGlobal = manager.loadGlobalStatistics();
        expect(resetGlobal.apple.correctAttempts).toBe(0);
        expect(resetGlobal.dog.wrongAttempts).toBe(0);
    });
    it('loads state snapshot with aggregated stats after persistence', () => {
        const manager = new WordStatisticsManager(words, 'listenAndGuess', new MemoryStorage());
        const start = manager.loadState();

        expect(start.aggregated.totalAttempts).toBe(0);

        const after = manager.recordAttempt(start.inGameStats, 'apple', true);
        manager.finishGame(after);

        const loaded = manager.loadState();
        expect(loaded.globalStats.apple.correctAttempts).toBe(1);
        expect(loaded.aggregated.correctAttempts).toBe(1);
    });
});
