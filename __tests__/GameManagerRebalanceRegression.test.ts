import { GuessTheWordGameManager } from '@/lib/game/WordGameManager';
import { WordRecord } from '@/lib/words';
import { MemoryStorage } from './helpers/mockStorage';
import { GlobalConfig } from '@/lib/Config';

describe('GameManager Rebalancing', () => {
    const limit = GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN;
    const extra = 5;
    // Generate enough dummy words
    const words: WordRecord[] = Array.from({ length: limit + extra + 5 }, (_, i) => 
        new WordRecord({ word: `word${i}`, translation: `translation${i}`, type: 'noun' })
    );

    it('respects TOTAL_IN_GAME_SUBJECTS_TO_LEARN even if more subjects are stored from previous session', () => {
        const storage = new MemoryStorage();
        // Simulate a previous session where more subjects were active than currently allowed
        // The storage key for GuessTheWord is 'GUESS_THE_WORD_GAME_STATS_ACTIVE_SUBJECTS' 
        // derived from 'GUESS_THE_WORD_GAME_STATS' + '_ACTIVE_SUBJECTS'
        
        // We store 'limit + extra' subjects
        const storedActiveSubjects = words.slice(0, limit + extra).map(w => w.word);
        storage.setItem('GUESS_THE_WORD_GAME_STATS_ACTIVE_SUBJECTS', JSON.stringify(storedActiveSubjects));

        const manager = new GuessTheWordGameManager(words, undefined, storage);
        
        const activeSubjects = manager.startTheGame();

        // Bug: Currently it returns all stored subjects
        // Expected: It should slice it down to 'limit'
        expect(activeSubjects.length).toBe(limit);
        
        // Also verify that the returned subjects are indeed from the stored ones (the first 'limit')
        const expectedSubjects = storedActiveSubjects.slice(0, limit);
        expect(activeSubjects.map(w => w.word)).toEqual(expectedSubjects);
    });
});
