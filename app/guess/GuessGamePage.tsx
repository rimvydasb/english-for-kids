'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Alert, Box, Button, Container, Stack} from '@mui/material';
import WordCard from '@/components/WordCard';
import OptionButton from './OptionButton';
import FinishedSummary from './FinishedSummary';
import GuessScoreHeader from '@/components/GuessScoreHeader';
import VariantStatsBar from '@/components/VariantStatsBar';
import {GuessTheWordGameManager, ListenAndGuessGameManager} from '@/lib/game/WordGameManager';
import {ensureStatsForSubjects} from '@/lib/game/ensureStats';
import {usePronunciation} from '@/lib/usePronunciation';
import {WordRecord} from '@/lib/words';
import {InGameAggregatedStatistics, InGameStatsMap} from '@/lib/statistics/AStatisticsManager';
import {InGameStatistics, WordCardMode} from '@/lib/types';
import {GlobalConfig} from '@/lib/Config';

type WordGameManager = GuessTheWordGameManager | ListenAndGuessGameManager;

interface GuessGamePageProps {
    gameManager: WordGameManager;
}

export default function GuessGamePage({gameManager}: GuessGamePageProps) {
    const router = useRouter();
    const rules = gameManager.getGameRules();
    const {activeWord, error, pronounceWord: playWord, voicesReady} = usePronunciation();

    const initialInGameStats = useMemo(() => gameManager.loadInGameStatistics(), [gameManager]);
    const initialSubjects = useMemo(() => gameManager.startTheGame(), [gameManager]);
    const [activeSubjects, setActiveSubjects] = useState<WordRecord[]>(initialSubjects);
    const [inGameStats, setInGameStats] = useState<InGameStatsMap>(initialInGameStats);
    const [currentWord, setCurrentWord] = useState<WordRecord | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [glowingOption, setGlowingOption] = useState<string | null>(null);
    const [shakingOption, setShakingOption] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [resolvedOption, setResolvedOption] = useState<string | null>(null);
    const [pendingCompletion, setPendingCompletion] = useState(false);
    const [cardModeOverride, setCardModeOverride] = useState<WordCardMode | null>(null);
    const [glowSeed, setGlowSeed] = useState(0);
    const hasAnnouncedFinishRef = useRef(false);
    const playedOnOpenRef = useRef(false);
    const congratulationsRecord = useMemo(() => new WordRecord({type: 'verb', word: 'Great job'}), []);

    const activeAggregatedStats: InGameAggregatedStatistics = useMemo(() => {
        return gameManager.aggregate(ensureStatsForSubjects(activeSubjects, inGameStats));
    }, [activeSubjects, gameManager, inGameStats]);

    const setupRound = useCallback(
        (subjects: WordRecord[], stats: InGameStatsMap) => {
            const next = gameManager.drawNextCandidate(subjects, stats);
            if (!next) {
                setIsFinished(true);
                setCurrentWord(null);
                setOptions([]);
                return;
            }

            setIsFinished(false);
            setCurrentWord(next);
            setOptions(gameManager.buildOptions(next, subjects));
            setGlowingOption(null);
            setShakingOption(null);
            setResolvedOption(null);
            setIsTransitioning(false);
            setPendingCompletion(false);
            setCardModeOverride(null);
            setGlowSeed(0);
            playedOnOpenRef.current = false;
        },
        [gameManager],
    );

    useEffect(() => {
        setupRound(initialSubjects, initialInGameStats);
    }, [initialInGameStats, initialSubjects, setupRound]);

    useEffect(() => {
        if (currentWord && rules.wordCardMode === WordCardMode.ListenAndGuess && !playedOnOpenRef.current) {
            playWord(currentWord, {
                allowExamples: false,
                suppressPendingError: true,
                suppressNotAllowedError: true,
            });
            playedOnOpenRef.current = true;
        }
    }, [rules.wordCardMode, currentWord, playWord, voicesReady]);

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
                setCardModeOverride(WordCardMode.Learning);
                setIsTransitioning(true);
                setPendingCompletion(result.isComplete);
                setGlowSeed(Math.random());
                return;
            }

            setShakingOption(guess);
            window.setTimeout(() => setShakingOption(null), 700);
        },
        [activeSubjects, currentWord, gameManager, inGameStats, isTransitioning, playWord],
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
        setCardModeOverride(null);
        setPendingCompletion(false);
        setIsTransitioning(false);
        setGlowSeed(0);
    }, [activeSubjects, gameManager, inGameStats, pendingCompletion, setupRound]);

    const handleRestart = useCallback(() => {
        const {inGameStats: resetStats} = gameManager.resetInGameStatistics();
        const refreshedSubjects = gameManager.startTheGame();
        setActiveSubjects(refreshedSubjects);
        setInGameStats(resetStats);
        setIsFinished(false);
        setResolvedOption(null);
        setCardModeOverride(null);
        setPendingCompletion(false);
        setIsTransitioning(false);
        setGlowSeed(0);
        setupRound(refreshedSubjects, resetStats);
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
                                        mode={(cardModeOverride ?? rules.wordCardMode) as WordCardMode}
                                        active={activeWord === currentWord.word}
                                        onPronounce={() => playWord(currentWord)}
                                        showImage={cardModeOverride === WordCardMode.Learning ? true : rules.showImage}
                                        showTranslation={
                                            cardModeOverride === WordCardMode.Learning ? true : rules.showTranslation
                                        }
                                        showWord={cardModeOverride === WordCardMode.Learning ? true : rules.showWord}
                                        showWordPronunciation={
                                            cardModeOverride === WordCardMode.Learning
                                                ? true
                                                : rules.showWordPronunciation
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
                                    const optionWord = gameManager.findBySubject(option);
                                    const label =
                                        rules.options === 'translation'
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
                                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                                    <Button variant="contained" color="secondary" size="large" onClick={handleNextWord}>
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
