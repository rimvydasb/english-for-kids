import { MouseEvent, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { WordRecord } from '@/lib/words';

interface WordCardProps {
    word: WordRecord;
    active?: boolean;
    onPronounce?: () => void;
    labelOverride?: string;
    disableFlip?: boolean;
}

export default function WordCard({ word, active, onPronounce, labelOverride, disableFlip }: WordCardProps) {
    const [flipped, setFlipped] = useState(false);

    const toggleFlip = () => {
        if (disableFlip) {
            return;
        }
        setFlipped((prev) => !prev);
    };

    const handlePronounce = (event: MouseEvent) => {
        event.stopPropagation();
        onPronounce?.();
    };

    const bottomRow = (
        <CardContent>
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
                    {labelOverride || word.word}
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
                height: '100%',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out',
                transform: active ? 'scale(1.03)' : 'scale(1)',
                boxShadow: active ? 6 : 2,
                border: '1px solid',
                borderColor: active ? 'secondary.main' : 'divider',
                cursor: disableFlip ? 'default' : 'pointer',
            }}
        >
            <Box sx={{ perspective: '1200px' }}>
                <Box
                    sx={{
                        position: 'relative',
                        minHeight: 420,
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
                        }}
                    >
                        <CardMedia
                            component="img"
                            height="320"
                            image={word.getImageUrl()}
                            alt={`Illustration of ${word.word}`}
                            sx={{ objectFit: 'cover' }}
                        />
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
                            bgcolor: 'grey.100',
                            borderRadius: 1,
                        }}
                    >
                        <CardContent
                            sx={{
                                minHeight: 320,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                flexGrow: 1,
                            }}
                        >
                            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                                {word.translation || 'Translation unavailable'}
                            </Typography>
                        </CardContent>
                        {bottomRow}
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}
