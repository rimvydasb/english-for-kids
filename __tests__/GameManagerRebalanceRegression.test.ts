import { GuessTheWordGameManager } from '@/lib/game/WordGameManager';
import { WordRecord } from '@/lib/words';
import { MemoryStorage } from './helpers/mockStorage';
import { GlobalConfig } from '@/lib/Config';

describe('GameManager Rebalancing', () => {
    // Generate 10 dummy words
    const words: WordRecord[] = Array.from({ length: 15 }, (_, i) => 
        new WordRecord({ word: `word${i}`, translation: `translation${i}`, type: 'noun' })
    );

    it('respects TOTAL_IN_GAME_SUBJECTS_TO_LEARN even if more subjects are stored from previous session', () => {
        const storage = new MemoryStorage();
        // Simulate a previous session where 10 subjects were active
        // The storage key for GuessTheWord is 'GUESS_THE_WORD_GAME_STATS_ACTIVE_SUBJECTS' 
        // derived from 'GUESS_THE_WORD_GAME_STATS' + '_ACTIVE_SUBJECTS'
        const storedActiveSubjects = words.slice(0, 10).map(w => w.word);
        storage.setItem('GUESS_THE_WORD_GAME_STATS_ACTIVE_SUBJECTS', JSON.stringify(storedActiveSubjects));

        const manager = new GuessTheWordGameManager(words, undefined, storage);
        
        // Verify config is what we expect (5)
        expect(GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN).toBe(5);

        const activeSubjects = manager.startTheGame();

        // Bug: Currently it returns all 10 stored subjects
        // Expected: It should slice it down to 5
        expect(activeSubjects.length).toBe(GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN);
        
        // Also verify that the returned subjects are indeed from the stored ones (the first 5)
        const expectedSubjects = storedActiveSubjects.slice(0, 5);
        expect(activeSubjects.map(w => w.word)).toEqual(expectedSubjects);
    });
});
