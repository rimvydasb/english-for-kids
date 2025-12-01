'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Container, Stack } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import OptionButton from '../guess/OptionButton';
import FinishedSummary from '../guess/FinishedSummary';
import VariantStatsBar from '@/components/VariantStatsBar';
import GuessScoreHeader from '@/components/GuessScoreHeader';
import PhraseCard from '@/components/PhraseCard';
import { PHRASES_DICTIONARY, PhraseRecord } from '@/lib/phrases';
import { usePronunciation } from '@/lib/usePronunciation';
import { PhrasesStatisticsManager } from '@/lib/PhrasesStatisticsManager';
import { GameManager } from '@/lib/GameManager';
import { GeneralPhraseVariantStats } from '@/lib/statistics/AStatisticsManager';
import { InGameStatistics } from '@/lib/types';

const hasCompletedAllPhrases = (
    stats: Record<string, InGameStatistics>,
    phrases: PhraseRecord[],
) =>
    phrases.every((item) => {
        const record = stats[item.phrase];
        return record && record.learned && record.correctAttempts > 0;
    });

export default function PhraseGuessGamePage() {
    const router = useRouter();
    const phrases = useMemo(() => PHRASES_DICTIONARY, []);
    const gameManager = useMemo(() => new GameManager(phrases), [phrases]);
    const [inGameStats, setInGameStats] = useState<Record<string, InGameStatistics>>({});
    const [variantStats, setVariantStats] = useState<GeneralPhraseVariantStats>({
        totalAttempts: 0,
        correctAttempts: 0,
        wrongAttempts: 0,
        learnedItemsCount: 0,
        totalItemsCount: phrases.length,
    });
    const [currentPhrase, setCurrentPhrase] = useState<PhraseRecord | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [glowingOption, setGlowingOption] = useState<string | null>(null);
    const [shakingOption, setShakingOption] = useState<string | null>(null);
    const [resolvedOption, setResolvedOption] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [pendingCompletion, setPendingCompletion] = useState(false);
    const [showTranslation, setShowTranslation] = useState(false);
    const [glowSeed, setGlowSeed] = useState(0);
    const managerRef = useRef<PhrasesStatisticsManager | null>(null);
    const hasAnnouncedFinishRef = useRef(false);
    const { activeWord, error, pronounceWord: playPhrase } = usePronunciation();
    const congratulationsRecord = useMemo(() => ({ word: 'Great job' }), []);

    const setupRound = useCallback(
        (stats: Record<string, InGameStatistics> = {}) => {
            const candidates = phrases.filter((item: { phrase: string | number; }) => {
                const record = stats[item.phrase];
                return !record || !record.learned || record.correctAttempts === 0;
            });

            if (candidates.length === 0) {
                setIsFinished(true);
                setCurrentPhrase(null);
                setOptions([]);
                return;
            }

            const next = candidates[Math.floor(Math.random() * candidates.length)];
            setCurrentPhrase(next);
            setOptions(gameManager.buildOptions(next));
            setIsFinished(false);
            setGlowingOption(null);
            setShakingOption(null);
            setResolvedOption(null);
            setIsTransitioning(false);
            setPendingCompletion(false);
            setShowTranslation(false);
            setGlowSeed(0);
        },
        [gameManager, phrases],
    );

    useEffect(() => {
        const manager = new PhrasesStatisticsManager(phrases);
        managerRef.current = manager;
        const {
            inGameStats: loadedInGame,
            variantStats: loadedVariant,
        } = manager.loadAll();

        setInGameStats(loadedInGame);
        setVariantStats(loadedVariant);
        setupRound(loadedInGame);
    }, [phrases, setupRound]);

    useEffect(() => {
        if (!isFinished) {
            hasAnnouncedFinishRef.current = false;
            return;
        }
        if (hasAnnouncedFinishRef.current) {
            return;
        }

        playPhrase(congratulationsRecord, {
            allowExamples: false,
            suppressPendingError: true,
            suppressNotAllowedError: true,
        });
        hasAnnouncedFinishRef.current = true;
    }, [congratulationsRecord, isFinished, playPhrase]);

    const handleGuess = useCallback(
        (guess: string) => {
            if (!currentPhrase || isTransitioning) {
                return;
            }

            const isCorrect = guess === currentPhrase.phrase;
            const updated = managerRef.current?.recordAttempt(guess, isCorrect);
            if (updated) {
                setInGameStats(updated.inGameStats);
                setVariantStats(updated.variantStats);
            }

            if (isCorrect) {
                const complete = hasCompletedAllPhrases(updated?.inGameStats ?? inGameStats, phrases);
                playPhrase(currentPhrase, {
                    allowExamples: false,
                    suppressPendingError: true,
                    suppressNotAllowedError: true,
                });
                setGlowingOption(guess);
                setShakingOption(null);
                setResolvedOption(guess);
                setIsTransitioning(true);
                setPendingCompletion(complete);
                setShowTranslation(true);
                setGlowSeed(Math.random());
                return;
            }

            setShakingOption(guess);
            window.setTimeout(() => setShakingOption(null), 700);
        },
        [currentPhrase, inGameStats, isTransitioning, phrases, playPhrase],
    );

    const handleNext = useCallback(() => {
        if (pendingCompletion) {
            const updated = managerRef.current?.finalizeVariant();
            if (updated) {
                setInGameStats(updated.inGameStats);
                setVariantStats(updated.variantStats);
            }
            setIsFinished(true);
            setCurrentPhrase(null);
            setOptions([]);
        } else {
            const latest = managerRef.current?.getSnapshot().inGameStats ?? inGameStats;
            setupRound(latest);
        }

        setGlowingOption(null);
        setShakingOption(null);
        setResolvedOption(null);
        setIsTransitioning(false);
        setPendingCompletion(false);
        setShowTranslation(false);
        setGlowSeed(0);
    }, [inGameStats, pendingCompletion, setupRound]);

    const handleRestart = useCallback(() => {
        const updated = managerRef.current?.resetVariant();
        const snapshot = updated?.inGameStats ?? inGameStats;
        if (updated) {
            setInGameStats(updated.inGameStats);
            setVariantStats(updated.variantStats);
        }
        setupRound(snapshot);
        setGlowingOption(null);
        setShakingOption(null);
        setIsTransitioning(false);
        setIsFinished(false);
        setResolvedOption(null);
        setPendingCompletion(false);
        setShowTranslation(false);
        setGlowSeed(0);
    }, [inGameStats, setupRound]);

    const learnedCount = variantStats.learnedItemsCount;
    const score = Math.round((learnedCount / variantStats.totalItemsCount) * 100);
    const safeScore = Number.isNaN(score) ? 0 : score;

    return (
        <Container maxWidth="md">
            <Box sx={{ minHeight: '100vh', py: 4, position: 'relative' }}>
                <GuessScoreHeader
                    learnedCount={learnedCount}
                    totalCount={variantStats.totalItemsCount}
                    showScore={!isFinished}
                    icon={<TranslateIcon color="secondary" sx={{ fontSize: 32 }} />}
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
                        totalCount={variantStats.totalItemsCount}
                        onRestart={handleRestart}
                        variantStats={variantStats}
                    />
                ) : (
                    <Stack spacing={3}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: { xs: '100%', sm: 420 }, maxWidth: 540 }}>
                                {currentPhrase && (
                                    <PhraseCard
                                        phrase={currentPhrase}
                                        active={activeWord === currentPhrase.word}
                                        showTranslation={showTranslation}
                                        onPronounce={() =>
                                            playPhrase(currentPhrase, {
                                                suppressPendingError: true,
                                                suppressNotAllowedError: true,
                                            })
                                        }
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
                                    const optionPhrase = gameManager.findBySubject(option);
                                    const label = optionPhrase?.translation || option;
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
                                        onClick={handleNext}
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
                                <VariantStatsBar stats={variantStats} />
                            </Box>
                        </Stack>
                    </Stack>
                )}
            </Box>
        </Container>
    );
}
