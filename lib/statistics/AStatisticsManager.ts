export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem?(key: string): void;
}

export interface GeneralPhraseVariantStats {
    totalAttempts: number;
    correctAttempts: number;
    wrongAttempts: number;
    learnedItemsCount: number;
    totalItemsCount: number;
}

export abstract class AStatisticsManager {
    protected storage: StorageLike;

    protected constructor(storage?: StorageLike) {
        this.storage =
            storage ??
            (typeof window !== 'undefined' ? window.localStorage : AStatisticsManager.createMemoryStorage());
    }

    protected static createMemoryStorage(): StorageLike {
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
    }

    protected loadFromStorage<T>(
        key: string,
        fallbackFactory: () => T,
        sanitizer: (value: unknown) => T | null,
    ): T {
        const stored = this.storage.getItem(key);
        if (!stored) return fallbackFactory();
        try {
            const parsed: unknown = JSON.parse(stored);
            const sanitized = sanitizer(parsed);
            return sanitized ?? fallbackFactory();
        } catch {
            return fallbackFactory();
        }
    }

    protected saveToStorage(key: string, value: unknown) {
        this.storage.setItem(key, JSON.stringify(value));
    }
}
