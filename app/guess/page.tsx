'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Container, IconButton, Stack, Typography } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { WordRecord, WORDS_DICTIONARY } from '@/lib/words';
import WordCard from '../words/WordCard';
import OptionButton from './OptionButton';
import FinishedSummary from './FinishedSummary';

const STORAGE_KEY = 'guess_game_learned_words';
const EXTRA_DECOYS = ['apple', 'book', 'window', 'chair', 'eraser', 'lamp'];

const ScoreHeader = ({
    learnedCount,
    totalCount,
    score,
    onExit,
    showScore = true,
}: {
    learnedCount: number;
    totalCount: number;
    score: number;
    onExit: () => void;
    showScore?: boolean;
}) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
        }}
    >
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                flex: 1,
                mr: 2,
                minWidth: 0,
            }}
        >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, minWidth: 0 }}>
                Guess Word Game
            </Typography>
            <Typography variant="h4" component="h1" sx={{ minWidth: 80, textAlign: 'center' }}>
                ({learnedCount} / {totalCount})
            </Typography>
            {showScore && (
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, textAlign: 'right' }}>
                    {Number.isNaN(score) ? 0 : score}%
                </Typography>
            )}
        </Box>
        <IconButton aria-label="Return to main menu" onClick={onExit}>
            <HighlightOffIcon fontSize="large" />
        </IconButton>
    </Box>
);

const shuffle = (values: string[]) => {
    const arr = [...values];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const uniqueOptions = (words: WordRecord[], answer: WordRecord) => {
    const pool = new Set<string>([
        ...words.map((item) => item.word),
        ...EXTRA_DECOYS,
    ]);
    pool.delete(answer.word);

    const decoys = shuffle(Array.from(pool)).slice(0, 4);
    return shuffle([answer.word, ...decoys]);
};

const pickNextWord = (words: WordRecord[], learned: Set<string>) => {
    const unlearned = words.filter((item) => !learned.has(item.word));
    const pool = unlearned.length > 0 ? unlearned : words;
    return pool[Math.floor(Math.random() * pool.length)];
};

const loadLearnedFromStorage = () => {
    if (typeof window === 'undefined') {
        return new Set<string>();
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return new Set<string>();
    }

    try {
        const parsed: string[] = JSON.parse(stored);
        return new Set(parsed);
    } catch {
        return new Set<string>();
    }
};

const persistLearned = (learned: Set<string>) => {
    if (typeof window === 'undefined') {
        return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(learned)));
};

export default function GuessWordGame() {
    const words = useMemo(() => WORDS_DICTIONARY, []);
    const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
    const [currentWord, setCurrentWord] = useState<WordRecord | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [glowingOption, setGlowingOption] = useState<string | null>(null);
    const [shakingOption, setShakingOption] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const synthRef = useRef<SpeechSynthesis | null>(null);

    const speak = useCallback(
        (value: string) => {
            if (!synthRef.current) {
                setError('Speech synthesis is not available in this browser.');
                return;
            }
            setError(null);
            synthRef.current.cancel();
            const utterance = new SpeechSynthesisUtterance(value);
            synthRef.current.speak(utterance);
        },
        [setError],
    );

    const setupRound = useCallback(
        (learned: Set<string>) => {
            if (learned.size >= words.length) {
                setIsFinished(true);
                setCurrentWord(null);
                setOptions([]);
                return;
            }

            setIsFinished(false);
            const next = pickNextWord(words, learned);
            setCurrentWord(next);
            setOptions(uniqueOptions(words, next));
        },
        [words],
    );

    useEffect(() => {
        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'x') {
                router.push('/');
            }
        };

        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, [router]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
        } else {
            setError('Speech synthesis is not available in this browser.');
        }

        const stored = loadLearnedFromStorage();
        setLearnedWords(stored);
        setupRound(stored);

        return () => synthRef.current?.cancel();
    }, [setupRound, words]);

    const pronounceWord = useCallback(() => {
        if (currentWord) {
            speak(currentWord.word);
        }
    }, [currentWord, speak]);

    const handleGuess = useCallback(
        (guess: string) => {
            if (!currentWord || isTransitioning) {
                return;
            }

            const isCorrect = guess === currentWord.word;
            if (isCorrect) {
                const updatedLearned = new Set(learnedWords);
                updatedLearned.add(currentWord.word);
                setLearnedWords(updatedLearned);
                persistLearned(updatedLearned);

                speak(currentWord.word);

                setGlowingOption(guess);
                setIsTransitioning(true);

                window.setTimeout(() => {
                    if (updatedLearned.size >= words.length) {
                        setIsFinished(true);
                        setCurrentWord(null);
                        setOptions([]);
                    } else {
                        setupRound(updatedLearned);
                    }
                    setGlowingOption(null);
                    setIsTransitioning(false);
                }, 3000);
                return;
            }

            setShakingOption(guess);
            window.setTimeout(() => setShakingOption(null), 700);
        },
        [currentWord, isTransitioning, learnedWords, setupRound, speak],
    );

    const score = Math.round((learnedWords.size / words.length) * 100);

    const handleRestart = useCallback(() => {
        const reset = new Set<string>();
        setLearnedWords(reset);
        persistLearned(reset);
        setGlowingOption(null);
        setShakingOption(null);
        setIsTransitioning(false);
        setupRound(reset);
    }, [setupRound]);

    return (
        <Container maxWidth="md">
            <Box sx={{minHeight: '100vh', py: 4, position: 'relative'}}>
                <ScoreHeader
                    learnedCount={learnedWords.size}
                    totalCount={words.length}
                    score={score}
                    showScore={!isFinished}
                    onExit={() => router.push('/')}
                />

                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {error}
                    </Alert>
                )}

                {isFinished ? (
                    <FinishedSummary
                        score={score}
                        learnedCount={learnedWords.size}
                        totalCount={words.length}
                        onRestart={handleRestart}
                    />
                ) : (
                    <Stack spacing={3}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <Box sx={{width: {xs: '100%', sm: 360}, maxWidth: 420}}>
                                {currentWord && (
                                    <WordCard
                                        word={currentWord}
                                        guessMode
                                        onPronounce={pronounceWord}
                                    />
                                )}
                            </Box>
                        </Box>

                        <Stack spacing={1.5}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 1.5,
                                    justifyContent: 'center',
                                }}
                            >
                                {options.map((option) => {
                                    const isGlowing = glowingOption === option;
                                    const isShaking = shakingOption === option;
                                    const shouldFade = isTransitioning && !isGlowing;

                                    return (
                                        <OptionButton
                                            key={option}
                                            option={option}
                                            isGlowing={isGlowing}
                                            isShaking={isShaking}
                                            shouldFade={shouldFade}
                                            isLocked={isTransitioning}
                                            onGuess={handleGuess}
                                        />
                                    );
                                })}
                            </Box>
                        </Stack>
                    </Stack>
                )}
            </Box>
        </Container>
    );
}
