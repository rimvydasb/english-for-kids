import {StorageLike} from '@/lib/statistics/AStatisticsManager';

export class MemoryStorage implements StorageLike {
    private store: Record<string, string> = {};

    getItem(key: string): string | null {
        return this.store[key] ?? null;
    }

    setItem(key: string, value: string): void {
        this.store[key] = value;
    }

    removeItem(key: string): void {
        delete this.store[key];
    }
}
