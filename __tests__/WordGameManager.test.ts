import {GlobalConfig} from '@/lib/Config';
import {GuessTheWordGameManager, ListenAndGuessGameManager} from '@/lib/game/WordGameManager';
import {WordRecord} from '@/lib/words';
import {MemoryStorage} from './helpers/mockStorage';

const getType = (records: WordRecord[], word: string) => records.find((item) => item.word === word)?.type;

describe('Word game managers', () => {
    const words: WordRecord[] = [
        new WordRecord({word: 'red', translation: 'raudonas', type: 'color'}),
        new WordRecord({word: 'green', translation: 'žalias', type: 'color'}),
        new WordRecord({word: 'yellow', translation: 'geltonas', type: 'color'}),
        new WordRecord({word: 'black', translation: 'juodas', type: 'color'}),
        new WordRecord({word: 'white', translation: 'baltas', type: 'color'}),
        new WordRecord({word: 'cat', translation: 'katė', type: 'noun'}),
        new WordRecord({word: 'dog', translation: 'šuo', type: 'noun'}),
        new WordRecord({word: 'desk', translation: 'rašomasis stalas', type: 'noun'}),
    ];

    it('builds options using grouped decoys when available', () => {
        const manager = new GuessTheWordGameManager(words, new MemoryStorage());
        const answer = words[0];
        const options = manager.buildOptions(answer, words);
        const decoys = options.filter((option) => option !== answer.word);

        expect(options).toHaveLength(Math.min(words.length, GlobalConfig.DEFAULT_DECOYS + 1));
        expect(new Set(options).size).toBe(options.length);
        expect(decoys.every((word) => getType(words, word) === answer.type)).toBe(true);
    });

    it('records attempts, reports completion, and updates global stats on finish', () => {
        const manager = new ListenAndGuessGameManager(words, new MemoryStorage());
        const activeSubjects = manager.startTheGame();
        let inGameStats = manager.loadInGameStatistics();

        const correct = manager.recordAttempt(inGameStats, activeSubjects[0], activeSubjects[0].word, activeSubjects);
        inGameStats = correct.inGameStats;
        expect(correct.isCorrect).toBe(true);
        expect(inGameStats[activeSubjects[0].word].correctAttempts).toBe(1);

        const wrong = manager.recordAttempt(inGameStats, activeSubjects[1], 'incorrect', activeSubjects);
        inGameStats = wrong.inGameStats;
        expect(inGameStats[activeSubjects[1].word].wrongAttempts).toBe(1);

        const finish = manager.finishGame(inGameStats);
        expect(finish.globalStats[activeSubjects[0].word].correctAttempts).toBe(1);
        expect(finish.globalStats[activeSubjects[1].word].wrongAttempts).toBe(1);
    });

    it('limits startTheGame selection to configured subject count', () => {
        const manager = new GuessTheWordGameManager(words, new MemoryStorage());
        const selected = manager.startTheGame();
        expect(selected.length).toBe(Math.min(GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN, words.length));
    });

    it('reuses stored active subjects until reset', () => {
        const storage = new MemoryStorage();
        const manager = new GuessTheWordGameManager(words, storage);
        const firstSelection = manager.startTheGame();
        const secondSelection = manager.startTheGame();
        expect(secondSelection.map((item) => item.word)).toEqual(firstSelection.map((item) => item.word));

        manager.resetInGameStatistics();
        const newSelection = manager.startTheGame();
        expect(newSelection).toHaveLength(firstSelection.length);
    });

    it('surface worst guesses based on wrong attempts', () => {
        const manager = new GuessTheWordGameManager(words, new MemoryStorage());
        const activeSubjects = words;
        let inGameStats = manager.loadInGameStatistics();

        inGameStats = manager.recordAttempt(inGameStats, words[0], 'nope', activeSubjects).inGameStats;
        inGameStats = manager.recordAttempt(inGameStats, words[1], 'nope', activeSubjects).inGameStats;
        inGameStats = manager.recordAttempt(inGameStats, words[1], 'nope', activeSubjects).inGameStats;

        const worst = manager.getWorstGuesses(1, inGameStats, activeSubjects).map((item) => item.word);
        expect(worst).toEqual([words[1].word]);
    });

    it('returns default number of worst guesses from config when no count is provided', () => {
        const manager = new GuessTheWordGameManager(words, new MemoryStorage());
        const activeSubjects = manager.startTheGame();
        let inGameStats = manager.loadInGameStatistics();

        const targets = activeSubjects.slice(0, GlobalConfig.WORST_GUESSES_COUNT);
        targets.forEach((word, index) => {
            for (let i = 0; i <= index; i += 1) {
                inGameStats = manager.recordAttempt(inGameStats, word, 'nope', activeSubjects).inGameStats;
            }
        });

        const worst = manager.getWorstGuesses(undefined, inGameStats, activeSubjects);
        expect(worst.length).toBeLessThanOrEqual(GlobalConfig.WORST_GUESSES_COUNT);
        expect(worst[0].getSubject()).toBe(targets[targets.length - 1].getSubject());
    });

    it('returns empty worst guesses when there were no wrong attempts', () => {
        const manager = new GuessTheWordGameManager(words, new MemoryStorage());
        const activeSubjects = manager.startTheGame();
        const inGameStats = manager.loadInGameStatistics();

        const worst = manager.getWorstGuesses(undefined, inGameStats, activeSubjects);
        expect(worst).toHaveLength(0);
    });

    it('drawNextCandidate skips learned subjects and stops when all are learned', () => {
        const manager = new GuessTheWordGameManager(words.slice(0, 3), new MemoryStorage());
        const activeSubjects = manager.startTheGame();
        let inGameStats = manager.loadInGameStatistics();

        const first = manager.drawNextCandidate(activeSubjects, inGameStats);
        expect(first).not.toBeNull();

        inGameStats = manager.recordAttempt(
            inGameStats,
            activeSubjects[0],
            activeSubjects[0].word,
            activeSubjects,
        ).inGameStats;
        const second = manager.drawNextCandidate(activeSubjects, inGameStats);
        expect(second).not.toBeNull();

        inGameStats = manager.recordAttempt(
            inGameStats,
            activeSubjects[1],
            activeSubjects[1].word,
            activeSubjects,
        ).inGameStats;
        inGameStats = manager.recordAttempt(
            inGameStats,
            activeSubjects[2],
            activeSubjects[2].word,
            activeSubjects,
        ).inGameStats;

        const noneLeft = manager.drawNextCandidate(activeSubjects, inGameStats);
        expect(noneLeft).toBeNull();
    });

    it('finds subjects by key and resets global statistics', () => {
        const manager = new ListenAndGuessGameManager(words, new MemoryStorage());
        const activeSubjects = manager.startTheGame();
        let inGameStats = manager.loadInGameStatistics();

        const found = manager.findBySubject(activeSubjects[0].word);
        expect(found?.word).toBe(activeSubjects[0].word);

        inGameStats = manager.recordAttempt(
            inGameStats,
            activeSubjects[0],
            activeSubjects[0].word,
            activeSubjects,
        ).inGameStats;
        manager.finishGame(inGameStats);
        const withStats = manager.loadGlobalStatistics();
        expect(withStats[activeSubjects[0].word].correctAttempts).toBe(1);

        manager.resetGlobalStatistics();
        const resetGlobal = manager.loadGlobalStatistics();
        expect(resetGlobal[activeSubjects[0].word].correctAttempts).toBe(0);
    });
});
