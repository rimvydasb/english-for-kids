import { Button, Stack, Typography } from '@mui/material';

interface FinishedSummaryProps {
    score: number;
    learnedCount: number;
    totalCount: number;
    onRestart: () => void;
}

export default function FinishedSummary({ score, learnedCount, totalCount, onRestart }: FinishedSummaryProps) {
    return (
        <Stack spacing={3} alignItems="center" sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
                Great job! You finished all words.
            </Typography>
            <Typography variant="h5" color="text.secondary">
                Final score: {Number.isNaN(score) ? 0 : score}% ({learnedCount} / {totalCount})
            </Typography>
            <Button variant="contained" size="large" onClick={onRestart}>
                Restart Game
            </Button>
        </Stack>
    );
}
