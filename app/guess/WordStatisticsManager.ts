import { WordRecord } from '@/lib/words';
import { GameVariant, VARIANT_CONFIG, VariantStats, WordStatistics } from './types';

interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem?(key: string): void;
}

const GLOBAL_KEY = 'GLOBAL_WORD_STATS';

const emptyVariantStats = (): VariantStats => ({
    totalAttempts: 0,
    correctAttempts: 0,
    wrongAttempts: 0,
});

const createEmptyWordStats = (words: WordRecord[]): Record<string, WordStatistics> =>
    words.reduce<Record<string, WordStatistics>>((acc, item) => {
        acc[item.word] = {
            word: item.word,
            learned: false,
            totalAttempts: 0,
            correctAttempts: 0,
            wrongAttempts: 0,
        };
        return acc;
    }, {});

const createMemoryStorage = (): StorageLike => {
    const store: Record<string, string> = {};
    return {
        getItem: (key) => (key in store ? store[key] : null),
        setItem: (key, value) => {
            store[key] = value;
        },
        removeItem: (key) => {
            delete store[key];
        },
    };
};

export class WordStatisticsManager {
    private storage: StorageLike;

    private words: WordRecord[];

    private globalStats: Record<string, WordStatistics>;

    private variantStats: Record<GameVariant, VariantStats>;

    constructor(words: WordRecord[], storage?: StorageLike) {
        this.words = words;
        this.storage = storage ?? (typeof window !== 'undefined' ? window.localStorage : createMemoryStorage());
        this.globalStats = createEmptyWordStats(words);
        this.variantStats = {
            guessTheWord: emptyVariantStats(),
            listenAndGuess: emptyVariantStats(),
        };
        this.loadAll();
    }

    loadAll() {
        this.globalStats = this.loadGlobalStats();
        this.variantStats = this.loadVariantStats();
        return this.getSnapshot();
    }

    getSnapshot() {
        return {
            globalStats: { ...this.globalStats },
            variantStats: { ...this.variantStats },
        };
    }

    getGlobalStats() {
        return { ...this.globalStats };
    }

    getVariantStats(variant: GameVariant) {
        return { ...this.variantStats[variant] };
    }

    recordAttempt(variant: GameVariant, word: string, isCorrect: boolean) {
        const updated = this.ensureWord(word);
        updated.totalAttempts += 1;
        if (isCorrect) {
            updated.correctAttempts += 1;
            updated.learned = true;
        } else {
            updated.wrongAttempts += 1;
            updated.learned = false;
        }
        this.globalStats[word] = updated;
        this.saveGlobalStats();

        const variantStat = { ...this.variantStats[variant] };
        variantStat.totalAttempts += 1;
        if (isCorrect) {
            variantStat.correctAttempts += 1;
        } else {
            variantStat.wrongAttempts += 1;
        }
        this.variantStats[variant] = variantStat;
        this.saveVariantStats(variant);

        return this.getSnapshot();
    }

    resetLearnedFlags() {
        const reset = createEmptyWordStats(this.words);
        Object.keys(this.globalStats).forEach((key) => {
            const existing = this.globalStats[key];
            reset[key] = {
                ...existing,
                learned: false,
            };
        });
        this.globalStats = reset;
        this.saveGlobalStats();
        return this.getSnapshot();
    }

    resetAll() {
        this.globalStats = createEmptyWordStats(this.words);
        this.variantStats = {
            guessTheWord: emptyVariantStats(),
            listenAndGuess: emptyVariantStats(),
        };
        this.saveGlobalStats();
        (Object.keys(VARIANT_CONFIG) as GameVariant[]).forEach((variant) => this.saveVariantStats(variant));
        return this.getSnapshot();
    }

    private ensureWord(word: string): WordStatistics {
        if (!this.globalStats[word]) {
            this.globalStats[word] = {
                word,
                learned: false,
                totalAttempts: 0,
                correctAttempts: 0,
                wrongAttempts: 0,
            };
        }
        return { ...this.globalStats[word] };
    }

    private loadGlobalStats() {
        const stored = this.storage.getItem(GLOBAL_KEY);
        if (!stored) return createEmptyWordStats(this.words);
        try {
            const parsed: Record<string, WordStatistics> = JSON.parse(stored);
            return { ...createEmptyWordStats(this.words), ...parsed };
        } catch {
            return createEmptyWordStats(this.words);
        }
    }

    private saveGlobalStats() {
        this.storage.setItem(GLOBAL_KEY, JSON.stringify(this.globalStats));
    }

    private loadVariantStats(): Record<GameVariant, VariantStats> {
        const result: Record<GameVariant, VariantStats> = {
            guessTheWord: emptyVariantStats(),
            listenAndGuess: emptyVariantStats(),
        };

        (Object.keys(VARIANT_CONFIG) as GameVariant[]).forEach((variant) => {
            const key = VARIANT_CONFIG[variant].statsKey;
            const stored = this.storage.getItem(key);
            if (!stored) {
                result[variant] = emptyVariantStats();
                return;
            }
            try {
                const parsed: VariantStats = JSON.parse(stored);
                result[variant] = { ...emptyVariantStats(), ...parsed };
            } catch {
                result[variant] = emptyVariantStats();
            }
        });

        return result;
    }

    private saveVariantStats(variant: GameVariant) {
        const key = VARIANT_CONFIG[variant].statsKey;
        this.storage.setItem(key, JSON.stringify(this.variantStats[variant]));
    }
}
