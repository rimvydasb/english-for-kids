import { InGameStatistics, PhraseRecord } from '@/lib/types';
import {
    AStatisticsManager,
    GeneralPhraseVariantStats,
    GlobalStatsMap,
    InGameStatsMap,
    StorageLike,
} from '@/lib/statistics/AStatisticsManager';

export interface PhraseStatisticsSnapshot {
    globalStats: GlobalStatsMap;
    inGameStats: InGameStatsMap;
    variantStats: GeneralPhraseVariantStats;
}

export class PhrasesStatisticsManager extends AStatisticsManager {
    private phrases: PhraseRecord[];

    private globalStats: GlobalStatsMap;

    private inGameStats: InGameStatsMap;

    constructor(phrases: PhraseRecord[], storage?: StorageLike) {
        super(storage);
        this.phrases = phrases;
        this.globalStats = this.createEmptyGlobalStats(phrases);
        this.inGameStats = this.createEmptyInGameStats(phrases);
        this.loadAll();
    }

    loadAll(): PhraseStatisticsSnapshot {
        this.globalStats = this.loadGlobalStats();
        this.inGameStats = this.loadInGameStats();
        return this.getSnapshot();
    }

    getSnapshot(): PhraseStatisticsSnapshot {
        return {
            globalStats: this.cloneGlobalStats(this.globalStats),
            inGameStats: this.cloneInGameStats(this.inGameStats),
            variantStats: this.computeVariantStatsSnapshot(),
        };
    }

    recordAttempt(phrase: string, isCorrect: boolean): PhraseStatisticsSnapshot {
        const current = this.ensurePhrase(this.inGameStats, phrase);
        const updated = { ...current };
        updated.totalAttempts += 1;
        if (isCorrect) {
            updated.correctAttempts += 1;
            updated.learned = true;
        } else {
            updated.wrongAttempts += 1;
            updated.learned = false;
        }
        this.inGameStats[phrase] = updated;
        this.saveInGameStats();
        return this.getSnapshot();
    }

    resetVariant(): PhraseStatisticsSnapshot {
        this.inGameStats = this.createEmptyInGameStats(this.phrases);
        this.saveInGameStats();
        return this.getSnapshot();
    }

    resetGlobal(): PhraseStatisticsSnapshot {
        this.globalStats = this.createEmptyGlobalStats(this.phrases);
        this.saveGlobalStats();
        return this.getSnapshot();
    }

    finalizeVariant(): PhraseStatisticsSnapshot {
        this.globalStats = this.rebuildGlobalStats();
        this.saveGlobalStats();
        return this.getSnapshot();
    }

    private loadGlobalStats() {
        return this.loadFromStorage(
            'GLOBAL_PHRASE_STATS',
            () => this.createEmptyGlobalStats(this.phrases),
            (parsed) => this.sanitizeGlobalStats(parsed, this.phrases),
        );
    }

    private saveGlobalStats() {
        this.saveToStorage('GLOBAL_PHRASE_STATS', this.globalStats);
    }

    private loadInGameStats() {
        return this.loadFromStorage(
            'PHRASES_GUESS_STATS',
            () => this.createEmptyInGameStats(this.phrases),
            (parsed) => this.sanitizeInGameStats(parsed, this.phrases),
        );
    }

    private saveInGameStats() {
        this.saveToStorage('PHRASES_GUESS_STATS', this.inGameStats);
    }

    private ensurePhrase(stats: InGameStatsMap, phrase: string): InGameStatistics {
        return this.ensureInGameEntry(stats, phrase);
    }

    private computeVariantStatsSnapshot(): GeneralPhraseVariantStats {
        return this.computeVariantStats(this.inGameStats);
    }

    private rebuildGlobalStats(): GlobalStatsMap {
        return this.rebuildGlobalFromInGame(this.inGameStats, this.phrases);
    }
}
