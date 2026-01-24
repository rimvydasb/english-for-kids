import {Box, Button, Divider, IconButton, Stack, Typography} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import {keyframes} from '@mui/material/styles';
import {GlobalStatsMap, InGameAggregatedStatistics} from '@/lib/statistics/AStatisticsManager';
import WordCard, {WordCardMode} from '@/components/WordCard';
import {WordRecord} from '@/lib/words';
import {PhraseRecord} from '@/lib/types';

interface FinishedSummaryProps {
    score: number;
    learnedCount: number;
    totalCount: number;
    onRestart: () => void;
    variantStats: InGameAggregatedStatistics;
    worstWords?: WordRecord[];
    onPronounceWord?: (word: WordRecord) => void;
    worstPhrases?: PhraseRecord[];
    onPronouncePhrase?: (phrase: PhraseRecord) => void;
    globalStats?: GlobalStatsMap;
}

export default function FinishedSummary({
    score,
    learnedCount,
    totalCount,
    onRestart,
    variantStats,
    worstWords = [],
    onPronounceWord,
    worstPhrases = [],
    onPronouncePhrase,
    globalStats,
}: FinishedSummaryProps) {
    const gradientShift = keyframes`
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    `;
    return (
        <Stack spacing={3} alignItems="center" sx={{textAlign: 'center', mt: 1}}>
            <Typography
                variant="h4"
                component="h2"
                sx={{
                    fontWeight: 700,
                    backgroundImage: 'linear-gradient(90deg, #6c5ce7, #00b894, #0984e3)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: `${gradientShift} 6s ease-in-out infinite`,
                }}
            >
                Great job!
            </Typography>

            <Stack
                direction="row"
                spacing={2}
                divider={<Divider flexItem orientation="vertical" />}
                sx={{flexWrap: 'wrap', justifyContent: 'center', width: '100%'}}
            >
                <Typography variant="body2" color="text.secondary">
                    Attempts: {variantStats.totalAttempts}
                </Typography>
                <Typography variant="body2" color="success.main">
                    Correct: {variantStats.correctAttempts}
                </Typography>
                <Typography variant="body2" color="error.main">
                    Wrong: {variantStats.wrongAttempts}
                </Typography>
                <Typography variant="body2" color="error.main">
                    Learned: {learnedCount} / {totalCount}
                </Typography>
            </Stack>

            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} sx={{width: '100%'}} justifyContent="center">
                <Button variant="contained" size="large" onClick={onRestart} aria-label="restart">
                    <RestartAltIcon />
                </Button>
            </Stack>

            {worstWords.length > 0 && (
                <Box sx={{width: '100%'}}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {xs: '1fr', sm: 'repeat(3, 1fr)'},
                            gap: 2,
                        }}
                    >
                        {worstWords.map((word) => (
                            <WordCard
                                key={word.word}
                                word={word}
                                mode={WordCardMode.Learning}
                                onPronounce={() => onPronounceWord?.(word)}
                                globalStats={globalStats?.[word.word]}
                            />
                        ))}
                    </Box>
                </Box>
            )}

            {worstPhrases.length > 0 && (
                <Box sx={{width: '100%'}}>
                    <Stack spacing={1.5}>
                        {worstPhrases.map((phrase) => (
                            <Box
                                key={phrase.getSubject()}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1.5,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.paper',
                                }}
                            >
                                <Typography variant="body1" sx={{fontWeight: 600}}>
                                    {phrase.getSubject()}
                                </Typography>
                                <IconButton
                                    aria-label={`Hear ${phrase.getSubject()}`}
                                    onClick={() => onPronouncePhrase?.(phrase)}
                                >
                                    <VolumeUpIcon />
                                </IconButton>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            )}
        </Stack>
    );
}
