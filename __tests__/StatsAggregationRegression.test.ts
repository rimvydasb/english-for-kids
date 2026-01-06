import { GlobalConfig } from '@/lib/Config';
import { GuessTheWordGameManager } from '@/lib/game/WordGameManager';
import { WordRecord } from '@/lib/words';
import { MemoryStorage } from './helpers/mockStorage';
import { ensureStatsForSubjects } from '@/lib/game/ensureStats';

describe('Stats Aggregation Bug', () => {
    const words: WordRecord[] = [
        new WordRecord({ word: '1', translation: '1', type: 'noun' }),
        new WordRecord({ word: '2', translation: '2', type: 'noun' }),
        new WordRecord({ word: '3', translation: '3', type: 'noun' }),
        new WordRecord({ word: '4', translation: '4', type: 'noun' }),
        new WordRecord({ word: '5', translation: '5', type: 'noun' }),
        new WordRecord({ word: '6', translation: '6', type: 'noun' }),
        new WordRecord({ word: '7', translation: '7', type: 'noun' }),
        new WordRecord({ word: '8', translation: '8', type: 'noun' }),
        new WordRecord({ word: '9', translation: '9', type: 'noun' }),
        new WordRecord({ word: '10', translation: '10', type: 'noun' }),
    ];

    it('aggregates stats only for active subjects', () => {
        // Force config to 5
        const originalConfigValue = GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN;
        // We can't easily modify GlobalConfig if it's a const object unless we mock it or if it's mutable.
        // It seems mutable in lib/Config.ts based on search ("TOTAL_IN_GAME_SUBJECTS_TO_LEARN: 5").
        // However, imports are usually read-only.
        // But the search showed `TOTAL_IN_GAME_SUBJECTS_TO_LEARN: 5` in Config.ts.
        // Let's assume for this test we rely on the fact that words.length (10) > 5.

        const manager = new GuessTheWordGameManager(words, undefined, new MemoryStorage());
        const activeSubjects = manager.startTheGame(); // Should be 5
        const inGameStats = manager.loadInGameStatistics(); // Should be for 10

        expect(activeSubjects.length).toBe(5);
        expect(Object.keys(inGameStats).length).toBe(10);

        // This mimics the logic in GuessGamePage
        const statsForAggregation = ensureStatsForSubjects(activeSubjects, inGameStats);
        const aggregated = manager.aggregate(statsForAggregation);

        expect(aggregated.totalItemsCount).toBe(5);
    });
});
