import {GlobalConfig} from '@/lib/config';
import {GuessTheWordGameManager, ListenAndGuessGameManager} from '@/lib/game/WordGameManager';
import {WordRecord} from '@/lib/types';
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
        const decoys = options.filter((option) => option.getSubject() !== answer.word);

        expect(options).toHaveLength(Math.min(words.length, GlobalConfig.DEFAULT_DECOYS + 1));
        expect(new Set(options.map((o) => o.getSubject())).size).toBe(options.length);

        // We expect it to prioritize same-type words.
        // We have 4 other colors available (total 5 colors, 1 is answer).
        // Since we need 7 decoys, and have 4 colors, we expect all 4 colors to be present.
        const sameTypeDecoys = decoys.filter((opt) => getType(words, opt.getSubject()) === answer.type);
        expect(sameTypeDecoys.length).toBe(4);
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

    it('records wrong attempts for both the subject and the incorrect guess if it is a valid subject', () => {
        const manager = new ListenAndGuessGameManager(words, new MemoryStorage());
        const activeSubjects = manager.startTheGame();
        let inGameStats = manager.loadInGameStatistics();

        const targetSubject = activeSubjects[0];
        // Ensure we pick a wrong guess that is actually in the subjects list
        const wrongGuessSubject = activeSubjects.find((s) => s.word !== targetSubject.word)!;
        const wrongGuess = wrongGuessSubject.word;

        const result = manager.recordAttempt(inGameStats, targetSubject, wrongGuess, activeSubjects);
        inGameStats = result.inGameStats;

        expect(result.isCorrect).toBe(false);

        // Target subject should have a wrong attempt
        expect(inGameStats[targetSubject.word].wrongAttempts).toBe(1);
        expect(inGameStats[targetSubject.word].learned).toBe(false);

        // The wrongly guessed word should ALSO have a wrong attempt
        expect(inGameStats[wrongGuess].wrongAttempts).toBe(1);
        expect(inGameStats[wrongGuess].learned).toBe(false);
    });

    it('unlearns a previously learned word if it is used as a wrong guess, forcing it to be repeated', () => {
        const manager = new GuessTheWordGameManager(words.slice(0, 2), new MemoryStorage());
        const activeSubjects = manager.startTheGame();
        // We have 2 words. Let's call them TargetA and TargetB.
        const targetA = activeSubjects[0];
        const targetB = activeSubjects[1];

        let inGameStats = manager.loadInGameStatistics();

        // 1. Learn TargetA correctly
        const resultA = manager.recordAttempt(inGameStats, targetA, targetA.word, activeSubjects);
        inGameStats = resultA.inGameStats;
        expect(resultA.isCorrect).toBe(true);
        expect(inGameStats[targetA.word].learned).toBe(true);

        // 2. Encounter TargetB, but guess TargetA (wrongly)
        // This simulates confusing B with A. A should be considered "not fully known" again.
        const resultB_wrong = manager.recordAttempt(inGameStats, targetB, targetA.word, activeSubjects);
        inGameStats = resultB_wrong.inGameStats;
        expect(resultB_wrong.isCorrect).toBe(false);
        expect(resultB_wrong.isComplete).toBe(false);

        // TargetA should now be unlearned
        expect(inGameStats[targetA.word].learned).toBe(false);
        // TargetB is obviously not learned yet
        expect(inGameStats[targetB.word].learned).toBe(false);

        // 3. Verify TargetA is back in the candidate pool
        // We check this by asking for candidates from a list containing only TargetA.
        // If it were learned, it would return null.
        const candidateA = manager.drawNextCandidate([targetA], inGameStats);
        expect(candidateA).not.toBeNull();
        expect(candidateA?.word).toBe(targetA.word);

        // 4. Learn TargetB correctly
        const resultB_correct = manager.recordAttempt(inGameStats, targetB, targetB.word, activeSubjects);
        inGameStats = resultB_correct.inGameStats;
        // Game should NOT be complete, because TargetA is still unlearned
        expect(resultB_correct.isComplete).toBe(false);

        // 5. Re-learn TargetA
        const resultA_relearn = manager.recordAttempt(inGameStats, targetA, targetA.word, activeSubjects);
        inGameStats = resultA_relearn.inGameStats;

        // NOW the game should be complete
        expect(resultA_relearn.isComplete).toBe(true);
        expect(inGameStats[targetA.word].learned).toBe(true);
        expect(inGameStats[targetB.word].learned).toBe(true);
    });

    it('respects configuration for subject count and types', () => {
        const manager = new GuessTheWordGameManager(words, new MemoryStorage());

        // 1. Limit count
        const selection1 = manager.startTheGame({
            totalInGameSubjectsToLearn: 2,
            selectedWordEntryTypes: [],
        });
        expect(selection1.length).toBe(2);

        // 2. Filter by type (nouns only)
        // We have 3 nouns in test data
        const selection2 = manager.startTheGame({
            totalInGameSubjectsToLearn: 5,
            selectedWordEntryTypes: ['noun'],
        });
        expect(selection2.every((w) => w.type === 'noun')).toBe(true);
        expect(selection2.length).toBe(3);

        // 3. Filter by type (colors only) with limit
        const selection3 = manager.startTheGame({
            totalInGameSubjectsToLearn: 2,
            selectedWordEntryTypes: ['color'],
        });
        expect(selection3.every((w) => w.type === 'color')).toBe(true);
        expect(selection3.length).toBe(2);
    });
});
