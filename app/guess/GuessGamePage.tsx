'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Alert, Box, Button, Container, Stack} from '@mui/material';
import WordCard from '@/components/WordCard';
import OptionButton from './OptionButton';
import FinishedSummary from './FinishedSummary';
import GuessScoreHeader from '@/components/GuessScoreHeader';
import VariantStatsBar from '@/components/VariantStatsBar';
import GameConfigModal from './GameConfigModal';
import {GuessTheWordGameManager, ListenAndGuessGameManager} from '@/lib/game/WordGameManager';
import {ensureStatsForSubjects} from '@/lib/game/ensureStats';
import {usePronunciation} from '@/lib/usePronunciation';
import {OptionRecord, WordRecord} from '@/lib/types';
import {InGameAggregatedStatistics, InGameStatsMap} from '@/lib/statistics/AStatisticsManager';
import {DEFAULT_RULES, GlobalConfig} from '@/lib/config';
import {GameRules, WordCardMode, WordEntryType} from '@/lib/types';

type WordGameManager = GuessTheWordGameManager | ListenAndGuessGameManager;

interface GuessGamePageProps {
    gameManager: WordGameManager;
}

export default function GuessGamePage({gameManager}: GuessGamePageProps) {
    const router = useRouter();
    const [isConfiguring, setIsConfiguring] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    // Re-fetch rules when configuration changes
    const rules = useMemo(() => {
        // Ensure we depend on isConfiguring so rules are re-fetched when it changes
        return isConfiguring ? gameManager.getGameRules() : gameManager.getGameRules();
    }, [gameManager, isConfiguring]);

    const {activeWord, error, pronounceWord: playWord, voicesReady} = usePronunciation();
    const {pronounceWord: playOptionWord} = usePronunciation();

    const [activeSubjects, setActiveSubjects] = useState<WordRecord[]>([]);
    const [inGameStats, setInGameStats] = useState<InGameStatsMap>({});
    const [currentWord, setCurrentWord] = useState<WordRecord | null>(null);
    const [options, setOptions] = useState<OptionRecord[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [glowingOption, setGlowingOption] = useState<string | null>(null);
    const [shakingOption, setShakingOption] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [resolvedOption, setResolvedOption] = useState<string | null>(null);
    const [pendingCompletion, setPendingCompletion] = useState(false);
    const [glowSeed, setGlowSeed] = useState(0);
    const [currentRules, setCurrentRules] = useState<GameRules>(rules);

    const hasAnnouncedFinishRef = useRef(false);
    const playedOnOpenRef = useRef(false);
    const congratulationsRecord = useMemo(() => new WordRecord({type: 'verb', word: 'Great job'}), []);

    const activeAggregatedStats: InGameAggregatedStatistics = useMemo(() => {
        return gameManager.aggregate(ensureStatsForSubjects(activeSubjects, inGameStats));
    }, [activeSubjects, gameManager, inGameStats]);

    const setupRound = useCallback(
        (subjects: WordRecord[], stats: InGameStatsMap, rulesOverride?: GameRules) => {
            const next = gameManager.drawNextCandidate(subjects, stats);
            if (!next) {
                setIsFinished(true);
                setCurrentWord(null);
                setOptions([]);
                return;
            }

            const effectiveRules = rulesOverride || rules;

            setIsFinished(false);
            setCurrentWord(next);
            setOptions(gameManager.buildOptions(next, subjects));
            setGlowingOption(null);
            setShakingOption(null);
            setResolvedOption(null);
            setIsTransitioning(false);
            setPendingCompletion(false);
            setGlowSeed(0);
            setCurrentRules(effectiveRules);
            playedOnOpenRef.current = false;
        },
        [gameManager, rules],
    );

    const handleConfigStart = useCallback(
        (count: number, types: WordEntryType[], useSelectedWords: boolean = false) => {
            // Start logic
            const subjects = gameManager.startTheGame({
                totalInGameSubjectsToLearn: count,
                selectedWordEntryTypes: types,
                useSelectedWords: useSelectedWords,
            });
            const stats = gameManager.loadInGameStatistics();
            const freshRules = gameManager.getGameRules();

            setActiveSubjects(subjects);
            setInGameStats(stats);
            setIsConfiguring(false);
            setupRound(subjects, stats, freshRules);
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
        if (currentWord && currentRules.wordCardMode === WordCardMode.ListenAndGuess && !playedOnOpenRef.current) {
            playWord(currentWord, {
                allowExamples: false,
                suppressPendingError: true,
                suppressNotAllowedError: true,
            });
            playedOnOpenRef.current = true;
        }
    }, [currentRules.wordCardMode, currentWord, playWord, voicesReady]);

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

            const result = gameManager.recordAttempt(inGameStats, currentWord, guess, activeSubjects);
            setInGameStats(result.inGameStats);

            if (result.isCorrect) {
                playWord(currentWord, {
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
        [activeSubjects, currentWord, gameManager, inGameStats, isTransitioning, playWord, rules],
    );

    const handleNextWord = useCallback(() => {
        if (pendingCompletion) {
            gameManager.finishGame(inGameStats);
            setIsFinished(true);
            setCurrentWord(null);
            setOptions([]);
        } else {
            setupRound(activeSubjects, inGameStats);
        }

        setGlowingOption(null);
        setShakingOption(null);
        setResolvedOption(null);
        setPendingCompletion(false);
        setIsTransitioning(false);
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
            <GameConfigModal open={isConfiguring} onStart={handleConfigStart} onClose={() => router.push('/')} />

            {!isConfiguring && (
                <Box sx={{minHeight: '100vh', py: 4, position: 'relative'}}>
                    <GuessScoreHeader
                        learnedCount={learnedCount}
                        totalCount={totalCount}
                        showScore={!isFinished}
                        variant={rules.variant}
                        label={rules.name}
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
                            worstWords={gameManager.getWorstGuesses(
                                GlobalConfig.WORST_GUESSES_COUNT,
                                inGameStats,
                                activeSubjects,
                            )}
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
                                <Box sx={{width: {xs: '100%', sm: 360}, maxWidth: 420}}>
                                    {currentWord && (
                                        <WordCard
                                            word={currentWord}
                                            mode={currentRules.wordCardMode}
                                            active={activeWord === currentWord.word}
                                            onPronounce={() => playWord(currentWord)}
                                            showImage={currentRules.showImage}
                                            showTranslation={currentRules.showTranslation}
                                            showWord={currentRules.showWord}
                                            showWordPronunciation={currentRules.showWordPronunciation}
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
                                                                                                        const value = option.getSubject();
                                                                                                        const optionWord = option.copy as WordRecord;
                                                                                                        const label =
                                                                                                            currentRules.options === 'translation'
                                                                                                                ? optionWord.translation || value
                                                                                                                : optionWord.word || value;
                                                                                                        const isGlowing = glowingOption === value;
                                                                                                        const isShaking = shakingOption === value;
                                                                                                        const shouldHide = Boolean(resolvedOption && value !== resolvedOption);
                                                                                                        const shouldFade = Boolean(resolvedOption && value !== resolvedOption);
                                                                    
                                                                                                        return (
                                                                                                            <OptionButton
                                                                                                                key={option.key}
                                                                                                                option={option}
                                                                                                                label={label}
                                                                                                                isGlowing={isGlowing}
                                                                                                                isShaking={isShaking}
                                                                                                                shouldFade={shouldFade}
                                                                                                                isHidden={shouldHide}
                                                                                                                isLocked={isTransitioning}
                                                                                                                glowSeed={glowSeed}
                                                                                                                onGuess={handleGuess}
                                                                                                                showPronunciation={currentRules.optionPronunciation}
                                                                                                                onPronounce={(opt) => {
                                                                                                                    playOptionWord(opt.copy as WordRecord, {
                                                                                                                        suppressPendingError: true,
                                                                                                                        suppressNotAllowedError: true,
                                                                                                                    });
                                                                                                                }}
                                                                                                            />
                                                                                                        );
                                                                                                    })}                                </Box>

                                {resolvedOption && (
                                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
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
