'use client';

import {useEffect, useState} from 'react';
import {Box, Button, IconButton, keyframes, Modal, Stack, Typography} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {WordEntryType} from '@/lib/types';
import {GlobalConfig} from '@/lib/config';

const pulse = keyframes`
    0% {
        box-shadow: 0 0 0 0 rgba(108, 92, 231, 0.7);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(108, 92, 231, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(108, 92, 231, 0);
    }
`;

interface GameConfigModalProps {
    open: boolean;
    onStart: (count: number, types: WordEntryType[]) => void;
    onClose: () => void;
    showTypes?: boolean;
}

export default function GameConfigModal({open, onStart, onClose, showTypes = true}: GameConfigModalProps) {
    const [count, setCount] = useState<number | null>(null);
    const [types, setTypes] = useState<WordEntryType[] | null>(null);

    useEffect(() => {
        if (open) {
            setCount(null);
            setTypes(showTypes ? null : []);
        }
    }, [open, showTypes]);

    useEffect(() => {
        if (count !== null && types !== null) {
            const timer = setTimeout(() => {
                if (open) {
                    onStart(count, types);
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [count, types, onStart, open]);

    const handleCountSelect = (val: number) => setCount(val);
    const handleTypeSelect = (val: WordEntryType[]) => setTypes(val);

    const getButtonStyle = (isSelected: boolean) => ({
        flex: 1,
        py: 3,
        px: 2,
        borderRadius: 0,
        border: '3px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        bgcolor: isSelected ? 'primary.main' : 'background.paper',
        color: isSelected ? 'primary.contrastText' : 'text.primary',
        fontWeight: 900,
        textTransform: 'uppercase' as const,
        fontSize: '1.25rem',
        boxShadow: isSelected ? 8 : 2,
        animation: isSelected ? `${pulse} 2s infinite` : 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            borderColor: 'primary.main',
            bgcolor: isSelected ? 'primary.dark' : 'action.hover',
            boxShadow: 6,
            transform: 'translateY(-2px)',
        },
        '&:active': {
            transform: 'translateY(0)',
            boxShadow: 2,
        },
    });

    return (
        <Modal
            open={open}
            onClose={onClose}
            disableEscapeKeyDown
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)', // Lighter overlay to show off the blur
                    },
                },
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: 600,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 4,
                    outline: 'none',
                }}
            >
                <IconButton
                    aria-label="Close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon/>
                </IconButton>

                <Typography variant="h4" component="h2" gutterBottom align="center" sx={{mb: 4}}>
                    Game Setup
                </Typography>

                <Stack spacing={4}>
                    <Box>
                        <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                            <Button
                                onClick={() => handleCountSelect(GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN)}
                                sx={getButtonStyle(count === GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN)}
                                data-testid="word-count-all"
                            >
                                All Words
                            </Button>
                            <Button
                                onClick={() => handleCountSelect(5)}
                                sx={getButtonStyle(count === 5)}
                                data-testid="word-count-5"
                            >
                                5 Words
                            </Button>
                            <Button
                                onClick={() => handleCountSelect(20)}
                                sx={getButtonStyle(count === 20)}
                                data-testid="word-count-20"
                            >
                                20 Words
                            </Button>
                        </Stack>
                    </Box>

                    {showTypes && (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {xs: '1fr', sm: 'repeat(3, 1fr)'},
                                gap: 2,
                            }}
                        >
                            <Button
                                onClick={() => handleTypeSelect([])}
                                sx={{...getButtonStyle(types !== null && types.length === 0)}}
                                data-testid="topic-any"
                            >
                                Any
                            </Button>
                            <Button
                                onClick={() => handleTypeSelect(['number'])}
                                sx={getButtonStyle(types?.includes('number') || false)}
                                data-testid="topic-numbers"
                            >
                                1,2,3...
                            </Button>
                            <Button
                                onClick={() => handleTypeSelect(['color'])}
                                sx={getButtonStyle(types?.includes('color') || false)}
                                data-testid="topic-colors"
                            >
                                Black, White...
                            </Button>
                            <Button
                                onClick={() => handleTypeSelect(['noun'])}
                                sx={getButtonStyle(types?.includes('noun') || false)}
                                data-testid="topic-nouns"
                            >
                                Cat, Dog...
                            </Button>
                            <Button
                                onClick={() => handleTypeSelect(['adjective'])}
                                sx={getButtonStyle(types?.includes('adjective') || false)}
                                data-testid="topic-adjectives"
                            >
                                Happy, Sad...
                            </Button>
                        </Box>
                    )}
                </Stack>
            </Box>
        </Modal>
    );
}
