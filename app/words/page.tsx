'use client';

import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Alert, Box, Container, IconButton, Typography} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {WordRecord, WRODS_DICTIONARY} from '@/lib/words';
import WordCard from './WordCard';

export default function WordsPage() {
    const [activeWord, setActiveWord] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const router = useRouter();
    const words = WRODS_DICTIONARY;

    useEffect(() => {
        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'x') {
                router.push('/');
            }
        };

        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, [router]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
            return () => synthRef.current?.cancel();
        }

        setError('Speech synthesis is not available in this browser.');
    }, []);

    const pronounceWord = (wordData: WordRecord) => {
        if (!synthRef.current) {
            setError('Speech synthesis is not available in this browser.');
            return;
        }

        setActiveWord(wordData.word);
        setError(null);
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(wordData.word);
        utterance.onend = () => setActiveWord(null);
        utterance.onerror = () => {
            setError('Failed to play pronunciation. Please try again.');
            setActiveWord(null);
        };

        synthRef.current.speak(utterance);
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
                    </Box>
                    <IconButton aria-label="Return to main menu" onClick={() => router.push('/')}>
                        <CloseIcon />
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
                            active={activeWord === item.word}
                            onPronounce={() => pronounceWord(item)}
                        />
                    ))}
                </Box>
            </Box>
        </Container>
    );
}
