import path from 'path';
import fs from 'fs';
import {WORDS_DICTIONARY_DATA} from '@/lib/config';
import {WordRecord} from '@/lib/types';

describe('Integrity Check: Words and Images', () => {
    const publicImagesDir = path.join(process.cwd(), 'public', 'images');
    // Get all files, filter out hidden files like .DS_Store
    const onDiskImages = fs.readdirSync(publicImagesDir).filter((f) => !f.startsWith('.'));

    it('should have an image file for every word (except numbers)', () => {
        const missingImages: string[] = [];

        WORDS_DICTIONARY_DATA.forEach((entry) => {
            const wordRecord = new WordRecord(entry);
            const imageUrl = wordRecord.getImageUrl();

            // Numbers return null, skip them
            if (imageUrl === null) return;

            // imageUrl is like "/images/filename.png", we extract "filename.png"
            const filename = imageUrl.split('/').pop()!;

            if (!onDiskImages.includes(filename)) {
                missingImages.push(`${entry.word} (expects: ${filename})`);
            }
        });

        if (missingImages.length > 0) {
            console.error('Missing images for words:', missingImages);
        }
        expect(missingImages).toEqual([]);
    });

    it('should use every image file in public/images', () => {
        const usedImages = new Set<string>();

        WORDS_DICTIONARY_DATA.forEach((entry) => {
            const wordRecord = new WordRecord(entry);
            const imageUrl = wordRecord.getImageUrl();
            if (imageUrl) {
                const filename = imageUrl.split('/').pop()!;
                usedImages.add(filename);
            }
        });

        const unusedImages = onDiskImages.filter((file) => !usedImages.has(file));

        if (unusedImages.length > 0) {
            console.error('Unused images on disk:', unusedImages);
        }
        expect(unusedImages).toEqual([]);
    });

    it('should have a dictionary entry for every word in a comma-separated filename', () => {
        const missingWords: string[] = [];
        const registeredWords = new Set(WORDS_DICTIONARY_DATA.map((w) => w.word));

        onDiskImages.forEach((filename) => {
            // Remove extension
            const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

            // specific logic for comma-separated files
            if (nameWithoutExt.includes(',')) {
                const words = nameWithoutExt.split(',');
                words.forEach((word) => {
                    if (!registeredWords.has(word)) {
                        missingWords.push(`File "${filename}" implies word "${word}", but it is not in dictionary.`);
                    }
                });
            }
        });

        if (missingWords.length > 0) {
            console.error('Missing dictionary entries for multi-word images:', missingWords);
        }
        expect(missingWords).toEqual([]);
    });
});
