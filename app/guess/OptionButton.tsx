import Button from '@mui/material/Button';
import { keyframes } from '@mui/material/styles';

const glowAnimation = keyframes`
    0% {
        box-shadow: 0 0 0 0 rgba(122, 150, 248, 0.4);
    }
    40% {
        box-shadow: 0 0 18px 8px rgba(28, 72, 223, 0.35);
    }
    80% {
        box-shadow: 0 0 10px 2px rgba(67, 255, 0, 0.25);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
    }
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
    onGuess: (value: string) => void;
}

export default function OptionButton({
    label,
    value,
    isGlowing,
    isShaking,
    shouldFade,
    isLocked,
    onGuess,
}: OptionButtonProps) {
    const minWidth = Math.max(label.length * 14, 140);
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
                animation: isGlowing
                    ? `${glowAnimation} 3s ease-in-out`
                    : shouldFade
                        ? `${fadeAwayAnimation} 3s forwards`
                        : isShaking
                            ? `${shakeAnimation} 0.5s ease`
                            : 'none',
                bgcolor: isGlowing ? 'success.light' : undefined,
                borderColor: isShaking ? 'error.main' : undefined,
                color: isShaking ? 'error.main' : undefined,
                opacity: shouldFade ? 0 : 1,
            }}
        >
            {label}
        </Button>
    );
}
