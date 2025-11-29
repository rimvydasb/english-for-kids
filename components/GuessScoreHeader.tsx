import { Box, IconButton, Stack, Typography } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { GameVariant, VARIANT_CONFIG } from '@/app/guess/types';

interface ScoreHeaderProps {
    learnedCount: number;
    totalCount: number;
    score: number;
    onExit: () => void;
    showScore?: boolean;
    variant: GameVariant;
}

export default function GuessScoreHeader({
    learnedCount,
    totalCount,
    score,
    onExit,
    showScore = true,
    variant,
}: ScoreHeaderProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                gap: 2,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    flex: 1,
                    minWidth: 0,
                }}
            >
                <Typography
                    variant="h4"
                    component="h1"
                    noWrap
                    sx={{ fontWeight: 700, minWidth: 0, display: { xs: 'none', sm: 'block' } }}
                >
                    {VARIANT_CONFIG[variant].label}
                </Typography>

                <Typography variant="h5" component="div" sx={{ minWidth: 96, textAlign: 'center' }}>
                    ({learnedCount} / {totalCount})
                </Typography>
                {showScore && (
                    <Typography variant="h5" component="div" sx={{ fontWeight: 700, textAlign: 'right' }}>
                        {Number.isNaN(score) ? 0 : score}%
                    </Typography>
                )}
            </Box>
            <IconButton aria-label="Return to main menu" onClick={onExit}>
                <HighlightOffIcon fontSize="large" />
            </IconButton>
        </Box>
    );
}
