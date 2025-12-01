'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Container, Stack } from '@mui/material';
import { WordRecord, WORDS_DICTIONARY } from '@/lib/words';
import WordCard, { WordCardMode } from '@/components/WordCard';
import OptionButton from './OptionButton';
import FinishedSummary from './FinishedSummary';
import GuessScoreHeader from '@/components/GuessScoreHeader';
import VariantStatsBar from '@/components/VariantStatsBar';
import { GameVariant, GlobalWordStatistics, VARIANT_CONFIG, WordStatistics } from '@/lib/guessTypes';
import { WordStatisticsManager } from '@/lib/WordStatisticsManager';
import { GeneralPhraseVariantStats } from '@/lib/statistics/AStatisticsManager';
import { usePronunciation } from '@/lib/usePronunciation';
import { buildWordOptions } from '@/lib/WordGameManager';

const findWord = (words: WordRecord[], value: string) => words.find((item) => item.word === value);

const hasCompletedAllWords = (stats: Record<string, WordStatistics>, words: WordRecord[]) =>
    words.every((item) => {
        const record = stats[item.word];
        return record && record.learned && record.correctAttempts > 0;
    });

export default function GuessGamePage({ variant }: { variant: GameVariant }) {
    const router = useRouter();
    const words = useMemo(() => WORDS_DICTIONARY, []);
    // @Todo: WordStatisticsManager manages global statistics as well and updates them only when game is completed, so there's no need having separate state for global stats here.
    const [globalStats, setGlobalStats] = useState<Record<string, GlobalWordStatistics>>({});
    const [variantWordStats, setVariantWordStats] = useState<
        Record<GameVariant, Record<string, WordStatistics>>
    >({
        guessTheWord: {},
        listenAndGuess: {},
    });
    const [variantStats, setVariantStats] = useState<Record<GameVariant, GeneralPhraseVariantStats>>({
        guessTheWord: {
            totalAttempts: 0,
            correctAttempts: 0,
            wrongAttempts: 0,
            learnedItemsCount: 0,
            totalItemsCount: words.length,
        },
        listenAndGuess: {
            totalAttempts: 0,
            correctAttempts: 0,
            wrongAttempts: 0,
            learnedItemsCount: 0,
            totalItemsCount: words.length,
        },
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
    const hasAnnouncedFinishRef = useRef(false);
    const playedOnOpenRef = useRef(false);
    const { activeWord, error, pronounceWord: playWord, voicesReady } = usePronunciation();
    const congratulationsRecord = useMemo(() => new WordRecord({type: 'verb', word: 'Great job' }), []);

    const setupRound = useCallback(
        (stats: Record<string, WordStatistics> = {}) => {
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
            setOptions(buildWordOptions(words, next));
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
        const {
            globalStats: loadedGlobal,
            variantStats: loadedVariants,
            variantWordStats: loadedVariantWordStats,
        } = manager.loadAll();

        setGlobalStats(loadedGlobal);
        setVariantStats(loadedVariants);
        setVariantWordStats(
            loadedVariantWordStats as Record<GameVariant, Record<string, WordStatistics>>,
        );
        setupRound(loadedVariantWordStats[variant]);
    }, [setupRound, variant, words]);

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

    useEffect(() => {
        if (!isFinished) {
            hasAnnouncedFinishRef.current = false;
            return;
        }

        if (hasAnnouncedFinishRef.current) {
            return;
        }

        playWord(congratulationsRecord, {
            allowExamples: false,
            suppressPendingError: true,
            suppressNotAllowedError: true,
        });
        hasAnnouncedFinishRef.current = true;
    }, [congratulationsRecord, isFinished, playWord]);

    const handleGuess = useCallback(
        (guess: string) => {
            if (!currentWord || isTransitioning) {
                return;
            }

            const isCorrect = guess === currentWord.word;
            const updated = managerRef.current?.recordAttempt(variant, guess, isCorrect);
            if (updated) {
                setVariantWordStats(
                    updated.variantWordStats as Record<GameVariant, Record<string, WordStatistics>>,
                );
                setVariantStats(
                    updated.variantStats as Record<GameVariant, GeneralPhraseVariantStats>,
                );
                setGlobalStats(updated.globalStats);
            }

            if (isCorrect) {
                const latestVariantStats =
                    updated?.variantWordStats ?? managerRef.current?.getSnapshot().variantWordStats;
                const variantWordStatsForRound = latestVariantStats?.[variant] ?? variantWordStats[variant];
                const complete = hasCompletedAllWords(variantWordStatsForRound ?? {}, words);

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
        [currentWord, isTransitioning, playWord, variant, variantWordStats, words],
    );

    const handleNextWord = useCallback(() => {
        if (pendingCompletion) {
            const updated = managerRef.current?.finalizeVariant();
            if (updated) {
                setGlobalStats(updated.globalStats);
                setVariantStats(
                    updated.variantStats as Record<GameVariant, GeneralPhraseVariantStats>,
                );
                setVariantWordStats(
                    updated.variantWordStats as Record<GameVariant, Record<string, WordStatistics>>,
                );
            }
            setIsFinished(true);
            setCurrentWord(null);
            setOptions([]);
        } else {
            const latest = managerRef.current?.getSnapshot().variantWordStats ?? variantWordStats;
            setupRound(latest[variant]);
        }
        setGlowingOption(null);
        setShakingOption(null);
        setResolvedOption(null);
        setCardModeOverride(null);
        setPendingCompletion(false);
        setIsTransitioning(false);
        setGlowSeed(0);
    }, [pendingCompletion, setupRound, variant, variantWordStats]);

    const handleRestart = useCallback(() => {
        const updated = managerRef.current?.resetVariant(variant);
        const variantSnapshot =
            updated?.variantWordStats?.[variant] ?? variantWordStats[variant] ?? {};
        if (updated) {
            setGlobalStats(updated.globalStats);
            setVariantStats(
                updated.variantStats as Record<GameVariant, GeneralPhraseVariantStats>,
            );
            setVariantWordStats(
                updated.variantWordStats as Record<GameVariant, Record<string, WordStatistics>>,
            );
        }
        setupRound(variantSnapshot);
        setGlowingOption(null);
        setShakingOption(null);
        setIsTransitioning(false);
        setIsFinished(false);
        setResolvedOption(null);
        setCardModeOverride(null);
        setPendingCompletion(false);
        setGlowSeed(0);
    }, [setupRound, variant, variantWordStats]);

    const optionMode = VARIANT_CONFIG[variant].optionMode;
    const activeVariantStats =
        variantStats[variant] ??
        ({
            totalAttempts: 0,
            correctAttempts: 0,
            wrongAttempts: 0,
            learnedItemsCount: 0,
            totalItemsCount: words.length,
        } as GeneralPhraseVariantStats);
    const learnedCount = activeVariantStats.learnedItemsCount;
    const score = Math.round((learnedCount / activeVariantStats.totalItemsCount) * 100);
    const safeScore = Number.isNaN(score) ? 0 : score;

    return (
        <Container maxWidth="md">
            <Box sx={{ minHeight: '100vh', py: 4, position: 'relative' }}>
                <GuessScoreHeader
                    learnedCount={learnedCount}
                    totalCount={activeVariantStats.totalItemsCount}
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
                        score={safeScore}
                        learnedCount={learnedCount}
                        totalCount={activeVariantStats.totalItemsCount}
                        onRestart={handleRestart}
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
                                    const shouldFade = Boolean(resolvedOption && option !== resolvedOption);

                                    return (
                                        <OptionButton
                                            key={option}
                                            value={option}
                                            label={label}
                                            isGlowing={isGlowing}
                                            isShaking={isShaking}
                                            shouldFade={shouldFade}
                                            isHidden={shouldHide}
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
                                        {pendingCompletion ? 'Finish!' : 'Next'}
                                    </Button>
                                </Box>
                            )}

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                }}
                            >
                                <VariantStatsBar stats={activeVariantStats} />
                            </Box>
                        </Stack>
                    </Stack>
                )}
            </Box>
        </Container>
    );
}
