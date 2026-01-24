'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Alert, Box, Button, Container, Stack} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import OptionButton from '../guess/OptionButton';
import FinishedSummary from '../guess/FinishedSummary';
import VariantStatsBar from '@/components/VariantStatsBar';
import GuessScoreHeader from '@/components/GuessScoreHeader';
import PhraseCard from '@/components/PhraseCard';
import {usePronunciation} from '@/lib/usePronunciation';
import {PhasesGameManager} from '@/lib/game/PhasesGameManager';
import {ensureStatsForSubjects} from '@/lib/game/ensureStats';
import {PhraseRecord} from '@/lib/types';
import {InGameAggregatedStatistics, InGameStatsMap} from '@/lib/statistics/AStatisticsManager';
import {InGameStatistics} from '@/lib/types';
import {GlobalConfig} from '@/lib/Config';

interface PhraseGuessGamePageProps {
    gameManager: PhasesGameManager;
}

export default function PhraseGuessGamePage({gameManager}: PhraseGuessGamePageProps) {
    const router = useRouter();
    const rules = gameManager.getGameRules();
    const initialSubjects = useMemo(() => gameManager.startTheGame(), [gameManager]);
    const initialStats = useMemo(() => gameManager.loadInGameStatistics(), [gameManager]);
    const [activeSubjects, setActiveSubjects] = useState<PhraseRecord[]>(initialSubjects);
    const [inGameStats, setInGameStats] = useState<InGameStatsMap>(initialStats);
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
    const hasAnnouncedFinishRef = useRef(false);
    const {activeWord, error, pronounceWord: playPhrase} = usePronunciation();
    const congratulationsRecord = useMemo(() => ({word: 'Great job'}), []);

    const activeAggregatedStats: InGameAggregatedStatistics = useMemo(() => {
        return gameManager.aggregate(ensureStatsForSubjects(activeSubjects, inGameStats));
    }, [activeSubjects, gameManager, inGameStats]);

    const setupRound = useCallback(
        (subjects: PhraseRecord[], stats: InGameStatsMap) => {
            const next = gameManager.drawNextCandidate(subjects, stats);
            if (!next) {
                setIsFinished(true);
                setCurrentPhrase(null);
                setOptions([]);
                return;
            }

            setCurrentPhrase(next);
            setOptions(gameManager.buildOptions(next, subjects));
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
        setupRound(initialSubjects, initialStats);
    }, [initialStats, initialSubjects, setupRound]);

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

            const result = gameManager.recordAttempt(inGameStats, currentPhrase, guess, activeSubjects);
            setInGameStats(result.inGameStats);

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
        [activeSubjects, currentPhrase, gameManager, inGameStats, isTransitioning, playPhrase],
    );

    const handleNext = useCallback(() => {
        if (pendingCompletion) {
            gameManager.finishGame(inGameStats);
            setIsFinished(true);
            setCurrentPhrase(null);
            setOptions([]);
        } else {
            setupRound(activeSubjects, inGameStats);
        }

        setGlowingOption(null);
        setShakingOption(null);
        setResolvedOption(null);
        setIsTransitioning(false);
        setPendingCompletion(false);
        setShowTranslation(false);
        setGlowSeed(0);
    }, [activeSubjects, gameManager, inGameStats, pendingCompletion, setupRound]);

    const handleRestart = useCallback(() => {
        const {inGameStats: resetStats} = gameManager.resetInGameStatistics();
        const refreshedSubjects = gameManager.startTheGame();
        setActiveSubjects(refreshedSubjects);
        setInGameStats(resetStats);
        setupRound(refreshedSubjects, resetStats);
        setGlowingOption(null);
        setShakingOption(null);
        setIsTransitioning(false);
        setIsFinished(false);
        setResolvedOption(null);
        setPendingCompletion(false);
        setShowTranslation(false);
        setGlowSeed(0);
    }, [gameManager, setupRound]);

    const learnedCount = activeAggregatedStats.learnedItemsCount;
    const totalCount = activeSubjects.length;
    const score = Math.round((learnedCount / (totalCount || 1)) * 100);
    const safeScore = Number.isNaN(score) ? 0 : score;

    return (
        <Container maxWidth="md">
            <Box sx={{minHeight: '100vh', py: 4, position: 'relative'}}>
                <GuessScoreHeader
                    learnedCount={learnedCount}
                    totalCount={totalCount}
                    showScore={!isFinished}
                    variant={rules.variant}
                    label={rules.name}
                    icon={<TranslateIcon color="secondary" sx={{fontSize: 32}} />}
                    onExit={() => router.push('/')}
                />

                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {error}
                    </Alert>
                )}

                {isFinished ? (
                    <FinishedSummary
                        score={safeScore}
                        learnedCount={learnedCount}
                        totalCount={totalCount}
                        onRestart={handleRestart}
                        variantStats={activeAggregatedStats}
                        worstPhrases={gameManager.getWorstGuesses(
                            GlobalConfig.WORST_GUESSES_COUNT,
                            inGameStats,
                            activeSubjects,
                        )}
                        onPronouncePhrase={(phrase) =>
                            playPhrase(phrase, {
                                suppressPendingError: true,
                                suppressNotAllowedError: true,
                            })
                        }
                    />
                ) : (
                    <Stack spacing={3}>
                        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
                            <Box sx={{width: {xs: '100%', sm: 420}, maxWidth: 540}}>
                                {currentPhrase && (
                                    <PhraseCard
                                        phrase={currentPhrase}
                                        active={activeWord === currentPhrase.word}
                                        showTranslation={rules.showTranslation || showTranslation}
                                        showPhrase={rules.showWord || showTranslation}
                                        showPhrasePronunciation={rules.showWordPronunciation || showTranslation}
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
                                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                                    <Button variant="contained" color="secondary" size="large" onClick={handleNext}>
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
                                <VariantStatsBar stats={activeAggregatedStats} />
                            </Box>
                        </Stack>
                    </Stack>
                )}
            </Box>
        </Container>
    );
}
