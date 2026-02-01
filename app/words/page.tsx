'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Alert, Box, Button, Container, IconButton, Typography} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {WORDS_DICTIONARY} from '@/lib/config';
import {WordRecord} from '@/lib/types';
import WordCard from '@/components/WordCard';
import {WordCardMode} from '@/lib/types';
import {usePronunciation} from '@/lib/usePronunciation';
import {GlobalStatsMap} from '@/lib/statistics/AStatisticsManager';
import {WordStatisticsManager} from '@/lib/statistics/WordStatisticsManager';
import {PhrasesStatisticsManager} from '@/lib/statistics/PhrasesStatisticsManager';
import {PHRASES_DICTIONARY} from '@/lib/config';
import {GameManager} from '@/lib/game/GameManager';

export default function WordsPage() {
    const {activeWord, error, pronounceWord} = usePronunciation();
    const router = useRouter();
    const [globalStats, setGlobalStats] = useState<GlobalStatsMap>({});
    const [sortedWords, setSortedWords] = useState<WordRecord[]>(WORDS_DICTIONARY);

    useEffect(() => {
        const manager = new WordStatisticsManager(WORDS_DICTIONARY, 'GUESS_THE_WORD_GAME_STATS', 'GLOBAL_WORD_STATS');
        const stats = manager.loadGlobalStatistics();
        setGlobalStats(stats);
        setSortedWords(GameManager.sortByDifficulty(WORDS_DICTIONARY, stats));
    }, []);

    const handleRestartAllGames = () => {
        if (!window.confirm('Are you sure you want to restart all games? This will clear all current game progress.')) {
            return;
        }

        const guessTheWordManager = new WordStatisticsManager(
            WORDS_DICTIONARY,
            'GUESS_THE_WORD_GAME_STATS',
            'GLOBAL_WORD_STATS'
        );
        guessTheWordManager.resetInGameStatistics();

        const listenAndGuessManager = new WordStatisticsManager(
            WORDS_DICTIONARY,
            'LISTEN_AND_GUESS_GAME_STATS',
            'GLOBAL_WORD_STATS'
        );
        listenAndGuessManager.resetInGameStatistics();

        const phrasesManager = new PhrasesStatisticsManager(
            PHRASES_DICTIONARY,
            'GUESS_THE_PHRASE_GAME_STATS',
            'GLOBAL_PHRASE_STATS'
        );
        phrasesManager.resetInGameStatistics();

        router.push('/');
    };

    return (
        <Container maxWidth="md">
            <Box sx={{minHeight: '100vh', py: 4}}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h4" component="h1" sx={{fontWeight: 700}}>
                            All Words
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Tap a card to flip for translation; tap the speaker to hear pronunciation.
                        </Typography>
                    </Box>
                    <IconButton aria-label="Return to main menu" onClick={() => router.push('/')}>
                        <HighlightOffIcon fontSize="large" />
                    </IconButton>
                </Box>

                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {error}
                    </Alert>
                )}

                <Box
                    sx={{
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                        },
                        gap: 3,
                        mb: 4,
                    }}
                >
                    {sortedWords.map((item) => (
                        <WordCard
                            key={item.word}
                            word={item}
                            mode={WordCardMode.Learning}
                            active={activeWord === item.word}
                            onPronounce={() => pronounceWord(item)}
                            globalStats={globalStats[item.word]}
                        />
                    ))}
                </Box>

                <Box sx={{display: 'flex', justifyContent: 'center', pb: 4}}>
                    <Button variant="contained" color="error" size="large" onClick={handleRestartAllGames}>
                        Restart All Games
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}
