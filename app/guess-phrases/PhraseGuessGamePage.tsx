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
import { PhasesGameManager } from '@/lib/game/PhasesGameManager';
import { GeneralPhraseVariantStats } from '@/lib/statistics/AStatisticsManager';

export default function PhraseGuessGamePage() {
    const router = useRouter();
    const phrases = useMemo(() => PHRASES_DICTIONARY, []);
    const gameManager = useMemo(() => new PhasesGameManager(phrases), [phrases]);
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
    const [worstPhrases, setWorstPhrases] = useState<PhraseRecord[]>([]);
    const hasAnnouncedFinishRef = useRef(false);
    const { activeWord, error, pronounceWord: playPhrase } = usePronunciation();
    const congratulationsRecord = useMemo(() => ({ word: 'Great job' }), []);

    const computeWorstPhrases = useCallback(
        (stats: Record<
            string,
            { totalAttempts: number; correctAttempts: number; wrongAttempts: number; learned: boolean }
        >) => {
            return Object.entries(stats)
                .filter(([, item]) => item.wrongAttempts > 0)
                .map(([key, value]) => {
                    const phrase = gameManager.findBySubject(key);
                    if (!phrase) return null;
                    const attempts = value.totalAttempts || value.correctAttempts + value.wrongAttempts;
                    const wrongRate = attempts === 0 ? 0 : value.wrongAttempts / attempts;
                    return { phrase, wrongRate, attempts, wrong: value.wrongAttempts };
                })
                .filter(
                    (
                        item,
                    ): item is {
                        phrase: PhraseRecord;
                        wrongRate: number;
                        attempts: number;
                        wrong: number;
                    } => Boolean(item),
                )
                .sort((a, b) => {
                    if (b.wrongRate !== a.wrongRate) return b.wrongRate - a.wrongRate;
                    if (b.wrong !== a.wrong) return b.wrong - a.wrong;
                    if (b.attempts !== a.attempts) return b.attempts - a.attempts;
                    return a.phrase.getSubject().localeCompare(b.phrase.getSubject());
                })
                .slice(0, 5)
                .map((item) => item.phrase);
        },
        [gameManager],
    );

    const setupRound = useCallback(
        () => {
            const next = gameManager.drawNextCandidate();
            if (!next) {
                setIsFinished(true);
                setCurrentPhrase(null);
                setOptions([]);
                return;
            }

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
        [gameManager],
    );

    useEffect(() => {
        const loaded = gameManager.getSnapshot();
        setVariantStats(loaded.variantStats);
        setupRound();
    }, [gameManager, setupRound]);

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

            const result = gameManager.doGuess(currentPhrase, guess);
            setVariantStats(result.snapshot.variantStats);

            if (result.isCorrect) {
                playPhrase(currentPhrase, {
                    allowExamples: false,
                    suppressPendingError: true,
                    suppressNotAllowedError: true,
                });
                setGlowingOption(guess);
                setShakingOption(null);
                setResolvedOption(guess);
                setIsTransitioning(true);
                setPendingCompletion(result.isComplete);
                setShowTranslation(true);
                setGlowSeed(Math.random());
                return;
            }

            setShakingOption(guess);
            window.setTimeout(() => setShakingOption(null), 700);
        },
        [currentPhrase, gameManager, isTransitioning, playPhrase],
    );

    const handleNext = useCallback(() => {
        if (pendingCompletion) {
            const updated = gameManager.finalizeVariant();
            setVariantStats(updated.variantStats);
            setIsFinished(true);
            setCurrentPhrase(null);
            setOptions([]);
            setWorstPhrases(computeWorstPhrases(updated.inGameStats));
        } else {
            setupRound();
        }

        setGlowingOption(null);
        setShakingOption(null);
        setResolvedOption(null);
        setIsTransitioning(false);
        setPendingCompletion(false);
        setShowTranslation(false);
        setGlowSeed(0);
    }, [computeWorstPhrases, gameManager, pendingCompletion, setupRound]);

    const handleRestart = useCallback(() => {
        const updated = gameManager.resetVariant();
        setVariantStats(updated.variantStats);
        setupRound();
        setGlowingOption(null);
        setShakingOption(null);
        setIsTransitioning(false);
        setIsFinished(false);
        setResolvedOption(null);
        setPendingCompletion(false);
        setShowTranslation(false);
        setGlowSeed(0);
        setWorstPhrases([]);
    }, [computeWorstPhrases, gameManager, setupRound]);

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
                        worstPhrases={worstPhrases}
                        onPronouncePhrase={(phrase) =>
                            playPhrase(phrase, {
                                suppressPendingError: true,
                                suppressNotAllowedError: true,
                            })
                        }
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
