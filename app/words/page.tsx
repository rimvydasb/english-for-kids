'use client';

import {useEffect, useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Alert, Box, Container, IconButton, Typography} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {WORDS_DICTIONARY} from '@/lib/words';
import WordCard from '@/components/WordCard';
import {WordCardMode} from '@/lib/types';
import {usePronunciation} from '@/lib/usePronunciation';
import {GlobalStatsMap} from '@/lib/statistics/AStatisticsManager';
import {WordStatisticsManager} from '@/lib/statistics/WordStatisticsManager';

export default function WordsPage() {
    const {activeWord, error, pronounceWord} = usePronunciation();
    const router = useRouter();
    const words = useMemo(() => WORDS_DICTIONARY, []);
    const [globalStats, setGlobalStats] = useState<GlobalStatsMap>({});

    useEffect(() => {
        const manager = new WordStatisticsManager(
            words,
            'GUESS_THE_WORD_GAME_STATS',
            'GLOBAL_WORD_STATS',
        );
        setGlobalStats(manager.loadGlobalStatistics());
    }, [words]);

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
                    }}
                >
                    {words.map((item) => (
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
            </Box>
        </Container>
    );
}
