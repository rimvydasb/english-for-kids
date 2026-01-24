import {PhrasesStatisticsManager} from '@/lib/statistics/PhrasesStatisticsManager';
import {PhraseRecord} from '@/lib/types';
import {MemoryStorage} from './helpers/mockStorage';

describe('PhrasesStatisticsManager', () => {
    const phrases: PhraseRecord[] = [
        new PhraseRecord({phrase: 'Hello', translation: 'Labas'}),
        new PhraseRecord({phrase: 'Goodbye', translation: 'Viso gero'}),
    ];

    it('records attempts, aggregates, and persists global statistics on finish', () => {
        const manager = new PhrasesStatisticsManager(phrases, new MemoryStorage());
        const inGameStats = manager.loadInGameStatistics();

        const afterWrong = manager.recordAttempt(inGameStats, 'Hello', false);
        expect(afterWrong.Hello.wrongAttempts).toBe(1);
        expect(afterWrong.Hello.learned).toBe(false);

        const afterCorrect = manager.recordAttempt(afterWrong, 'Hello', true);
        expect(afterCorrect.Hello.correctAttempts).toBe(1);
        expect(afterCorrect.Hello.learned).toBe(true);

        const aggregated = manager.aggregate(afterCorrect);
        expect(aggregated.totalAttempts).toBe(2);
        expect(aggregated.correctAttempts).toBe(1);
        expect(aggregated.wrongAttempts).toBe(1);

        manager.finishGame(afterCorrect);
        const globalStats = manager.loadGlobalStatistics();
        expect(globalStats.Hello.correctAttempts).toBe(1);
        expect(globalStats.Hello.wrongAttempts).toBe(1);
        expect(manager.loadInGameStatistics().Hello.totalAttempts).toBe(2);

        manager.resetInGameStatistics();
        const resetInGame = manager.loadInGameStatistics();
        expect(resetInGame.Hello.totalAttempts).toBe(0);

        manager.resetGlobalStatistics();
        const resetGlobal = manager.loadGlobalStatistics();
        expect(resetGlobal.Hello.correctAttempts).toBe(0);
        expect(resetGlobal.Hello.wrongAttempts).toBe(0);
    });

    it('loads aggregated snapshot reflecting current in-game stats', () => {
        const manager = new PhrasesStatisticsManager(phrases, new MemoryStorage());
        const state = manager.loadState();
        expect(state.aggregated.totalAttempts).toBe(0);

        const after = manager.recordAttempt(state.inGameStats, 'Goodbye', true);
        const aggregated = manager.aggregate(after);
        expect(aggregated.correctAttempts).toBe(1);

        manager.finishGame(after);
        const loaded = manager.loadState();
        expect(loaded.globalStats.Goodbye.correctAttempts).toBe(1);
        expect(loaded.aggregated.correctAttempts).toBe(1);
    });
});
