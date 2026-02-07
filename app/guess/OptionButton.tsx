import {useMemo} from 'react';
import IconButton from '@mui/material/IconButton';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import Box from '@mui/material/Box';
import {keyframes} from '@mui/material/styles';
import {PhraseRecord, WordRecord} from '@/lib/types';

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

const quickPop = keyframes`
    0% {
        transform: scale(1);
    }
    40% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
`;

const shakeAnimation = keyframes`
    0% {
        transform: translateX(0);
    }
    20% {
        transform: translateX(-6px);
    }
    40% {
        transform: translateX(6px);
    }
    60% {
        transform: translateX(-4px);
    }
    80% {
        transform: translateX(4px);
    }
    100% {
        transform: translateX(0);
    }
`;

const fadeAwayAnimation = keyframes`
    0% {
        opacity: 1;
        transform: scale(1);
    }
    100% {
        opacity: 0;
        transform: scale(0.96);
    }
`;

interface OptionButtonProps {
    subject: WordRecord | PhraseRecord;
    label: string;
    value: string;
    isGlowing: boolean;
    isShaking: boolean;
    shouldFade: boolean;
    isHidden: boolean;
    isLocked: boolean;
    glowSeed: number;
    showPronunciation?: boolean;
    onPronounce?: (subject: WordRecord | PhraseRecord) => void;
    onGuess: (value: string) => void;
    isCorrect: boolean;
}

export default function OptionButton({
    subject,
    label,
    value,
    isGlowing,
    isShaking,
    shouldFade,
    isHidden,
    isLocked,
    glowSeed,
    showPronunciation,
    onPronounce,
    onGuess,
    isCorrect,
}: OptionButtonProps) {
    const minWidth = Math.max(label.length * 14, 140);
    const animatedGradient = useMemo(() => {
        if (!isGlowing) {
            return null;
        }
        const gradients = [
            'linear-gradient(90deg, #6c5ce7, #00b894, #0984e3)',
            'linear-gradient(90deg, #ff9a9e, #fad0c4, #fcb69f)',
            'linear-gradient(90deg, #84fab0, #8fd3f4, #70a1ff)',
            'linear-gradient(90deg, #f6d365, #fda085, #fbc2eb)',
            'linear-gradient(90deg, #a18cd1, #fbc2eb, #6dd5ed)',
        ];
        const index = Math.floor(Math.abs(glowSeed * gradients.length)) % gradients.length;
        return gradients[index];
    }, [glowSeed, isGlowing]);

    const animatedStyles: {
        backgroundImage?: string | null;
        backgroundSize?: string;
        color?: string;
        animation?: string;
        boxShadow?: string;
        borderColor?: string;
    } = isGlowing
        ? {
              backgroundImage: animatedGradient ?? undefined,
              backgroundSize: '220% 220%',
              color: '#fff',
              animation: `${gradientShift} 1.3s ease-in-out infinite, ${quickPop} 0.6s ease-out`,
              boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
              borderColor: 'transparent',
          }
        : {};

    const handlePronounceClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPronounce?.(subject);
    };

    // Determine colors and borders based on state
    const borderColor = isShaking ? 'error.main' : isGlowing ? 'transparent' : 'rgba(25, 118, 210, 0.5)'; // Default primary-ish border

    const color = isShaking ? 'error.main' : isGlowing ? '#fff' : 'primary.main';

    const bgcolor = isShaking
        ? 'error.light'
        : isGlowing
          ? 'primary.main' // Fallback if no gradient
          : 'transparent';

    const optionType = subject instanceof WordRecord ? subject.type : subject.getSubjectType();

    return (
        <Box
            onClick={() => onGuess(value)}
            data-testid="option-button"
            data-option-value={value}
            data-is-correct={isCorrect}
            data-option-type={optionType}
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxSizing: 'border-box',
                borderRadius: '8px',
                border: '2px solid',
                cursor: 'pointer',
                userSelect: 'none',
                verticalAlign: 'middle',
                appearance: 'none',
                textDecoration: 'none',

                // Dynamic styles
                borderColor: animatedStyles.borderColor || borderColor,
                color: animatedStyles.color || color,
                bgcolor: bgcolor,

                textTransform: 'none',
                fontWeight: 700,
                fontSize: 25,
                minWidth,
                pl: showPronunciation ? 1 : 2.5,
                pr: 2.5,
                py: '7px', // Approx large button padding
                pointerEvents: isLocked || isHidden ? 'none' : 'auto',
                animation: shouldFade
                    ? `${fadeAwayAnimation} 3s forwards`
                    : isShaking
                      ? `${shakeAnimation} 0.5s ease`
                      : isGlowing
                        ? animatedStyles.animation
                        : 'none',
                opacity: shouldFade ? 0 : 1,
                visibility: isHidden ? 'hidden' : 'visible',
                backgroundImage: animatedStyles.backgroundImage,
                backgroundSize: animatedStyles.backgroundSize,
                boxShadow: animatedStyles.boxShadow,
                transition:
                    'background-color 250ms, border-color 250ms, color 250ms, box-shadow 250ms, transform 250ms',

                '&:hover': {
                    bgcolor: isGlowing ? undefined : 'rgba(25, 118, 210, 0.04)', // Hover state for outlined
                    borderColor: isGlowing ? undefined : 'primary.main',
                    ...((isGlowing ? animatedStyles : {}) as any),
                },
                gap: 1,
            }}
        >
            {showPronunciation && (
                <IconButton
                    size="small"
                    onClick={handlePronounceClick}
                    sx={{
                        color: 'inherit',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: isGlowing ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.12)',
                        backgroundColor: isGlowing ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)',
                        p: 0.8,
                        mr: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                            backgroundColor: isGlowing ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.1)',
                            transform: 'scale(1.1)',
                        },
                    }}
                >
                    <VolumeUpIcon sx={{fontSize: 40}} />
                </IconButton>
            )}
            {label}
        </Box>
    );
}
