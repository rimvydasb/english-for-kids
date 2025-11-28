'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, CardActionArea, Alert, Stack } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

interface WordData {
  id: number;
  word: string;
  audioUrl: string;
}

const words: WordData[] = [
  {
    id: 1,
    word: 'car',
    audioUrl: 'https://www.oxfordlearnersdictionaries.com/media/english/uk_pron/c/car/car__/car__gb_1.mp3'
  },
  {
    id: 2,
    word: 'robot',
    audioUrl: 'https://www.oxfordlearnersdictionaries.com/media/english/uk_pron/r/rob/robot/robot__gb_2.mp3'
  },
  {
    id: 3,
    word: 'spoon',
    audioUrl: 'https://www.oxfordlearnersdictionaries.com/media/english/uk_pron/s/spo/spoon/spoon__gb_1.mp3'
  },
];

export default function Home() {
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fetch or generate images for all words
    words.forEach(async (wordData) => {
      setImageLoading((prev) => ({ ...prev, [wordData.word]: true }));

      try {
        const response = await fetch(`/api/image?word=${encodeURIComponent(wordData.word)}`);
        const data = await response.json();

        if (data.success && data.imageUrl) {
          setImageUrls((prev) => ({ ...prev, [wordData.word]: data.imageUrl }));
        } else {
          console.error(`Failed to get image for ${wordData.word}:`, data.error);
        }
      } catch (err) {
        console.error(`Error fetching image for ${wordData.word}:`, err);
      } finally {
        setImageLoading((prev) => ({ ...prev, [wordData.word]: false }));
      }
    });

    // Cleanup function to stop audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const pronounceWord = (wordData: WordData) => {
    setActiveWord(wordData.word);
    setError(null);

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Create new audio element
    const audio = new Audio(wordData.audioUrl);
    audioRef.current = audio;

    // Reset active state when done
    audio.onended = () => {
      setActiveWord(null);
    };

    audio.onerror = () => {
      console.error('Audio playback error for:', wordData.word);
      setError('Failed to load pronunciation. Please try again.');
      setActiveWord(null);
    };

    // Play the audio
    audio.play().catch((err) => {
      console.error('Audio play error:', err);
      setError('Failed to play pronunciation. Please try again.');
      setActiveWord(null);
    });
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
            <Card key={item.id}
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
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {imageLoading[item.word] && (
                        <Typography variant="body2" color="text.secondary">
                          Loading...
                        </Typography>
                      )}
                      {imageUrls[item.word] && (
                        <Box
                          component="img"
                          src={imageUrls[item.word]}
                          alt={`Illustration of ${item.word}`}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.1)',
                            },
                          }}
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
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
