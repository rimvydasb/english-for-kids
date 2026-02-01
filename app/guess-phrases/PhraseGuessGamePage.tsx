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
import GameConfigModal from '../guess/GameConfigModal';
import {usePronunciation} from '@/lib/usePronunciation';
import {PhasesGameManager} from '@/lib/game/PhasesGameManager';
import {ensureStatsForSubjects} from '@/lib/game/ensureStats';
import {GlobalConfig, DEFAULT_RULES} from '@/lib/config';
import {GameRules, PhraseRecord, WordEntryType} from '@/lib/types';
import {InGameAggregatedStatistics, InGameStatsMap} from "@/lib/statistics/AStatisticsManager";

interface PhraseGuessGamePageProps {
    gameManager: PhasesGameManager;
}

export default function PhraseGuessGamePage({gameManager}: PhraseGuessGamePageProps) {
    const router = useRouter();
    const [isConfiguring, setIsConfiguring] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const rules = useMemo(() => {
        // Ensure we depend on isConfiguring so rules are re-fetched when it changes
        return isConfiguring ? gameManager.getGameRules() : gameManager.getGameRules();
    }, [gameManager, isConfiguring]);
    
    const [activeSubjects, setActiveSubjects] = useState<PhraseRecord[]>([]);
    const [inGameStats, setInGameStats] = useState<InGameStatsMap>({});
    
    const [currentPhrase, setCurrentPhrase] = useState<PhraseRecord | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [glowingOption, setGlowingOption] = useState<string | null>(null);
    const [shakingOption, setShakingOption] = useState<string | null>(null);
    const [resolvedOption, setResolvedOption] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [pendingCompletion, setPendingCompletion] = useState(false);
    const [glowSeed, setGlowSeed] = useState(0);
    const [currentRules, setCurrentRules] = useState<GameRules>(rules);

    const hasAnnouncedFinishRef = useRef(false);
    const {activeWord, error, pronounceWord: playPhrase} = usePronunciation();
    const {pronounceWord: playOptionPhrase} = usePronunciation();
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
            setGlowSeed(0);
            setCurrentRules(rules);
        },
        [gameManager, rules],
    );

    const handleConfigStart = useCallback(
        (count: number, types: WordEntryType[]) => {
            gameManager.setConfig({
                totalInGameSubjectsToLearn: count,
                selectedWordEntryTypes: types, // Passed but likely ignored by PhraseManager
            });

            const subjects = gameManager.startTheGame();
            const stats = gameManager.loadInGameStatistics();

            setActiveSubjects(subjects);
            setInGameStats(stats);
            setIsConfiguring(false);
            setupRound(subjects, stats);
        },
        [gameManager, setupRound],
    );

    useEffect(() => {
        if (!isInitialized) {
            const hasActive = gameManager.hasActiveGame();
            if (hasActive) {
                setIsConfiguring(false);
                const subjects = gameManager.startTheGame();
                const stats = gameManager.loadInGameStatistics();
                setActiveSubjects(subjects);
                setInGameStats(stats);
                setupRound(subjects, stats);
            }
            setIsInitialized(true);
        }
    }, [gameManager, isInitialized, setupRound]);

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
                setCurrentRules({...rules, ...DEFAULT_RULES});
                setIsTransitioning(true);
                setPendingCompletion(result.isComplete);
                setGlowSeed(Math.random());
                return;
            }

            setShakingOption(guess);
            window.setTimeout(() => setShakingOption(null), 700);
        },
        [activeSubjects, currentPhrase, gameManager, inGameStats, isTransitioning, playPhrase, rules],
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
        setGlowSeed(0);
    }, [activeSubjects, gameManager, inGameStats, pendingCompletion, setupRound]);

    const handleRestart = useCallback(() => {
        gameManager.resetInGameStatistics();
        setIsFinished(false);
        setResolvedOption(null);
        setPendingCompletion(false);
        setIsTransitioning(false);
        setGlowSeed(0);
        setIsConfiguring(true);
    }, [gameManager]);

    if (!isInitialized) {
        return null;
    }

    const learnedCount = activeAggregatedStats.learnedItemsCount;
    const totalCount = activeSubjects.length;
    const score = Math.round((learnedCount / (totalCount || 1)) * 100);
    const safeScore = Number.isNaN(score) ? 0 : score;

    return (
        <Container maxWidth="md">
            <GameConfigModal open={isConfiguring} onStart={handleConfigStart} onClose={() => router.push('/')} showTypes={false} />

            {!isConfiguring && (
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
                                        showTranslation={currentRules.showTranslation}
                                        showPhrase={currentRules.showWord}
                                        showPhrasePronunciation={currentRules.showWordPronunciation}
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
                                    const isCorrect = currentPhrase?.word === option;
                                    const label = optionPhrase?.translation || option;
                                    const isGlowing = glowingOption === option;
                                    const isShaking = shakingOption === option;
                                    const shouldHide = Boolean(resolvedOption && option !== resolvedOption);
                                    const shouldFade = Boolean(resolvedOption && option !== resolvedOption);

                                    return (
                                        <OptionButton
                                            key={option}
                                            subject={optionPhrase!}
                                            value={option}
                                            label={label}
                                            isGlowing={isGlowing}
                                            isShaking={isShaking}
                                            shouldFade={shouldFade}
                                            isHidden={shouldHide}
                                            isLocked={isTransitioning}
                                            glowSeed={glowSeed}
                                            onGuess={handleGuess}
                                            showPronunciation={currentRules.optionPronunciation}
                                            isCorrect={isCorrect}
                                            onPronounce={(subject) => {
                                                playOptionPhrase(subject, {
                                                    suppressPendingError: true,
                                                    suppressNotAllowedError: true,
                                                });
                                            }}
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
            )}
        </Container>
    );
}
