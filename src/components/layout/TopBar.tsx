'use client';

import { Box, IconButton, InputBase, styled, Button, Dialog, Typography, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/SearchRounded';
import AddIcon from '@mui/icons-material/AddRounded';
import NotificationsIcon from '@mui/icons-material/NotificationsNoneRounded';
import ConnectWithoutContactRoundedIcon from '@mui/icons-material/ConnectWithoutContactRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import { useNotesStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TopBarContainer = styled(Box)(({ theme }) => ({
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 4),
    position: 'fixed',
    top: 0,
    right: 0,
    left: 0, // Full width now
    zIndex: 1100,
    background: 'transparent',
    backdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'}`,
}));

const SearchBar = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: '8px 16px',
    width: 400,
    border: '1px solid rgba(255, 255, 255, 0.05)',
    '&:focus-within': {
        background: 'rgba(255, 255, 255, 0.1)',
        border: `1px solid ${theme.palette.primary.main}`,
    },
}));

export default function TopBar() {
    const addNote = useNotesStore((state) => state.addNote);
    const router = useRouter();
    const [joinDialogOpen, setJoinDialogOpen] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const handleNewNote = async () => {
        const owner = typeof window !== 'undefined' ? localStorage.getItem('colab-user-name') : undefined;
        const id = await addNote(owner || undefined);
        router.push(`/?note=${id}`);
    };

    const handleJoinByCode = async () => {
        if (!joinCode || joinCode.length < 4) return;
        setIsJoining(true);
        setJoinError('');

        try {
            const res = await fetch(`/api/notes/lookup?code=${joinCode}`);
            const data = await res.json();

            if (res.ok && data.id) {
                setJoinDialogOpen(false);
                setJoinCode('');
                router.push(`/?note=${data.id}`);
            } else {
                setJoinError('Session not found or closed.');
            }
        } catch (e) {
            setJoinError('Failed to connect.');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <TopBarContainer>
            <SearchBar>
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <InputBase
                    placeholder="Search notes..."
                    fullWidth
                    sx={{ color: 'text.primary' }}
                />
            </SearchBar>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => router.push('/library')} sx={{ color: 'text.secondary', p: 1.5, '&:hover': { background: 'rgba(255,255,255,0.1)' } }}>
                    <FolderOpenRoundedIcon />
                </IconButton>
                <Button
                    startIcon={<ConnectWithoutContactRoundedIcon />}
                    onClick={() => setJoinDialogOpen(true)}
                    sx={{
                        color: 'text.secondary',
                        borderRadius: 4,
                        px: 2,
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        '&:hover': { background: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    Join Session
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleNewNote}
                >
                    New Note
                </Button>
            </Box>

            <Dialog
                open={joinDialogOpen}
                onClose={() => setJoinDialogOpen(false)}
                PaperProps={{
                    sx: {
                        p: 4,
                        borderRadius: '24px', // Rounded rectangle
                        background: 'rgba(30,30,35,0.95)',
                        backdropFilter: 'blur(20px)',
                        width: '100%',
                        maxWidth: 400,
                        textAlign: 'center',
                        border: '1px solid rgba(79, 209, 197, 0.3)',
                        boxShadow: '0 0 30px rgba(79, 209, 197, 0.2)',
                        animation: 'pulse-glow 3s infinite',
                        '@keyframes pulse-glow': {
                            '0%': { boxShadow: '0 0 20px rgba(79, 209, 197, 0.2), 0 0 0 1px rgba(79, 209, 197, 0.3)' },
                            '50%': { boxShadow: '0 0 35px rgba(79, 209, 197, 0.5), 0 0 0 1px rgba(79, 209, 197, 0.6)' },
                            '100%': { boxShadow: '0 0 20px rgba(79, 209, 197, 0.2), 0 0 0 1px rgba(79, 209, 197, 0.3)' }
                        }
                    }
                }}
            >
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: 'white' }}>Join Session</Typography>
                <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255,255,255,0.7)' }}>
                    Enter the 4-digit code provided by the host.
                </Typography>

                <TextField
                    fullWidth
                    placeholder="0000"
                    value={joinCode}
                    onChange={(e) => {
                        if (e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) {
                            setJoinCode(e.target.value);
                            setJoinError('');
                        }
                    }}
                    error={!!joinError}
                    helperText={joinError}
                    inputProps={{ style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: 700 } }}
                    sx={{
                        mb: 3,
                        '& .MuiInputBase-root': { color: 'white', background: 'rgba(255,255,255,0.05)', borderRadius: 2 }
                    }}
                />

                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleJoinByCode}
                    disabled={joinCode.length !== 4 || isJoining}
                    sx={{ borderRadius: 3, py: 1.5, background: '#4FD1C5', '&:hover': { background: '#38B2AC' } }}
                >
                    {isJoining ? 'Connecting...' : 'Join Now'}
                </Button>
            </Dialog>
        </TopBarContainer>
    );
}
