'use client';

import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Alert, Box, Container, IconButton, Typography} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {WordRecord, WORDS_DICTIONARY} from '@/lib/words';
import WordCard from './WordCard';

export default function WordsPage() {
    const [activeWord, setActiveWord] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const lastPronouncedRef = useRef<{ word: string; timestamp: number } | null>(null);
    const router = useRouter();
    const words = WORDS_DICTIONARY;

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

        const now = Date.now();
        const last = lastPronouncedRef.current;
        const withinWindow = last && last.word === wordData.word && now - last.timestamp <= 5000;
        const hasExamples = Array.isArray(wordData.examples) && wordData.examples.length > 0;
        const shouldUseExample = withinWindow && hasExamples;
        const utteranceText =
            shouldUseExample && wordData.examples
                ? wordData.examples[Math.floor(Math.random() * wordData.examples.length)]
                : wordData.word;

        lastPronouncedRef.current = { word: wordData.word, timestamp: now };

        setActiveWord(wordData.word);
        setError(null);
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(utteranceText);
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
                        <Typography variant="body2" color="text.secondary">
                            Tap a card to flip for translation; tap the speaker to hear pronunciation. Press X to return.
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
                            active={activeWord === item.word}
                            onPronounce={() => pronounceWord(item)}
                        />
                    ))}
                </Box>
            </Box>
        </Container>
    );
}
