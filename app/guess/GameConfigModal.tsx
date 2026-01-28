'use client';

import {useEffect, useState} from 'react';
import {Box, Button, Modal, Stack, Typography, keyframes} from '@mui/material';
import {WordEntryType} from '@/lib/types';
import {GlobalConfig} from '@/lib/Config';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(108, 92, 231, 0); }
  100% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0); }
`;

interface GameConfigModalProps {
    open: boolean;
    onStart: (count: number, types: WordEntryType[]) => void;
    showTypes?: boolean;
}

export default function GameConfigModal({open, onStart, showTypes = true}: GameConfigModalProps) {
    const [count, setCount] = useState<number | null>(null);
    const [types, setTypes] = useState<WordEntryType[] | null>(null);

    useEffect(() => {
        // If types are hidden, we treat them as selected (empty array) immediately or default to []
        if (!showTypes && types === null) {
            setTypes([]);
        }
    }, [showTypes, types]);

    useEffect(() => {
        if (count !== null && types !== null) {
            const timer = setTimeout(() => {
                onStart(count, types);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [count, types, onStart]);

    const handleCountSelect = (val: number) => setCount(val);
    const handleTypeSelect = (val: WordEntryType[]) => setTypes(val);

    const getButtonStyle = (isSelected: boolean) => ({
        flex: 1,
        py: 1.5,
        borderRadius: 2,
        border: '2px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        bgcolor: isSelected ? 'primary.light' : 'background.paper',
        color: isSelected ? 'primary.contrastText' : 'text.primary',
        fontWeight: 700,
        textTransform: 'none' as const,
        fontSize: '1.1rem',
        animation: isSelected ? `${pulse} 1.5s infinite` : 'none',
        '&:hover': {
            borderColor: 'primary.main',
            bgcolor: isSelected ? 'primary.light' : 'action.hover',
        },
    });

    return (
        <Modal
            open={open}
            onClose={() => {}}
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
                <Typography variant="h4" component="h2" gutterBottom align="center" sx={{mb: 4}}>
                    Game Setup
                </Typography>

                <Stack spacing={4}>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            How many words?
                        </Typography>
                        <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                            <Button
                                onClick={() => handleCountSelect(5)}
                                sx={getButtonStyle(count === 5)}
                            >
                                5 Words
                            </Button>
                            <Button
                                onClick={() => handleCountSelect(20)}
                                sx={getButtonStyle(count === 20)}
                            >
                                20 Words
                            </Button>
                            <Button
                                onClick={() => handleCountSelect(GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN)}
                                sx={getButtonStyle(count === GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN)}
                            >
                                All Words
                            </Button>
                        </Stack>
                    </Box>

                    {showTypes && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                What topic?
                            </Typography>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {xs: '1fr', sm: 'repeat(3, 1fr)'},
                                    gap: 2,
                                }}
                            >
                                <Button
                                    onClick={() => handleTypeSelect([])}
                                    sx={{...getButtonStyle(types !== null && types.length === 0), gridColumn: {sm: 'span 3'}}}
                                >
                                    Any Topic
                                </Button>
                                <Button
                                    onClick={() => handleTypeSelect(['number'])}
                                    sx={getButtonStyle(types?.includes('number') || false)}
                                >
                                    Numbers
                                </Button>
                                <Button
                                    onClick={() => handleTypeSelect(['color'])}
                                    sx={getButtonStyle(types?.includes('color') || false)}
                                >
                                    Colors
                                </Button>
                                <Button
                                    onClick={() => handleTypeSelect(['noun'])}
                                    sx={getButtonStyle(types?.includes('noun') || false)}
                                >
                                    Nouns
                                </Button>
                                <Button
                                    onClick={() => handleTypeSelect(['adjective'])}
                                    sx={getButtonStyle(types?.includes('adjective') || false)}
                                >
                                    Adjectives
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Stack>
            </Box>
        </Modal>
    );
}
