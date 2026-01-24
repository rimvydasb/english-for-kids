import {ReactNode} from 'react';
import {Box, IconButton} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import HearingIcon from '@mui/icons-material/Hearing';
import {keyframes} from '@mui/material/styles';
import {VARIANT_CONFIG, WordGameVariant} from '@/lib/guessConfig';

export interface ScoreHeaderProps {
    learnedCount: number;
    totalCount: number;
    onExit: () => void;
    showScore?: boolean;
    variant?: WordGameVariant;
    icon?: ReactNode;
}

export default function GuessScoreHeader({
    learnedCount,
    totalCount,
    onExit,
    showScore = true,
    variant,
    icon,
}: ScoreHeaderProps) {
    const gradientShift = keyframes`
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    `;
    const defaultIcon =
        variant === 'listenAndGuess' ? (
            <HearingIcon color="primary" sx={{fontSize: 32}} />
        ) : (
            <SportsEsportsIcon color="secondary" sx={{fontSize: 32}} />
        );
    const chosenIcon = icon ?? defaultIcon;
    const boxes = Array.from({length: totalCount}, (_, index) => index < learnedCount);

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
                aria-label={variant ? `${VARIANT_CONFIG[variant].label} icon` : 'Game icon'}
                sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    backgroundColor: 'background.paper',
                }}
            >
                {chosenIcon}
            </Box>
            {showScore ? (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        flexWrap: 'wrap',
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    {boxes.map((isLearned, index) => (
                        <Box
                            key={index}
                            sx={{
                                width: 18,
                                height: 18,
                                borderRadius: 1,
                                border: '2px solid',
                                borderColor: isLearned ? 'transparent' : 'primary.main',
                                backgroundImage: isLearned
                                    ? 'linear-gradient(90deg, #6c5ce7, #00b894, #0984e3)'
                                    : 'none',
                                backgroundSize: '220% 220%',
                                animation: isLearned ? `${gradientShift} 6s ease-in-out infinite` : 'none',
                                boxShadow: isLearned ? '0 8px 16px rgba(0,0,0,0.12)' : 'none',
                                flexShrink: 0,
                            }}
                        />
                    ))}
                </Box>
            ) : (
                <Box sx={{flex: 1}} />
            )}
            <IconButton aria-label="Return to main menu" onClick={onExit}>
                <HighlightOffIcon fontSize="large" />
            </IconButton>
        </Box>
    );
}
