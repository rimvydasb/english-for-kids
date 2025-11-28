'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Alert, Box, Button, Container, IconButton, Stack, Typography,} from '@mui/material';
import {keyframes} from '@mui/material/styles';
import {WordRecord, WORDS_DICTIONARY} from '@/lib/words';
import WordCard from '../words/WordCard';
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

const STORAGE_KEY = 'guess_game_learned_words';
const EXTRA_DECOYS = ['apple', 'book', 'window', 'chair', 'eraser', 'lamp'];

const glowAnimation = keyframes`
    0% {
        box-shadow: 0 0 0 0 rgba(122, 150, 248, 0.4);
    }
    40% {
        box-shadow: 0 0 18px 8px rgba(28, 72, 223, 0.35);
    }
    80% {
        box-shadow: 0 0 10px 2px rgba(67, 255, 0, 0.25);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
    }
`;

const shakeAnimation = keyframes`
  0% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
  100% { transform: translateX(0); }
`;

const fadeAwayAnimation = keyframes`
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.96); }
`;

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
    const [glowingOption, setGlowingOption] = useState<string | null>(null);
    const [shakingOption, setShakingOption] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const synthRef = useRef<SpeechSynthesis | null>(null);

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
        const nextWord = pickNextWord(words, stored);
        setCurrentWord(nextWord);
        setOptions(uniqueOptions(words, nextWord));

        return () => synthRef.current?.cancel();
    }, [words]);

    const pronounceWord = () => {
        if (!currentWord) {
            return;
        }

        if (!synthRef.current) {
            setError('Speech synthesis is not available in this browser.');
            return;
        }

        setError(null);
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(currentWord.word);
        synthRef.current.speak(utterance);
    };

    const handleGuess = (guess: string) => {
        if (!currentWord || isTransitioning) {
            return;
        }

        const isCorrect = guess === currentWord.word;
        if (isCorrect) {
            const updatedLearned = new Set(learnedWords);
            updatedLearned.add(currentWord.word);
            setLearnedWords(updatedLearned);
            persistLearned(updatedLearned);

            if (synthRef.current) {
                setError(null);
                synthRef.current.cancel();
                const utterance = new SpeechSynthesisUtterance(currentWord.word);
                synthRef.current.speak(utterance);
            }

            setGlowingOption(guess);
            setIsTransitioning(true);

            window.setTimeout(() => {
                const nextWord = pickNextWord(words, updatedLearned);
                setCurrentWord(nextWord);
                setOptions(uniqueOptions(words, nextWord));
                setGlowingOption(null);
                setIsTransitioning(false);
            }, 3000);
            return;
        }

        setShakingOption(guess);
        window.setTimeout(() => setShakingOption(null), 700);
    };

    const score = Math.round((learnedWords.size / words.length) * 100);

    return (
        <Container maxWidth="md">
            <Box sx={{minHeight: '100vh', py: 4, position: 'relative'}}>
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
                        <Typography variant="h4" component="h1" sx={{fontWeight: 700, minWidth: 0}}>
                            Guess Word Game
                        </Typography>
                        <Typography variant="h4" component="h1" sx={{minWidth: 80, textAlign: 'center'}}>
                            ({learnedWords.size} / {words.length})
                        </Typography>
                        <Typography variant="h4" component="h1" sx={{fontWeight: 700, textAlign: 'right'}}>
                            {Number.isNaN(score) ? 0 : score}%
                        </Typography>
                    </Box>
                    <IconButton aria-label="Return to main menu" onClick={() => router.push('/')}>
                        <HighlightOffIcon fontSize="large"/>
                    </IconButton>
                </Box>

                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {error}
                    </Alert>
                )}

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
                                    labelOverride="???"
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
                                const minWidth = Math.max(option.length * 14, 140);
                                const isGlowing = glowingOption === option;
                                const isShaking = shakingOption === option;
                                const shouldFade = isTransitioning && !isGlowing;

                                return (
                                    <Button
                                        key={option}
                                        variant={isGlowing ? 'contained' : 'outlined'}
                                        color={isShaking ? 'error' : isGlowing ? 'success' : 'primary'}
                                        size="large"
                                        onClick={() => handleGuess(option)}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: 25,
                                            minWidth,
                                            px: 2.5,
                                            pointerEvents: isTransitioning ? 'none' : 'auto',
                                            animation: isGlowing
                                                ? `${glowAnimation} 3s ease-in-out`
                                                : shouldFade
                                                    ? `${fadeAwayAnimation} 3s forwards`
                                                    : isShaking
                                                        ? `${shakeAnimation} 0.5s ease`
                                                        : 'none',
                                            bgcolor: isGlowing ? 'success.light' : undefined,
                                            borderColor: isShaking ? 'error.main' : undefined,
                                            color: isShaking ? 'error.main' : undefined,
                                            opacity: shouldFade ? 0 : 1,
                                        }}
                                    >
                                        {option}
                                    </Button>
                                );
                            })}
                        </Box>
                    </Stack>
                </Stack>
            </Box>
        </Container>
    );
}
