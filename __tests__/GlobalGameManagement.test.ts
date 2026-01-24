import {GameManager} from '@/lib/game/GameManager';
import {MemoryStorage} from './helpers/mockStorage';
import {KNOWN_GAME_STORAGE_KEYS} from '@/lib/Config';

describe('Global Game Management', () => {
    it('resetAllOngoingGames clears in-game stats but preserves global stats', () => {
        const storage = new MemoryStorage();
        const globalKey = 'GLOBAL_TEST_STATS';

        // Setup mock data for multiple games
        KNOWN_GAME_STORAGE_KEYS.forEach((key) => {
            // Set in-game stats
            storage.setItem(key, JSON.stringify({some: 'in-game-data'}));
            // Set active subjects
            storage.setItem(`${key}_ACTIVE_SUBJECTS`, JSON.stringify(['active1', 'active2']));
            // Set global stats (should be preserved)
            storage.setItem(globalKey, JSON.stringify({global: 'stats'}));
        });

        // Run the reset
        GameManager.resetAllOngoingGames(storage);

        // Verify
        KNOWN_GAME_STORAGE_KEYS.forEach((key) => {
            // In-game stats and active subjects should be gone
            expect(storage.getItem(key)).toBeNull();
            expect(storage.getItem(`${key}_ACTIVE_SUBJECTS`)).toBeNull();
        });

        // Global stats should remain
        expect(storage.getItem(globalKey)).not.toBeNull();
        expect(storage.getItem(globalKey)).toBe(JSON.stringify({global: 'stats'}));
    });
});
