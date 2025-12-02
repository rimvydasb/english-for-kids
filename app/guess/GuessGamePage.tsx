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
import { VARIANT_CONFIG } from '@/lib/guessConfig';
import { GameVariant } from '@/lib/types';
import { WordStatisticsSnapshot } from '@/lib/statistics/WordStatisticsManager';
import { WordsGameManager } from '@/lib/game/WordsGameManager';
import { usePronunciation } from '@/lib/usePronunciation';

const createEmptySnapshot = (words: WordRecord[]): WordStatisticsSnapshot => {
    const emptyGlobal = words.reduce<Record<string, { key: string; correctAttempts: number; wrongAttempts: number }>>(
        (acc, word) => {
            acc[word.word] = { key: word.word, correctAttempts: 0, wrongAttempts: 0 };
            return acc;
        },
        {},
    );
    const buildVariantStats = () => ({
        totalAttempts: 0,
        correctAttempts: 0,
        wrongAttempts: 0,
        learnedItemsCount: 0,
        totalItemsCount: words.length,
    });
    const emptyVariantWordStats = words.reduce<Record<string, { key: string; totalAttempts: number; correctAttempts: number; wrongAttempts: number; learned: boolean }>>(
        (acc, word) => {
            acc[word.word] = {
                key: word.word,
                totalAttempts: 0,
                correctAttempts: 0,
                wrongAttempts: 0,
                learned: false,
            };
            return acc;
        },
        {},
    );

    return {
        globalStats: emptyGlobal,
        variantStats: {
            guessTheWord: buildVariantStats(),
            listenAndGuess: buildVariantStats(),
        },
        variantWordStats: {
            guessTheWord: { ...emptyVariantWordStats },
            listenAndGuess: { ...emptyVariantWordStats },
        },
    };
};

export default function GuessGamePage({ variant }: { variant: GameVariant }) {
    const router = useRouter();
    const words = useMemo(() => WORDS_DICTIONARY, []);
    const gameManager = useMemo(
        () => new WordsGameManager(words, variant, { groupBy: (word: WordRecord) => word.type }),
        [variant, words],
    );
    const [snapshot, setSnapshot] = useState<WordStatisticsSnapshot>(() => createEmptySnapshot(words));
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
    const hasAnnouncedFinishRef = useRef(false);
    const playedOnOpenRef = useRef(false);
    const { activeWord, error, pronounceWord: playWord, voicesReady } = usePronunciation();
    const congratulationsRecord = useMemo(() => new WordRecord({type: 'verb', word: 'Great job' }), []);

    const setupRound = useCallback(
        () => {
            playedOnOpenRef.current = false;
            const next = gameManager.drawNextCandidate();
            if (!next) {
                setIsFinished(true);
                setCurrentWord(null);
                setOptions([]);
                return;
            }

            setIsFinished(false);
            setCurrentWord(next);
            setOptions(gameManager.buildOptions(next));
            setGlowingOption(null);
            setShakingOption(null);
            setIsTransitioning(false);
            setResolvedOption(null);
            setCardModeOverride(null);
            setPendingCompletion(false);
            setGlowSeed(0);
        },
        [gameManager],
    );

    useEffect(() => {
        setSnapshot(gameManager.getSnapshot());
        setupRound();
    }, [gameManager, setupRound]);

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

            const result = gameManager.doGuess(currentWord, guess);
            setSnapshot(result.snapshot);

            if (result.isCorrect) {
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
                setPendingCompletion(result.isComplete);
                setGlowSeed(Math.random());
                return;
            }

            setShakingOption(guess);
            window.setTimeout(() => setShakingOption(null), 700);
        },
        [currentWord, gameManager, isTransitioning, playWord],
    );

    const handleNextWord = useCallback(() => {
        if (pendingCompletion) {
            const updated = gameManager.finalizeVariant();
            setSnapshot(updated);
            setIsFinished(true);
            setCurrentWord(null);
            setOptions([]);
            const variantWordStats = updated.variantWordStats[variant] ?? {};
        } else {
            setupRound();
        }
        setGlowingOption(null);
        setShakingOption(null);
        setResolvedOption(null);
        setCardModeOverride(null);
        setPendingCompletion(false);
        setIsTransitioning(false);
        setGlowSeed(0);
    }, [gameManager, pendingCompletion, setupRound]);

    const handleRestart = useCallback(() => {
        const updated = gameManager.resetVariant();
        setSnapshot(updated);
        setupRound();
        setGlowingOption(null);
        setShakingOption(null);
        setIsTransitioning(false);
        setIsFinished(false);
        setResolvedOption(null);
        setCardModeOverride(null);
        setPendingCompletion(false);
        setGlowSeed(0);
    }, [gameManager, setupRound]);

    const optionMode = VARIANT_CONFIG[variant].optionMode;
    const fallbackVariantStats = {
        totalAttempts: 0,
        correctAttempts: 0,
        wrongAttempts: 0,
        learnedItemsCount: 0,
        totalItemsCount: words.length,
    };
    const activeVariantStats =
        snapshot.variantStats[variant] ??
        (fallbackVariantStats as WordStatisticsSnapshot['variantStats'][GameVariant]);
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
                        worstWords={gameManager.getWorstGuesses(5)}
                        onPronounceWord={(word) => playWord(word)}
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
                                    const optionWord = gameManager.findBySubject(option);
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
