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
import {
    GlobalPhraseStatistics,
    InGamePhraseStatistics,
    PhrasesStatisticsManager,
} from '@/lib/PhrasesStatisticsManager';
import { GeneralPhraseVariantStats } from '@/lib/statistics/AStatisticsManager';

const shuffle = (values: PhraseRecord[]) => {
    const arr = [...values];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const buildOptions = (allPhrases: PhraseRecord[], answer: PhraseRecord) => {
    const decoys = shuffle(
        allPhrases.filter((item) => item.phrase !== answer.phrase),
    ).slice(0, 4);
    return shuffle([answer, ...decoys]).map((item) => item.phrase);
};

const findPhrase = (phrases: PhraseRecord[], phrase: string) =>
    phrases.find((item) => item.phrase === phrase);

const hasCompletedAllPhrases = (
    stats: Record<string, InGamePhraseStatistics>,
    phrases: PhraseRecord[],
) =>
    phrases.every((item) => {
        const record = stats[item.phrase];
        return record && record.learned && record.correctAttempts > 0;
    });

export default function PhraseGuessGamePage() {
    const router = useRouter();
    const phrases = useMemo(() => PHRASES_DICTIONARY, []);
    const [globalStats, setGlobalStats] = useState<Record<string, GlobalPhraseStatistics>>({});
    const [inGameStats, setInGameStats] = useState<Record<string, InGamePhraseStatistics>>({});
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
    const hasGlobalAttempts = useMemo(
        () =>
            Object.values(globalStats).some(
                (stat) => stat.correctAttempts > 0 || stat.wrongAttempts > 0,
            ),
        [globalStats],
    );

    const setupRound = useCallback(
        (stats: Record<string, InGamePhraseStatistics> = {}) => {
            const candidates = phrases.filter((item) => {
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
            setOptions(buildOptions(phrases, next));
            setIsFinished(false);
            setGlowingOption(null);
            setShakingOption(null);
            setResolvedOption(null);
            setIsTransitioning(false);
            setPendingCompletion(false);
            setShowTranslation(false);
            setGlowSeed(0);
        },
        [phrases],
    );

    useEffect(() => {
        const manager = new PhrasesStatisticsManager(phrases);
        managerRef.current = manager;
        const {
            globalStats: loadedGlobal,
            inGameStats: loadedInGame,
            variantStats: loadedVariant,
        } = manager.loadAll();

        setGlobalStats(loadedGlobal);
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
                setGlobalStats(updated.globalStats);
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
                setGlobalStats(updated.globalStats);
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
            setGlobalStats(updated.globalStats);
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

    const handleResetGlobalStats = useCallback(() => {
        const updated = managerRef.current?.resetGlobal();
        if (updated) {
            setGlobalStats(updated.globalStats);
            setInGameStats(updated.inGameStats);
            setVariantStats(updated.variantStats);
        }
    }, []);

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
                                    const optionPhrase = findPhrase(phrases, option);
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
