import { Divider, Stack, Typography } from '@mui/material';
import { VariantStats } from '@/app/guess/types';

interface VariantStatsBarProps {
    stats: VariantStats;
}

export default function VariantStatsBar({ stats }: VariantStatsBarProps) {
    return (
        <Stack
            direction="row"
            spacing={2}
            divider={<Divider flexItem orientation="vertical" />}
            sx={{ flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}
        >
            <Typography variant="body2" color="text.secondary">
                Attempts: {stats.totalAttempts}
            </Typography>
            <Typography variant="body2" color="success.main">
                Correct: {stats.correctAttempts}
            </Typography>
            <Typography variant="body2" color="error.main">
                Wrong: {stats.wrongAttempts}
            </Typography>
            <Typography variant="body2" color="error.main">
                Learned:
            </Typography>
        </Stack>
    );
}
