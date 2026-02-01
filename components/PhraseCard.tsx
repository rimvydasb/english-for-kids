import {MouseEvent} from 'react';
import {Card, CardContent, IconButton, Typography} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import {PhraseRecord} from '@/lib/types';

interface PhraseCardProps {
    phrase: PhraseRecord;
    active?: boolean;
    showTranslation?: boolean;
    showPhrase?: boolean;
    showPhrasePronunciation?: boolean;
    onPronounce?: () => void;
}

export default function PhraseCard({
    phrase,
    active = false,
    showTranslation = false,
    showPhrase = true,
    showPhrasePronunciation = true,
    onPronounce,
}: PhraseCardProps) {
    const handlePronounce = (event: MouseEvent) => {
        event.stopPropagation();
        onPronounce?.();
    };

    return (
        <Card
            sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: active ? 'secondary.main' : 'divider',
                boxShadow: active ? 6 : 2,
                transition: 'all 0.3s ease',
                overflow: 'hidden',
            }}
        >
            <CardContent sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                <Typography
                    variant="h4"
                    component="div"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 800,
                        lineHeight: 1.2,
                        color: 'text.primary',
                        wordBreak: 'break-word',
                    }}
                >
                    {showPhrase ? phrase.phrase : '???'}
                    {showPhrasePronunciation && (
                        <IconButton
                            aria-label={`Hear ${phrase.phrase}`}
                            onClick={handlePronounce}
                            color={active ? 'secondary' : 'primary'}
                        >
                            <VolumeUpIcon />
                        </IconButton>
                    )}
                </Typography>

                {showTranslation && phrase.translation && (
                    <Typography
                        variant="h6"
                        sx={{
                            textAlign: 'center',
                            color: 'text.secondary',
                            fontStyle: 'italic',
                        }}
                    >
                        {phrase.translation}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}
