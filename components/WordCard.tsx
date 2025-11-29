import { MouseEvent, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { WordRecord } from '@/lib/words';

export enum WordCardMode {
    Learning = 'learning',
    GuessWord = 'guessWord',
    ListenAndGuess = 'listenAndGuess',
}

interface WordCardProps {
    word: WordRecord;
    active?: boolean;
    onPronounce?: () => void;
    mode?: WordCardMode;
}

export default function WordCard({
    word,
    active,
    onPronounce,
    mode = WordCardMode.Learning,
}: WordCardProps) {
    const [flipped, setFlipped] = useState(false);

    const toggleFlip = () => {
        setFlipped((prev) => !prev);
    };

    const handlePronounce = (event: MouseEvent) => {
        event.stopPropagation();
        onPronounce?.();
    };

    const showImage = mode !== WordCardMode.ListenAndGuess;
    const showTranslation = mode !== WordCardMode.ListenAndGuess;
    const displayedWord = useMemo(
        () => (mode === WordCardMode.Learning ? word.word : '???'),
        [mode, word.word],
    );

    const bottomRow = (
        <CardContent sx={{ flexShrink: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        color: active ? 'secondary.main' : 'text.primary',
                    }}
                >
                    {displayedWord}
                </Typography>
                <IconButton
                    aria-label={`Hear ${word.word}`}
                    onClick={handlePronounce}
                    color={active ? 'secondary' : 'primary'}
                >
                    <VolumeUpIcon />
                </IconButton>
            </Box>
        </CardContent>
    );

    return (
        <Card
            onClick={toggleFlip}
            sx={{
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out',
                transform: active ? 'scale(1.03)' : 'scale(1)',
                boxShadow: active ? 6 : 2,
                borderColor: active ? 'secondary.main' : 'divider',
                cursor: 'pointer',
                borderRadius: 4,
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: 'calc(100% + 88px)',
                    perspective: '1200px',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.6s ease',
                        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            backfaceVisibility: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                        }}
                    >
                        {showImage ? (
                            <CardMedia
                                component="img"
                                image={word.getImageUrl()}
                                alt={`Illustration of ${word.word}`}
                                sx={{
                                    objectFit: 'cover',
                                    width: '100%',
                                    aspectRatio: '1 / 1',
                                    flex: '1 0 auto',
                                }}
                            />
                        ) : (
                            <Box
                                sx={{
                                    flex: '1 0 auto',
                                    aspectRatio: '1 / 1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'grey.100',
                                    color: 'text.secondary',
                                    fontWeight: 700,
                                    fontSize: 56,
                                }}
                            >
                                ?
                            </Box>
                        )}
                        {bottomRow}
                    </Box>

                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            bgcolor: 'grey.100',
                            borderRadius: 4,
                        }}
                    >
                        <CardContent
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                flexGrow: 1,
                            }}
                        >
                            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                                {showTranslation
                                    ? word.translation || 'Translation unavailable'
                                    : 'Keep listening and guessing!'}
                            </Typography>
                        </CardContent>
                        {bottomRow}
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}
