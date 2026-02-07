export const SELECTED_WORDS_STORAGE_KEY = 'SELECTED_WORDS_TO_LEARN';

export class SelectedWordsStorage {
    private static getStorage(): Storage | null {
        if (typeof window === 'undefined') {
            return null;
        }
        return window.localStorage;
    }

    static getSelectedWords(): string[] {
        const storage = this.getStorage();
        if (!storage) return [];

        const data = storage.getItem(SELECTED_WORDS_STORAGE_KEY);
        if (!data) return [];

        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse selected words', e);
            return [];
        }
    }

    static saveSelectedWords(words: string[]) {
        const storage = this.getStorage();
        if (!storage) return;

        storage.setItem(SELECTED_WORDS_STORAGE_KEY, JSON.stringify(words));
    }

    static addWord(word: string) {
        const words = new Set(this.getSelectedWords());
        words.add(word);
        this.saveSelectedWords(Array.from(words));
    }

    static removeWord(word: string) {
        const words = new Set(this.getSelectedWords());
        words.delete(word);
        this.saveSelectedWords(Array.from(words));
    }

    static isWordSelected(word: string): boolean {
        return this.getSelectedWords().includes(word);
    }

    static toggleWord(word: string) {
        const words = new Set(this.getSelectedWords());
        if (words.has(word)) {
            words.delete(word);
        } else {
            words.add(word);
        }
        this.saveSelectedWords(Array.from(words));
    }

    static clearSelection() {
        const storage = this.getStorage();
        if (!storage) return;
        storage.removeItem(SELECTED_WORDS_STORAGE_KEY);
    }
}
