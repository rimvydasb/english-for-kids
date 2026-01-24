'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {Box, Button, Card, CardContent, Container, Stack, Typography} from '@mui/material';
import {keyframes} from '@mui/material/styles';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import HearingIcon from '@mui/icons-material/Hearing';
import TranslateIcon from '@mui/icons-material/Translate';
import {GlobalConfig} from '@/lib/Config';
import {GameManager} from '@/lib/game/GameManager';

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export default function Home() {
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        const checkData = () => {
            const keys = GlobalConfig.GAMES.flatMap((game) => [game.storageKey, `${game.storageKey}_ACTIVE_SUBJECTS`]);
            return keys.some((key) => localStorage.getItem(key));
        };
        setHasData(checkData());
    }, []);

    const handleRestartAll = () => {
        if (
            window.confirm(
                'Are you sure you want to restart all games? This will reset current sessions but keep your learned words.',
            )
        ) {
            GameManager.resetAllOngoingGames();
            window.location.reload();
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 4,
                    py: 6,
                }}
            >
                <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 700,
                        backgroundImage: 'linear-gradient(90deg, #6c5ce7, #00b894, #0984e3)',
                        backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: `${gradientShift} 8s ease-in-out infinite`,
                    }}
                >
                    Learn English
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{textAlign: 'center', maxWidth: 520}}
                ></Typography>

                <Stack spacing={3} sx={{width: '100%'}}>
                    <Card
                        elevation={4}
                        component={Link}
                        href="/words"
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: 6,
                            },
                        }}
                    >
                        <CardContent
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 2,
                                minHeight: 112,
                            }}
                        >
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                <MenuBookIcon color="primary" sx={{fontSize: 42}} />
                                <Box>
                                    <Typography variant="h5">All Words</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Explore every word card with images and audio pronunciation.
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card
                        elevation={4}
                        component={Link}
                        href="/guess-the-word"
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            '&:hover': {
                                borderColor: 'secondary.main',
                                boxShadow: 6,
                            },
                        }}
                    >
                        <CardContent
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 2,
                                minHeight: 112,
                            }}
                        >
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                <SportsEsportsIcon color="secondary" sx={{fontSize: 42}} />
                                <Box>
                                    <Typography variant="h5">Guess The Word</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        See the image, hear the word, and choose the correct answer from five options.
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card
                        elevation={4}
                        component={Link}
                        href="/listen-and-guess"
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            '&:hover': {
                                borderColor: 'secondary.main',
                                boxShadow: 6,
                            },
                        }}
                    >
                        <CardContent
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 2,
                                minHeight: 112,
                            }}
                        >
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                <HearingIcon color="primary" sx={{fontSize: 42}} />
                                <Box>
                                    <Typography variant="h5">Listen &amp; Guess</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Hear the word and pick the correct translation from five options.
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card
                        elevation={4}
                        component={Link}
                        href="/guess-phrases"
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            '&:hover': {
                                borderColor: 'secondary.main',
                                boxShadow: 6,
                            },
                        }}
                    >
                        <CardContent
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 2,
                                minHeight: 112,
                            }}
                        >
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                <TranslateIcon color="secondary" sx={{fontSize: 42}} />
                                <Box>
                                    <Typography variant="h5">Guess Phrases</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Read the phrase, listen to it, and pick the right Lithuanian translation.
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Stack>

                {hasData && (
                    <Stack spacing={2} alignItems="center">
                        <Button color="error" onClick={handleRestartAll}>
                            Restart All Games
                        </Button>
                    </Stack>
                )}
            </Box>
        </Container>
    );
}
