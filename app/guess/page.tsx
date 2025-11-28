'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { WRODS_DICTIONARY, WordRecord } from '@/lib/words';

const STORAGE_KEY = 'guess_game_learned_words';
const EXTRA_DECOYS = ['apple', 'book', 'window', 'chair', 'eraser', 'lamp'];

const shuffle = (values: string[]) => {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const uniqueOptions = (words: WordRecord[], answer: WordRecord) => {
  const pool = new Set<string>([
    ...words.map((item) => item.word),
    ...EXTRA_DECOYS,
  ]);
  pool.delete(answer.word);

  const decoys = shuffle(Array.from(pool)).slice(0, 4);
  return shuffle([answer.word, ...decoys]);
};

const pickNextWord = (words: WordRecord[], learned: Set<string>) => {
  const unlearned = words.filter((item) => !learned.has(item.word));
  const pool = unlearned.length > 0 ? unlearned : words;
  return pool[Math.floor(Math.random() * pool.length)];
};

const loadLearnedFromStorage = () => {
  if (typeof window === 'undefined') {
    return new Set<string>();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return new Set<string>();
  }

  try {
    const parsed: string[] = JSON.parse(stored);
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
};

const persistLearned = (learned: Set<string>) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(learned)));
};

export default function GuessWordGame() {
  const words = useMemo(() => WRODS_DICTIONARY, []);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [currentWord, setCurrentWord] = useState<WordRecord | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const synthRef = useRef<SpeechSynthesis | null>(null);

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
    } else {
      setError('Speech synthesis is not available in this browser.');
    }

    const stored = loadLearnedFromStorage();
    setLearnedWords(stored);
    const nextWord = pickNextWord(words, stored);
    setCurrentWord(nextWord);
    setOptions(uniqueOptions(words, nextWord));

    return () => synthRef.current?.cancel();
  }, [words]);

  const pronounceWord = () => {
    if (!currentWord) {
      return;
    }

    if (!synthRef.current) {
      setError('Speech synthesis is not available in this browser.');
      return;
    }

    setError(null);
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    synthRef.current.speak(utterance);
  };

  const handleGuess = (guess: string) => {
    if (!currentWord) {
      return;
    }

    const isCorrect = guess === currentWord.word;
    setFeedback(isCorrect ? 'Correct!' : `Not quite. The word was "${currentWord.word}".`);

    setLearnedWords((prev) => {
      const updated = new Set(prev);
      if (isCorrect) {
        updated.add(currentWord.word);
      }
      persistLearned(updated);

      const nextWord = pickNextWord(words, updated);
      setCurrentWord(nextWord);
      setOptions(uniqueOptions(words, nextWord));

      return updated;
    });
  };

  const score = Math.round((learnedWords.size / words.length) * 100);

  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: '100vh', py: 4, position: 'relative' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Guess Word Game
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Press X to return to the main menu. Score is remembered for this browser.
            </Typography>
          </Box>
          <IconButton aria-label="Return to main menu" onClick={() => router.push('/')}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            px: 2,
            py: 1,
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Learned words: {learnedWords.size} / {words.length}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Score: {Number.isNaN(score) ? 0 : score}%
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card
          elevation={4}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={3}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                gap: 3,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: '100%', sm: 320 },
                  height: 240,
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'grey.100',
                }}
              >
                {currentWord && (
                  <Image
                    src={currentWord.getImageUrl()}
                    alt={`Guess the word for this illustration`}
                    fill
                    sizes="320px"
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </Box>
              <Button
                onClick={pronounceWord}
                variant="contained"
                color="secondary"
                startIcon={<VolumeUpIcon />}
                sx={{ minWidth: 200 }}
              >
                Hear the word
              </Button>
            </Box>

            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Choose the correct word:
              </Typography>
              <Stack
                spacing={1}
                sx={{
                  width: '100%',
                }}
              >
                {options.map((option) => (
                  <Button
                    key={option}
                    variant="outlined"
                    onClick={() => handleGuess(option)}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {option}
                  </Button>
                ))}
              </Stack>
            </Stack>

            {feedback && (
              <Alert
                severity={feedback.startsWith('Correct') ? 'success' : 'info'}
                onClose={() => setFeedback(null)}
              >
                {feedback}
              </Alert>
            )}
          </Stack>
        </Card>
      </Box>
    </Container>
  );
}
