'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, CardActionArea, Alert } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { WRODS_DICTIONARY, WordRecord } from '@/lib/words';

export default function Home() {
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const words = WRODS_DICTIONARY;

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
    utterance.onend = () => {
      setActiveWord(null);
    };
    utterance.onerror = () => {
      setError('Failed to play pronunciation. Please try again.');
      setActiveWord(null);
    };

    synthRef.current.speak(utterance);
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          gutterBottom
          sx={{
            mb: 6,
            textAlign: 'center',
            color: 'primary.main',
          }}
        >
          English Learner
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4, width: '100%' }}>
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
            <Card key={item.word}
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease-in-out',
                  transform: activeWord === item.word ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: activeWord === item.word ? 6 : 2,
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => pronounceWord(item)}
                  sx={{
                    height: '100%',
                    minHeight: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 4,
                  }}
                >
                  <CardContent
                    sx={{
                      textAlign: 'center',
                      width: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: 200,
                        height: 200,
                        margin: '0 auto',
                        mb: 2,
                        borderRadius: 3,
                        bgcolor: activeWord === item.word ? 'secondary.light' : 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid',
                        borderColor: activeWord === item.word ? 'secondary.main' : 'grey.200',
                        overflow: 'hidden',
                      }}
                    >
                      <Image
                        src={item.getImageUrl()}
                        alt={`Illustration of ${item.word}`}
                        fill
                        sizes="200px"
                        style={{
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease-in-out',
                          transform: activeWord === item.word ? 'scale(1.05)' : 'scale(1)',
                        }}
                      />
                    </Box>
                    <VolumeUpIcon
                      sx={{
                        fontSize: 48,
                        color: activeWord === item.word ? 'secondary.main' : 'primary.main',
                        mb: 2,
                        transition: 'color 0.3s ease-in-out',
                      }}
                    />
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        fontWeight: 500,
                        color: activeWord === item.word ? 'secondary.main' : 'text.primary',
                        transition: 'color 0.3s ease-in-out',
                      }}
                    >
                      {item.word}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Click to hear pronunciation
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
          ))}
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 6, textAlign: 'center' }}
        >
          Click on any word card to hear its pronunciation
        </Typography>
      </Box>
    </Container>
  );
}
