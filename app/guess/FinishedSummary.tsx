import { Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import { VariantStats, WordStatistics } from './types';

interface FinishedSummaryProps {
    score: number;
    learnedCount: number;
    totalCount: number;
    onRestart: () => void;
    onResetStats: () => void;
    wordStats: WordStatistics[];
    variantLabel: string;
    variantStats: VariantStats;
}

export default function FinishedSummary({
    score,
    learnedCount,
    totalCount,
    onRestart,
    onResetStats,
    wordStats,
    variantLabel,
    variantStats,
}: FinishedSummaryProps) {
    const safeScore = Number.isNaN(score) ? 0 : score;
    return (
        <Card
            elevation={4}
            sx={{
                maxWidth: 640,
                width: '100%',
                borderRadius: 4,
                mx: 'auto',
                textAlign: 'center',
            }}
        >
            <CardContent>
                <Stack spacing={3} alignItems="center" sx={{ textAlign: 'center', mt: 1 }}>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
                        Great job!
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={2}
                        divider={<Divider flexItem orientation="vertical" />}
                        sx={{ flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}
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

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }} justifyContent="center">
                        <Button variant="contained" size="large" onClick={onRestart}>
                            Restart
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
