import { WordRecord } from './words';

const DEFAULT_DECOYS = 4;

const shuffle = <T,>(values: T[]): T[] => {
    const arr = [...values];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export const buildWordOptions = (
    allWords: WordRecord[],
    answer: WordRecord,
    decoysNeeded = DEFAULT_DECOYS,
): string[] => {
    const candidates = allWords.filter((item) => item.word !== answer.word);
    const sameType = shuffle(
        candidates.filter((candidate) => candidate.type === answer.type),
    ).slice(0, decoysNeeded);

    let decoys = sameType;
    if (decoys.length < decoysNeeded) {
        const remaining = decoysNeeded - decoys.length;
        const otherTypes = shuffle(
            candidates.filter((candidate) => candidate.type !== answer.type),
        ).slice(0, remaining);
        decoys = [...decoys, ...otherTypes];
    }

    return shuffle([answer.word, ...decoys.map((item) => item.word)]);
};

export const WordGameManager = {
    buildWordOptions,
};
