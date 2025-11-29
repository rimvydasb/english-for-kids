import { Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { keyframes } from '@mui/material/styles';
import { VariantStats } from './types';

interface FinishedSummaryProps {
    score: number;
    learnedCount: number;
    totalCount: number;
    onRestart: () => void;
    variantStats: VariantStats;
}

export default function FinishedSummary({
    score,
    learnedCount,
    totalCount,
    onRestart,
    variantStats,
}: FinishedSummaryProps) {
    const gradientShift = keyframes`
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    `;
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
                        <Button variant="contained" size="large" onClick={onRestart} aria-label="restart">
                            <RestartAltIcon />
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
