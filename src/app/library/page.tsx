'use client';

import { Box, Typography, Grid, Button, styled, IconButton } from '@mui/material';
import MainLayout from '@/components/layout/MainLayout';
import NoteCard from '@/components/features/NoteCard';
import { useNotesStore } from '@/lib/store';
import { Note } from '@/lib/types';
import { useRouter } from 'next/navigation';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const LibraryContainer = styled(Box)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
}));

export default function LibraryPage() {
    const { notes, deleteNote, syncNotes } = useNotesStore();
    const router = useRouter();
    const [deleteMode, setDeleteMode] = useState(false);

    // Sync to ensure we list correct notes
    useEffect(() => {
        syncNotes();
    }, []);

    const handleOpenNote = (note: Note) => {
        if (deleteMode) return; // Prevent opening when deleting
        router.push(`/?note=${note.id}`);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this note?')) {
            await deleteNote(id);
        }
    };

    return (
        <MainLayout>
            <LibraryContainer>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            onClick={() => router.push('/')}
                            sx={{
                                background: 'rgba(255,255,255,0.1)',
                                color: 'text.primary',
                                '&:hover': { background: 'rgba(255,255,255,0.2)' }
                            }}
                        >
                            <ArrowBackRoundedIcon />
                        </IconButton>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            Your Library
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        onClick={() => setDeleteMode(!deleteMode)}
                        startIcon={deleteMode ? <DeleteRoundedIcon /> : <EditRoundedIcon />}
                        sx={{
                            borderRadius: 4,
                            borderColor: deleteMode ? '#FF5252' : 'rgba(255,255,255,0.2)',
                            color: deleteMode ? '#FF5252' : 'text.primary',
                            background: deleteMode ? 'rgba(255, 82, 82, 0.1)' : 'transparent',
                            boxShadow: deleteMode ? '0 0 15px rgba(255, 82, 82, 0.4)' : 'none',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                background: deleteMode ? 'rgba(255, 82, 82, 0.2)' : 'rgba(255,255,255,0.05)',
                                borderColor: deleteMode ? '#FF5252' : 'text.primary',
                            }
                        }}
                    >
                        {deleteMode ? 'Done' : 'Manage'}
                    </Button>
                </Box>

                {notes.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10, opacity: 0.5 }}>
                        <Typography variant="h6">No notes yet.</Typography>
                        <Typography variant="body2">Go back home to create one!</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3} component={motion.div} initial="hidden" animate="visible" variants={{
                        visible: { transition: { staggerChildren: 0.1 } }
                    }}>
                        {notes.map((note) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={note.id}>
                                <motion.div variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
                                }} style={{ height: '100%', position: 'relative' }}>

                                    {/* Shake animation if in delete mode */}
                                    <Box
                                        onClick={() => handleOpenNote(note)}
                                        sx={{
                                            cursor: deleteMode ? 'default' : 'pointer',
                                            height: '100%',
                                            animation: deleteMode ? 'shake 0.5s infinite' : 'none',
                                            '@keyframes shake': {
                                                '0%': { transform: 'rotate(0deg)' },
                                                '25%': { transform: 'rotate(0.5deg)' },
                                                '75%': { transform: 'rotate(-0.5deg)' },
                                                '100%': { transform: 'rotate(0deg)' }
                                            }
                                        }}
                                    >
                                        <NoteCard
                                            title={note.title || 'Untitled Note'}
                                            items={note.items}
                                            time={note.time}
                                            users={note.users}
                                            variant={note.variant}
                                        />
                                    </Box>

                                    {deleteMode && (
                                        <IconButton
                                            onClick={(e) => handleDelete(e, note.id)}
                                            sx={{
                                                position: 'absolute',
                                                top: -10,
                                                right: -10,
                                                background: '#FF5252',
                                                color: 'white',
                                                boxShadow: '0 4px 12px rgba(255, 82, 82, 0.5)',
                                                zIndex: 10,
                                                '&:hover': {
                                                    background: '#FF1744',
                                                    transform: 'scale(1.1)'
                                                }
                                            }}
                                        >
                                            <RemoveCircleRoundedIcon />
                                        </IconButton>
                                    )}
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </LibraryContainer>
        </MainLayout>
    );
}
