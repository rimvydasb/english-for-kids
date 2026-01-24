import {GlobalConfig} from '@/lib/Config';
import {PhasesGameManager} from '@/lib/game/PhasesGameManager';
import {PhraseRecord} from '@/lib/types';
import {MemoryStorage} from './helpers/mockStorage';

describe('PhasesGameManager', () => {
    const phrases: PhraseRecord[] = [
        new PhraseRecord({phrase: 'Hello', translation: 'Labas'}),
        new PhraseRecord({phrase: 'Goodbye', translation: 'Viso gero'}),
        new PhraseRecord({phrase: 'Yes', translation: 'Taip'}),
        new PhraseRecord({phrase: 'No', translation: 'Ne'}),
        new PhraseRecord({phrase: 'Thanks', translation: 'Ačiū'}),
        new PhraseRecord({phrase: 'Please', translation: 'Prašau'}),
    ];

    it('builds options and tracks completion across rounds', () => {
        const manager = new PhasesGameManager(phrases, undefined, new MemoryStorage());
        const activeSubjects = manager.startTheGame();
        expect(activeSubjects.length).toBe(Math.min(GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN, phrases.length));

        let inGameStats = manager.loadInGameStatistics();
        const candidate = manager.drawNextCandidate(activeSubjects, inGameStats);
        expect(candidate).not.toBeNull();

        const options = manager.buildOptions(candidate as PhraseRecord, activeSubjects);
        expect(options).toContain((candidate as PhraseRecord).getSubject());
        expect(options.length).toBe(Math.min(activeSubjects.length, GlobalConfig.DEFAULT_DECOYS + 1));
        expect(new Set(options).size).toBe(options.length);

        let latest = manager.recordAttempt(
            inGameStats,
            activeSubjects[0],
            activeSubjects[0].getSubject(),
            activeSubjects,
        );
        inGameStats = latest.inGameStats;
        activeSubjects.slice(1).forEach((subject) => {
            latest = manager.recordAttempt(latest.inGameStats, subject, subject.getSubject(), activeSubjects);
        });

        expect(latest.isComplete).toBe(true);
        expect(latest.aggregated.totalAttempts).toBeGreaterThan(0);
    });

    it('reports weakest guesses and supports global reset', () => {
        const manager = new PhasesGameManager(phrases, undefined, new MemoryStorage());
        const activeSubjects = manager.startTheGame();
        let inGameStats = manager.loadInGameStatistics();

        inGameStats = manager.recordAttempt(inGameStats, activeSubjects[0], 'wrong', activeSubjects).inGameStats;
        inGameStats = manager.recordAttempt(inGameStats, activeSubjects[1], 'wrong', activeSubjects).inGameStats;
        inGameStats = manager.recordAttempt(inGameStats, activeSubjects[1], 'wrong', activeSubjects).inGameStats;

        const worst = manager.getWorstGuesses(1, inGameStats, activeSubjects);
        expect(worst).toHaveLength(1);
        expect(worst[0].getSubject()).toBe(activeSubjects[1].getSubject());

        manager.finishGame(inGameStats);
        expect(manager.loadGlobalStatistics()[activeSubjects[1].getSubject()].wrongAttempts).toBe(2);

        manager.resetGlobalStatistics();
        expect(manager.loadGlobalStatistics()[activeSubjects[1].getSubject()].wrongAttempts).toBe(0);
    });

    it('limits worst guesses to config default when count omitted', () => {
        const manager = new PhasesGameManager(phrases, undefined, new MemoryStorage());
        const activeSubjects = manager.startTheGame();
        let inGameStats = manager.loadInGameStatistics();

        activeSubjects.slice(0, GlobalConfig.WORST_GUESSES_COUNT + 1).forEach((subject) => {
            inGameStats = manager.recordAttempt(inGameStats, subject, 'wrong', activeSubjects).inGameStats;
        });

        const worst = manager.getWorstGuesses(undefined, inGameStats, activeSubjects);
        expect(worst.length).toBeLessThanOrEqual(GlobalConfig.WORST_GUESSES_COUNT);
    });

    it('reuses stored active subjects between sessions', () => {
        const storage = new MemoryStorage();
        const manager = new PhasesGameManager(phrases, undefined, storage);
        const first = manager.startTheGame();
        const second = manager.startTheGame();
        expect(second.map((item) => item.getSubject())).toEqual(first.map((item) => item.getSubject()));

        manager.resetInGameStatistics();
        const refreshed = manager.startTheGame();
        expect(refreshed).toHaveLength(first.length);
    });
});
