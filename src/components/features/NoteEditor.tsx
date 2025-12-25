'use client';

import { Dialog, Box, InputBase, IconButton, styled, Button, Snackbar, Alert, Avatar, AvatarGroup, Typography, TextField, Switch, FormControlLabel, Tooltip, Stack, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/PersonRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import SaveIcon from '@mui/icons-material/SaveRounded';
import ShareIcon from '@mui/icons-material/ShareRounded';
import MoreHorizIcon from '@mui/icons-material/MoreHorizRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import FloatingToolbar from '../layout/FloatingToolbar';
import { useNotesStore } from '@/lib/store';
import { Note } from '@/lib/types';
import { useEffect, useState } from 'react';

// Tiptap Imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import FontFamily from '@tiptap/extension-font-family';

import './editor.css';

const EditorContainer = styled(Box)(({ theme }) => ({
    background: 'transparent',
    height: '100%',
    padding: theme.spacing(4, 8),
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
}));

const TitleInput = styled(InputBase)(({ theme }) => ({
    fontSize: '2.5rem',
    fontWeight: 800,
    fontFamily: 'inherit',
    marginBottom: theme.spacing(2),
    color: '#fff',
    '& input': {
        padding: 0,
    },
}));

const TiptapWrapper = styled(Box)(({ theme }) => ({
    flex: 1,
    overflowY: 'auto',
    cursor: 'text',
    fontSize: '1.1rem',
    lineHeight: 1.6,
    color: theme.palette.text.secondary,
    // Custom scrollbar
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
    },
    '& .ProseMirror': {
        outline: 'none',
        minHeight: '100%',
    }
}));

const TopActions = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(4),
}));

