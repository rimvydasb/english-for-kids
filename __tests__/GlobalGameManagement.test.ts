import { GameManager } from '@/lib/game/GameManager';
import { MemoryStorage } from './helpers/mockStorage';
import { GlobalConfig } from '@/lib/Config';

describe('Global Game Management', () => {
    it('resetAllOngoingGames clears in-game stats but preserves global stats', () => {
        const storage = new MemoryStorage();
        
        // Setup mock data for multiple games
        GlobalConfig.GAMES.forEach(game => {
            // Set in-game stats
            storage.setItem(game.storageKey, JSON.stringify({ some: 'in-game-data' }));
            // Set active subjects
            storage.setItem(`${game.storageKey}_ACTIVE_SUBJECTS`, JSON.stringify(['active1', 'active2']));
            // Set global stats (should be preserved)
            storage.setItem(game.globalStorageKey, JSON.stringify({ global: 'stats' }));
        });

        // Run the reset
        GameManager.resetAllOngoingGames(storage);

        // Verify
        GlobalConfig.GAMES.forEach(game => {
            // In-game stats and active subjects should be gone
            expect(storage.getItem(game.storageKey)).toBeNull();
            expect(storage.getItem(`${game.storageKey}_ACTIVE_SUBJECTS`)).toBeNull();
            
            // Global stats should remain
            expect(storage.getItem(game.globalStorageKey)).not.toBeNull();
            expect(storage.getItem(game.globalStorageKey)).toBe(JSON.stringify({ global: 'stats' }));
        });
    });
});
