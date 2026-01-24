import {GlobalConfig} from '@/lib/Config';
import {GuessTheWordGameManager} from '@/lib/game/WordGameManager';
import {WordRecord} from '@/lib/words';
import {MemoryStorage} from './helpers/mockStorage';
import {ensureStatsForSubjects} from '@/lib/game/ensureStats';

describe('Stats Aggregation Bug', () => {
    const totalSubjectsToLearn = GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN;
    const extraSubjects = 5;
    const words: WordRecord[] = Array.from(
        {length: totalSubjectsToLearn + extraSubjects},
        (_, i) => new WordRecord({word: `${i}`, translation: `${i}`, type: 'noun'}),
    );

    it('aggregates stats only for active subjects', () => {
        const manager = new GuessTheWordGameManager(words, new MemoryStorage());
        const activeSubjects = manager.startTheGame(); // Should be totalSubjectsToLearn
        const inGameStats = manager.loadInGameStatistics(); // Should be for all words

        expect(activeSubjects.length).toBe(totalSubjectsToLearn);
        expect(Object.keys(inGameStats).length).toBe(words.length);

        // This mimics the logic in GuessGamePage
        const statsForAggregation = ensureStatsForSubjects(activeSubjects, inGameStats);
        const aggregated = manager.aggregate(statsForAggregation);

        expect(aggregated.totalItemsCount).toBe(totalSubjectsToLearn);
    });
});