export default function NoteEditor({ open, onClose, note }: { open: boolean, onClose: () => void, note: Note | null }) {
    const updateNote = useNotesStore((state) => state.updateNote);
    const [localTitle, setLocalTitle] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            TextStyle,
            Color,
            Underline,
            FontFamily,
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-invert focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => {
            if (note) {
                updateNote(note.id, {
                    content: editor.getHTML(),
                    // Backwards compat for list view in card
                    items: editor.getText().split('\n').filter(line => line.trim().length > 0).slice(0, 3)
                });
            }
        },
        immediatelyRender: false,
    });

    // Sync local state when note opens
    useEffect(() => {
        if (note && editor) {
            setLocalTitle(note.title);

            // Only update content if we switched notes or editor is empty/fresh
            // We check if the current editor content matches the note to avoid wiping work-in-progress if re-render
            // But main fix is relying on note.id change mostly. 
            // For MVP simplicity: If we just switched notes (previousId !== newId), load content.
            // We can approximate this by comparing just the ID or assuming if content is vastly different.

            // Simpler approach for MVP: Just load content.
            // But we must guard against the loop.
            // The loop happens because onUpdate updates 'note', which triggers this effect.

            // Fix: Check if content is different.
            const currentHTML = editor.getHTML();
            if (note.content && currentHTML !== note.content) {
                // Check if it's REALLY different (Tiptap sometimes changes attributes order)
                // Or better: ONLY update if the note ID changed (tracked via ref or just separate effect).
            }
        }
    }, [note?.id, editor]); // Removed note.content from dependency array to break loop

    // Separate effect for initial load of content based on ID changes
    useEffect(() => {
        if (note && editor) {
            if (note.content) {
                editor.commands.setContent(note.content);
            } else if (note.items.length > 0) {
                editor.commands.setContent(note.items.join('<br>'));
            } else {
                editor.commands.clearContent();
            }
        }
    }, [note?.id, editor]);


    const [saveOpen, setSaveOpen] = useState(false);
    const [nameDialogOpen, setNameDialogOpen] = useState(false);
    const [codeDialogOpen, setCodeDialogOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [userNameInput, setUserNameInput] = useState('');
    const [codeInput, setCodeInput] = useState('');
    const [codeError, setCodeError] = useState(false);
    const [accessGranted, setAccessGranted] = useState(false);

    const isOwner = note && userName && note.owner === userName;

    // Initial User Check & Ownership Claim
    useEffect(() => {
        if (typeof window !== 'undefined' && note) {
            const storedName = localStorage.getItem('colab-user-name');

            if (storedName) {
                setUserName(storedName);

                // Claim ownership if none exists
                if (!note.owner) {
                    updateNote(note.id, { owner: storedName });
                }

                // If we are the owner, access is granted immediately
                if (note.owner === storedName || !note.owner) {
                    setAccessGranted(true);
                } else {
                    // We are a guest
                    // Check if already verified in this session (simplified)
                    // For now, require code if "Open"
                    if (note.isCollaborationOpen) {
                        setAccessGranted(false);
                        setCodeDialogOpen(true);
                    } else {
                        // Closed/Private
                        setAccessGranted(false);
                    }
                }

                // Add to users list if not present
                if (!note.users?.includes(storedName)) {
                    const newUsers = [...(note.users || []), storedName];
                    updateNote(note.id, { users: newUsers });
                }
            } else {
                setNameDialogOpen(true);
            }
        }
    }, [open, note?.id]); // Check when dialog opens or note changes

    // Watch for collaboration state changes (for guests)
    useEffect(() => {
        // Only run logic if there IS an owner and it's not us. 
        // If note.owner is missing, the previous effect handles claiming it.
        if (note && userName && note.owner && note.owner !== userName) {
            if (note.isCollaborationOpen && !accessGranted) {
                setCodeDialogOpen(true);
            } else if (!note.isCollaborationOpen) {
                setAccessGranted(false); // Revoke access if closed
                setCodeDialogOpen(false);
            }
        }
    }, [note?.isCollaborationOpen, userName, accessGranted, note?.owner]);


    const handleSaveName = () => {
        if (userNameInput.trim() && note) {
            const name = userNameInput.trim();
            localStorage.setItem('colab-user-name', name);
            setUserName(name);
            setNameDialogOpen(false);

            // Logic repeats here to ensure seamless flow
            if (!note.owner) {
                updateNote(note.id, { owner: name });
                setAccessGranted(true);
            } else if (note.owner === name) {
                setAccessGranted(true);
            } else {
                // Guest
                if (note.isCollaborationOpen) {
                    setCodeDialogOpen(true);
                }
            }

            if (!note.users?.includes(name)) {
                const newUsers = [...(note.users || []), name];
                updateNote(note.id, { users: newUsers });
            }
        }
    };

    const handleVerifyCode = () => {
        if (note && note.accessCode === codeInput) {
            setAccessGranted(true);
            setCodeDialogOpen(false);
            setCodeError(false);
        } else {
            setCodeError(true);
        }
    };

    const handleToggleCollaboration = () => {
        if (note && isOwner) {
            const willBeOpen = !note.isCollaborationOpen;
            let code = note.accessCode;

            if (willBeOpen && !code) {
                code = Math.floor(1000 + Math.random() * 9000).toString();
            }

            updateNote(note.id, {
                isCollaborationOpen: willBeOpen,
                accessCode: code
            });
        }
    };


    const handleSave = () => {
        if (note) {
            updateNote(note.id, {
                title: localTitle,
            });
            setSaveOpen(true);
        }
    };

    if (!note) return null;

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setLocalTitle(newTitle);
        updateNote(note.id, { title: newTitle });
    };

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    background: 'rgba(30, 30, 35, 0.65)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    backgroundImage: 'none'
                }
            }}
        >
            <EditorContainer>
                <TopActions>
                    {isOwner && (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 'auto', background: 'rgba(255,255,255,0.05)', py: 0.5, px: 2, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={!!note.isCollaborationOpen}
                                        onChange={handleToggleCollaboration}
                                        size="small"
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#F54EA2' },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#F54EA2' }
                                        }}
                                    />
                                }
                                label={
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        {note.isCollaborationOpen ? <LockOpenRoundedIcon sx={{ fontSize: 16 }} /> : <LockRoundedIcon sx={{ fontSize: 16 }} />}
                                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                                            {note.isCollaborationOpen ? 'Collaborating' : 'Private'}
                                        </Typography>
                                    </Stack>
                                }
                            />
                            {note.isCollaborationOpen && note.accessCode && (
                                <Tooltip title="Share this code with guests">
                                    <Chip
                                        icon={<KeyRoundedIcon style={{ fontSize: 14, color: '#F54EA2' }} />}
                                        label={note.accessCode}
                                        size="small"
                                        sx={{
                                            height: 24,
                                            background: 'rgba(245, 78, 162, 0.15)',
                                            color: '#F54EA2',
                                            fontWeight: 700,
                                            border: '1px solid rgba(245, 78, 162, 0.3)',
                                            '& .MuiChip-label': { px: 1 }
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </Stack>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 'auto', background: 'rgba(255,255,255,0.03)', px: 2, py: 0.5, borderRadius: 12 }}>
                        {/* Live Indicator */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                                width: 8, height: 8, borderRadius: '50%', background: '#4FD1C5',
                                boxShadow: '0 0 10px #4FD1C5',
                                animation: 'pulse-live 2s infinite',
                                '@keyframes pulse-live': {
                                    '0%': { transform: 'scale(1)', opacity: 1 },
                                    '50%': { transform: 'scale(1.5)', opacity: 0.5 },
                                    '100%': { transform: 'scale(1)', opacity: 1 }
                                }
                            }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#4FD1C5', letterSpacing: 1 }}>LIVE</Typography>
                        </Box>

                        <Box sx={{ width: 1, height: 20, bgcolor: 'rgba(255,255,255,0.1)' }} />

                        {note.users && note.users.length > 0 && (
                            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.8rem', border: '2px solid #1E1E1E' } }}>
                                {note.users.map((u, i) => (
                                    <Tooltip key={i} title={u === userName ? `${u} (You)` : u}>
                                        <Avatar sx={{ bgcolor: i % 2 === 0 ? '#F54EA2' : '#4FD1C5', fontWeight: 700 }}>
                                            {u.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </Tooltip>
                                ))}
                            </AvatarGroup>
                        )}
                    </Box>

                    <Button
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        sx={{
                            mr: 1,
                            borderRadius: 20,
                            padding: '6px 16px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.2)',
                                borderColor: 'rgba(255,255,255,0.3)'
                            }
                        }}
                    >
                        Save Note
                    </Button>
                    <IconButton onClick={onClose} sx={{ color: '#fff', background: 'rgba(255,255,255,0.1)' }}>
                        <CloseIcon />
                    </IconButton>
                </TopActions>

                {!accessGranted && !nameDialogOpen && (
                    <Box sx={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 10, background: 'rgba(30,30,35,0.85)', backdropFilter: 'blur(10px)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <LockRoundedIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                            {note.isCollaborationOpen ? 'Protected Note' : 'Private Note'}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: 400, textAlign: 'center' }}>
                            {note.isCollaborationOpen
                                ? 'This note requires a 4-digit access code to view.'
                                : 'This note is currently closed for collaboration by the owner.'}
                        </Typography>
                        {note.isCollaborationOpen && (
                            <Button
                                variant="outlined"
                                color="secondary"
                                sx={{ mt: 3, borderRadius: 4 }}
                                onClick={() => setCodeDialogOpen(true)}
                            >
                                Enter Code
                            </Button>
                        )}
                    </Box>
                )}

                <TitleInput
                    placeholder={accessGranted ? "Untitled" : "Locked"}
                    value={localTitle}
                    onChange={handleTitleChange}
                    multiline
                    readOnly={!accessGranted}
                />

                <TiptapWrapper id="note-editor-content" onClick={() => accessGranted && editor?.commands.focus()}>
                    <EditorContent editor={editor} />
                </TiptapWrapper>

                <FloatingToolbar editor={editor} show={accessGranted} />
            </EditorContainer>

            <Snackbar
                open={saveOpen}
                autoHideDuration={2000}
                onClose={() => setSaveOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSaveOpen(false)}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%', borderRadius: 4, fontWeight: 600 }}
                >
                    Note Saved Successfully!
                </Alert>
            </Snackbar>
            {/* Name Entry Dialog */}
            <Dialog
                open={nameDialogOpen}
                onClose={() => { }} // Force user to enter name
                PaperProps={{
                    sx: {
                        p: 4,
                        borderRadius: '24px',
                        background: 'rgba(30,30,35,0.95)',
                        backdropFilter: 'blur(20px)',
                        width: '100%',
                        maxWidth: 400,
                        border: '1px solid rgba(245, 78, 162, 0.3)', // Pink glow for name
                        boxShadow: '0 0 30px rgba(245, 78, 162, 0.2)',
                        animation: 'pulse-glow-pink 3s infinite',
                        '@keyframes pulse-glow-pink': {
                            '0%': { boxShadow: '0 0 20px rgba(245, 78, 162, 0.2), 0 0 0 1px rgba(245, 78, 162, 0.3)' },
                            '50%': { boxShadow: '0 0 35px rgba(245, 78, 162, 0.5), 0 0 0 1px rgba(245, 78, 162, 0.6)' },
                            '100%': { boxShadow: '0 0 20px rgba(245, 78, 162, 0.2), 0 0 0 1px rgba(245, 78, 162, 0.3)' }
                        }
                    }
                }}
            >
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: 'white' }}>Welcome!</Typography>
                <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255,255,255,0.7)' }}>
                    Enter your name to join this collaborative session.
                </Typography>
                <TextField
                    fullWidth
                    placeholder="Your Name"
                    value={userNameInput}
                    onChange={(e) => setUserNameInput(e.target.value)}
                    sx={{
                        mb: 3,
                        '& .MuiInputBase-root': { color: 'white', background: 'rgba(255,255,255,0.05)', borderRadius: 2 }
                    }}
                />
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSaveName}
                    disabled={!userNameInput.trim()}
                    sx={{ borderRadius: 3, py: 1.5, background: '#F54EA2', '&:hover': { background: '#F54EA2' } }}
                >
                    Join Session
                </Button>
            </Dialog>

            {/* Secret Code Dialog */}
            <Dialog
                open={codeDialogOpen}
                // Allow close if they just want to leave? No, they should either enter or close the whole note.
                onClose={() => setCodeDialogOpen(false)}
                PaperProps={{
                    sx: {
                        p: 4,
                        borderRadius: '24px',
                        background: 'rgba(30,30,35,0.95)',
                        backdropFilter: 'blur(20px)',
                        width: '100%',
                        maxWidth: 400,
                        textAlign: 'center',
                        border: '1px solid rgba(245, 78, 162, 0.3)',
                        boxShadow: '0 0 30px rgba(245, 78, 162, 0.2)',
                        animation: 'pulse-glow-pink 3s infinite'
                    }
                }}
            >
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ p: 2, borderRadius: '50%', background: 'rgba(245, 78, 162, 0.1)' }}>
                        <KeyRoundedIcon sx={{ fontSize: 32, color: '#F54EA2' }} />
                    </Box>
                </Box>

                <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: 'white' }}>Enter Access Code</Typography>
                <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255,255,255,0.7)' }}>
                    The owner has protected this note. Please enter the 4-digit code.
                </Typography>

                <TextField
                    fullWidth
                    placeholder="0000"
                    value={codeInput}
                    onChange={(e) => {
                        if (e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) {
                            setCodeInput(e.target.value);
                            setCodeError(false);
                        }
                    }}
                    error={codeError}
                    helperText={codeError ? "Incorrect code" : ""}
                    inputProps={{ style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: 700 } }}
                    sx={{
                        mb: 3,
                        '& .MuiInputBase-root': { color: 'white', background: 'rgba(255,255,255,0.05)', borderRadius: 2 }
                    }}
                />
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleVerifyCode}
                    disabled={codeInput.length !== 4}
                    sx={{ borderRadius: 3, py: 1.5, background: '#F54EA2', '&:hover': { background: '#F54EA2' } }}
                >
                    Access Note
                </Button>
            </Dialog>

        </Dialog>
    );
}
