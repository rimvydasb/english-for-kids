import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import {WordRecord} from '@/lib/words';

interface WordCardProps {
    word: WordRecord;
    active?: boolean;
    onPronounce: () => void;
}

export default function WordCard({word, active, onPronounce}: WordCardProps) {
    return (
        <Card
            elevation={2}
            sx={{
                height: '100%',
                transition: 'all 0.3s ease-in-out',
                transform: active ? 'scale(1.03)' : 'scale(1)',
                borderRadius: '16px',
                overflow: 'hidden',
            }}
        >
            <CardMedia
                component="img"
                height="200"
                image={word.getImageUrl()}
                alt={`Illustration of ${word.word}`}
                sx={{objectFit: 'cover'}}
            />
            <CardContent>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            color: active ? 'secondary.main' : 'text.primary',
                        }}
                    >
                        {word.word}
                    </Typography>
                    <IconButton aria-label={`Hear ${word.word}`} onClick={onPronounce}
                                color={active ? 'secondary' : 'primary'}>
                        <VolumeUpIcon/>
                    </IconButton>
                </Box>
            </CardContent>
        </Card>
    );
}
