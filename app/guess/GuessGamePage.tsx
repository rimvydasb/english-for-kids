'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import { WordRecord, WORDS_DICTIONARY } from '@/lib/words';
import WordCard, { WordCardMode } from '@/components/WordCard';
import OptionButton from './OptionButton';
import FinishedSummary from './FinishedSummary';
import GuessScoreHeader from '@/components/GuessScoreHeader';
import VariantStatsBar from '@/components/VariantStatsBar';
import { GameVariant, VARIANT_CONFIG, VariantStats, WordStatistics } from './types';
import { WordStatisticsManager } from './WordStatisticsManager';
import { usePronunciation } from '@/lib/usePronunciation';

const shuffle = (values: string[]) => {
    const arr = [...values];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const buildOptions = (allWords: WordRecord[], answer: WordRecord) => {
    const pool = allWords.map((item) => item.word).filter((value) => value !== answer.word);
    const decoys = shuffle(pool).slice(0, 4);
    return shuffle([answer.word, ...decoys]);
};

const findWord = (words: WordRecord[], value: string) => words.find((item) => item.word === value);

const hasCompletedAllWords = (stats: Record<string, WordStatistics>, words: WordRecord[]) =>
    words.every((item) => {
        const record = stats[item.word];
        return record && record.learned && record.correctAttempts > 0;
    });

export default function GuessGamePage({ variant }: { variant: GameVariant }) {
    const router = useRouter();
    const words = useMemo(() => WORDS_DICTIONARY, []);
    const [globalStats, setGlobalStats] = useState<Record<string, WordStatistics>>({});
    const [variantStats, setVariantStats] = useState<Record<GameVariant, VariantStats>>({
        guessTheWord: { totalAttempts: 0, correctAttempts: 0, wrongAttempts: 0 },
        listenAndGuess: { totalAttempts: 0, correctAttempts: 0, wrongAttempts: 0 },
    });
    const [currentWord, setCurrentWord] = useState<WordRecord | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [glowingOption, setGlowingOption] = useState<string | null>(null);
    const [shakingOption, setShakingOption] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [resolvedOption, setResolvedOption] = useState<string | null>(null);
    const [cardModeOverride, setCardModeOverride] = useState<WordCardMode | null>(null);
    const [pendingCompletion, setPendingCompletion] = useState(false);
    const [glowSeed, setGlowSeed] = useState(0);
    const managerRef = useRef<WordStatisticsManager | null>(null);
    const playedOnOpenRef = useRef(false);
    const { activeWord, error, pronounceWord: playWord, voicesReady } = usePronunciation();

    const setupRound = useCallback(
        (stats: Record<string, WordStatistics>) => {
            playedOnOpenRef.current = false;
            const candidates = words.filter((item) => {
                const record = stats[item.word];
                return !record || !record.learned || record.correctAttempts === 0;
            });

            if (candidates.length === 0) {
                setIsFinished(true);
                setCurrentWord(null);
                setOptions([]);
                return;
            }

            const next = candidates[Math.floor(Math.random() * candidates.length)];
            setIsFinished(false);
            setCurrentWord(next);
            setOptions(buildOptions(words, next));
            setGlowingOption(null);
            setShakingOption(null);
            setIsTransitioning(false);
            setResolvedOption(null);
            setCardModeOverride(null);
            setPendingCompletion(false);
            setGlowSeed(0);

        },
        [words],
    );

    useEffect(() => {
        const manager = new WordStatisticsManager(words);
        managerRef.current = manager;
        const { globalStats: loadedGlobal, variantStats: loadedVariants } = manager.loadAll();

        setGlobalStats(loadedGlobal);
        setVariantStats(loadedVariants);
        setupRound(loadedGlobal);
    }, [setupRound, words]);

    useEffect(() => {
        if (
            currentWord &&
            VARIANT_CONFIG[variant].cardMode === WordCardMode.ListenAndGuess &&
            !playedOnOpenRef.current
        ) {
            playWord(currentWord, {
                allowExamples: false,
                suppressPendingError: true,
                suppressNotAllowedError: true,
            });
            playedOnOpenRef.current = true;
        }
    }, [currentWord, playWord, variant, voicesReady]);

    const handleGuess = useCallback(
        (guess: string) => {
            if (!currentWord || isTransitioning) {
                return;
            }

            const isCorrect = guess === currentWord.word;
            const updated = managerRef.current?.recordAttempt(variant, guess, isCorrect);
            if (updated) {
                setGlobalStats(updated.globalStats);
                setVariantStats(updated.variantStats as Record<GameVariant, VariantStats>);
            }

            if (isCorrect) {
                const latestGlobal = updated?.globalStats ?? managerRef.current?.getGlobalStats() ?? globalStats;
                const complete = hasCompletedAllWords(latestGlobal, words);

                playWord(currentWord, {
                    allowExamples: false,
                    suppressPendingError: true,
                    suppressNotAllowedError: true,
                });

                setGlowingOption(guess);
                setShakingOption(null);
                setResolvedOption(guess);
                setCardModeOverride(WordCardMode.Learning);
                setIsTransitioning(true);
                setPendingCompletion(complete);
                setGlowSeed(Math.random());
                return;
            }

            setShakingOption(guess);
            window.setTimeout(() => setShakingOption(null), 700);
        },
        [currentWord, globalStats, isTransitioning, playWord, variant, words],
    );

    const handleNextWord = useCallback(() => {
        const latestGlobal = managerRef.current?.getGlobalStats() ?? globalStats;
        if (pendingCompletion) {
            setIsFinished(true);
            setCurrentWord(null);
            setOptions([]);
        } else {
            setupRound(latestGlobal);
        }
        setGlowingOption(null);
        setShakingOption(null);
        setResolvedOption(null);
        setCardModeOverride(null);
        setPendingCompletion(false);
        setIsTransitioning(false);
        setGlowSeed(0);
    }, [globalStats, pendingCompletion, setupRound]);

    const handleRestart = useCallback(() => {
        const updated = managerRef.current?.resetLearnedFlags();
        if (updated) {
            setGlobalStats(updated.globalStats);
            setVariantStats(updated.variantStats as Record<GameVariant, VariantStats>);
            setupRound(updated.globalStats);
        }
        setGlowingOption(null);
        setShakingOption(null);
        setIsTransitioning(false);
        setIsFinished(false);
        setResolvedOption(null);
        setCardModeOverride(null);
        setPendingCompletion(false);
        setGlowSeed(0);
    }, [setupRound]);

    const handleResetStats = useCallback(() => {
        const updated = managerRef.current?.resetAll();
        if (updated) {
            setGlobalStats(updated.globalStats);
            setVariantStats(updated.variantStats as Record<GameVariant, VariantStats>);
            setupRound(updated.globalStats);
        }
        setIsFinished(false);
        setGlowingOption(null);
        setShakingOption(null);
        setIsTransitioning(false);
        setResolvedOption(null);
        setCardModeOverride(null);
        setPendingCompletion(false);
        setGlowSeed(0);
    }, [setupRound]);

    const learnedCount = useMemo(
        () =>
            Object.values(globalStats).filter(
                (stat) => stat.learned && stat.correctAttempts > 0,
            ).length,
        [globalStats],
    );
    const score = Math.round((learnedCount / words.length) * 100);
    const optionMode = VARIANT_CONFIG[variant].optionMode;
    const activeVariantStats = variantStats[variant] ?? { totalAttempts: 0, correctAttempts: 0, wrongAttempts: 0 };

    return (
        <Container maxWidth="md">
            <Box sx={{ minHeight: '100vh', py: 4, position: 'relative' }}>
                <GuessScoreHeader
                    learnedCount={learnedCount}
                    totalCount={words.length}
                    score={score}
                    showScore={!isFinished}
                    variant={variant}
                    onExit={() => router.push('/')}
                />

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {isFinished ? (
                    <FinishedSummary
                        score={score}
                        learnedCount={learnedCount}
                        totalCount={words.length}
                        onRestart={handleRestart}
                        onResetStats={handleResetStats}
                        wordStats={words.map((item) =>
                            globalStats[item.word] ?? {
                                word: item.word,
                                learned: false,
                                totalAttempts: 0,
                                correctAttempts: 0,
                                wrongAttempts: 0,
                            },
                        )}
                        variantLabel={VARIANT_CONFIG[variant].label}
                        variantStats={activeVariantStats}
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
                            <Box sx={{ width: { xs: '100%', sm: 360 }, maxWidth: 420 }}>
                                {currentWord && (
                                    <WordCard
                                        word={currentWord}
                                        mode={cardModeOverride ?? VARIANT_CONFIG[variant].cardMode}
                                        active={activeWord === currentWord.word}
                                        onPronounce={() => playWord(currentWord)}
                                    />
                                )}
                            </Box>
                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                Pick the correct option below. The card stays put until you answer correctly.
                            </Typography>
                            <VariantStatsBar stats={activeVariantStats} />
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
                                    const optionWord = findWord(words, option);
                                    const label =
                                        optionMode === 'translation'
                                            ? optionWord?.translation || option
                                            : optionWord?.word || option;
                                    const isGlowing = glowingOption === option;
                                    const isShaking = shakingOption === option;
                                    const shouldHide = Boolean(resolvedOption && option !== resolvedOption);
                                    const shouldFade = false;

                                    if (shouldHide) {
                                        return null;
                                    }

                                    return (
                                        <OptionButton
                                            key={option}
                                            value={option}
                                            label={label}
                                            isGlowing={isGlowing}
                                            isShaking={isShaking}
                                            shouldFade={shouldFade}
                                            isLocked={isTransitioning}
                                            glowSeed={glowSeed}
                                            onGuess={handleGuess}
                                        />
                                    );
                                })}
                            </Box>

                            {resolvedOption && (
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        size="large"
                                        onClick={handleNextWord}
                                    >
                                        {pendingCompletion ? 'See summary' : 'Next word'}
                                    </Button>
                                </Box>
                            )}
                        </Stack>
                    </Stack>
                )}
            </Box>
        </Container>
    );
}
