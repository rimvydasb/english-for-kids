import {MouseEvent, useMemo, useState} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import {WordRecord} from '@/lib/words';
import {GlobalStatistics, WordCardMode} from '@/lib/types';
import {CardHeader} from '@mui/material';

const PASTEL_BACKGROUNDS = ['#FFF897', '#E8F9FD', '#FDE2FF', '#E6FFF7', '#FFEAD2'];
const PASTEL_TEXTS = ['#A68DAD', '#6FA8DC', '#F4978E', '#7FB685', '#C26DBC'];
const NUMBER_MAP: Record<string, string> = {
    zero: '0',
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    nine: '9',
    ten: '10',
};

interface WordCardProps {
    word: WordRecord;
    active?: boolean;
    onPronounce?: () => void;
    mode?: WordCardMode;
    globalStats?: GlobalStatistics;
    showImage?: boolean;
    showTranslation?: boolean;
    showWord?: boolean;
    showWordPronunciation?: boolean;
}

export default function WordCard({
    word,
    active,
    onPronounce,
    mode = WordCardMode.Learning,
    globalStats,
    showImage: propShowImage,
    showTranslation: propShowTranslation,
    showWord: propShowWord,
    showWordPronunciation: propShowWordPronunciation,
}: WordCardProps) {
    const [flipped, setFlipped] = useState(false);
    const isNumber = word.type === 'number';

    const showWordPronunciation = propShowWordPronunciation ?? mode !== WordCardMode.GuessWord;

    const colorIndex = useMemo(
        () => word.word.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % PASTEL_BACKGROUNDS.length,
        [word.word],
    );
    const numberDisplay = useMemo(() => {
        return NUMBER_MAP[word.word] ?? word.word;
    }, [word.word]);

    const toggleFlip = () => {
        setFlipped((prev) => !prev);
    };

    const handlePronounce = (event: MouseEvent) => {
        event.stopPropagation();
        onPronounce?.();
    };

    const showImage = propShowImage ?? mode !== WordCardMode.ListenAndGuess;
    const showTranslation = propShowTranslation ?? mode !== WordCardMode.ListenAndGuess;
    const showWord = propShowWord ?? mode === WordCardMode.Learning;
    const displayedWord = useMemo(() => (showWord ? word.word : '???'), [showWord, word.word]);
    const stats: GlobalStatistics = globalStats ?? {
        key: word.word,
        correctAttempts: 0,
        wrongAttempts: 0,
    };

    const bottomRow = (
        <CardContent sx={{flexShrink: 0}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
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
                            isNumber ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flex: '1 0 auto',
                                        bgcolor: PASTEL_BACKGROUNDS[colorIndex],
                                    }}
                                >
                                    <Typography
                                        component="div"
                                        sx={{
                                            fontSize: {xs: 110, sm: 150},
                                            fontWeight: 800,
                                            color: PASTEL_TEXTS[colorIndex % PASTEL_TEXTS.length],
                                            textShadow: '0 1px 0 rgba(0,0,0,0.08)',
                                        }}
                                    >
                                        {numberDisplay}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box
                                    component="img"
                                    src={word.getImageUrl() ?? undefined}
                                    alt={`Illustration of ${word.word}`}
                                    sx={{
                                        objectFit: 'cover',
                                        width: '100%',
                                        aspectRatio: '1 / 1',
                                        flex: '1 0 auto',
                                    }}
                                />
                            )
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
                        <CardHeader
                            subheader={
                                <Box sx={{display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center'}}>
                                    <Typography variant="body2" color="success.main" sx={{fontWeight: 600}}>
                                        Correct: {stats.correctAttempts}
                                    </Typography>
                                    <Typography variant="body2" color="error.main" sx={{fontWeight: 600}}>
                                        Wrong: {stats.wrongAttempts}
                                    </Typography>
                                </Box>
                            }
                        />
                        <CardContent
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                flexGrow: 1,
                            }}
                        >
                            <Typography variant="h6" component="div" sx={{fontWeight: 600}}>
                                {showTranslation ? word.translation || '-' : ''}
                            </Typography>
                        </CardContent>
                        {bottomRow}
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}
