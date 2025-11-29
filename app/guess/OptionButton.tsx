import { useMemo } from 'react';
import Button from '@mui/material/Button';
import { keyframes } from '@mui/material/styles';

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const quickPop = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shakeAnimation = keyframes`
  0% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
  100% { transform: translateX(0); }
`;

const fadeAwayAnimation = keyframes`
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.96); }
`;

interface OptionButtonProps {
    label: string;
    value: string;
    isGlowing: boolean;
    isShaking: boolean;
    shouldFade: boolean;
    isLocked: boolean;
    glowSeed: number;
    onGuess: (value: string) => void;
}

export default function OptionButton({
    label,
    value,
    isGlowing,
    isShaking,
    shouldFade,
    isLocked,
    glowSeed,
    onGuess,
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

    return (
        <Button
            variant={isGlowing ? 'contained' : 'outlined'}
            color={isShaking ? 'error' : isGlowing ? 'success' : 'primary'}
            size="large"
            onClick={() => onGuess(value)}
            sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 25,
                minWidth,
                px: 2.5,
                pointerEvents: isLocked ? 'none' : 'auto',
                animation: shouldFade
                    ? `${fadeAwayAnimation} 3s forwards`
                    : isShaking
                        ? `${shakeAnimation} 0.5s ease`
                        : isGlowing
                            ? animatedStyles.animation
                            : 'none',
                bgcolor: isShaking ? 'error.light' : isGlowing ? 'primary.main' : undefined,
                borderColor: isShaking ? 'error.main' : undefined,
                color: isShaking ? 'error.main' : animatedStyles.color,
                opacity: shouldFade ? 0 : 1,
                backgroundImage: animatedStyles.backgroundImage,
                backgroundSize: animatedStyles.backgroundSize,
                boxShadow: animatedStyles.boxShadow,
                '&:hover': isGlowing
                    ? animatedStyles
                    : undefined,
            }}
        >
            {label}
        </Button>
    );
}
