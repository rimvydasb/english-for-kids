import { Button, Card, CardContent, Stack, Typography } from '@mui/material';

interface FinishedSummaryProps {
    score: number;
    learnedCount: number;
    totalCount: number;
    onRestart: () => void;
}

export default function FinishedSummary({ score, learnedCount, totalCount, onRestart }: FinishedSummaryProps) {
    return (
        <Card
            elevation={4}
            sx={{
                maxWidth: 520,
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
                    <Typography variant="h5" color="text.secondary">
                        Final score: {Number.isNaN(score) ? 0 : score}% ({learnedCount} / {totalCount})
                    </Typography>
                    <Button variant="contained" size="large" onClick={onRestart}>
                        Restart
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
