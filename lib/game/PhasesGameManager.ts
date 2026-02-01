import {GameManager} from '@/lib/game/GameManager';
import {PhrasesStatisticsManager} from '@/lib/statistics/PhrasesStatisticsManager';
import {StorageLike} from '@/lib/statistics/AStatisticsManager';
import {GameRules, PhraseRecord} from '@/lib/types';
import {PHRASES_DICTIONARY} from '@/lib/phrases';
import {GlobalConfig} from '@/lib/config';

export class PhasesGameManager extends GameManager<PhraseRecord> {
    constructor(subjects: PhraseRecord[] = PHRASES_DICTIONARY, storage?: StorageLike) {
        // We pass a placeholder for statistics initially
        super(subjects, null as unknown as PhrasesStatisticsManager);

        const rules = this.getGameRules();
        this.statistics = new PhrasesStatisticsManager(subjects, rules.storageKey, rules.globalStorageKey, storage);
    }

    getGameRules(): GameRules {
        return {
            name: 'Guess Phrases',
            variant: 'guessPhrase',
            storageKey: 'GUESS_THE_PHRASE_GAME_STATS',
            globalStorageKey: 'GLOBAL_PHRASE_STATS',
            showImage: false,
            showTranslation: false,
            showWord: true,
            showWordPronunciation: true,
            options: 'translation',
            optionPronunciation: false,
            totalInGameSubjectsToLearn: GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN,
            selectedWordEntryTypes: [],
            ...this.activeConfig,
        };
    }
}
