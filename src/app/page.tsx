'use client';

import { Box, Typography, Grid, Button, styled, keyframes, Dialog, TextField } from '@mui/material';
import MainLayout from '@/components/layout/MainLayout';
import NoteCard from '@/components/features/NoteCard';
import NoteEditor from '@/components/features/NoteEditor';
import { useState, useEffect, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNotesStore } from '@/lib/store';
import { Note } from '@/lib/types';
import { useSearchParams, useRouter } from 'next/navigation';
import NoteAddRoundedIcon from '@mui/icons-material/NoteAddRounded';
import CreateNewFolderRoundedIcon from '@mui/icons-material/CreateNewFolderRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import ConnectWithoutContactRoundedIcon from '@mui/icons-material/ConnectWithoutContactRounded';
import AddIcon from '@mui/icons-material/AddRounded';

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shine = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const HeroContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  textAlign: 'center',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: theme.typography.h1.fontFamily,
  fontWeight: 900,
  fontSize: '5rem',
  background: 'linear-gradient(135deg, #F54EA2 0%, #4FD1C5 50%, #F54EA2 100%)',
  backgroundSize: '200% 200%',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: `${shine} 8s ease-in-out infinite`,
  filter: 'drop-shadow(0 0 20px rgba(245, 78, 162, 0.3))',
  [theme.breakpoints.down('sm')]: {
    fontSize: '3rem',
  },
}));

const Tagline = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  color: theme.palette.text.secondary,
  maxWidth: 600,
  lineHeight: 1.6,
  marginBottom: theme.spacing(4),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: '16px 32px',
  fontSize: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  height: 'auto',
  minWidth: 160,
  background: theme.palette.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)'}`,
  color: theme.palette.text.primary,
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': {
    transform: 'translateY(-5px)',
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(255, 255, 255, 0.6)',
    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
    borderColor: theme.palette.primary.main,
  },
}));

const FloatingText = styled(motion.div)(({ theme }) => ({
  display: 'inline-block',
  fontFamily: theme.typography.h1.fontFamily,
  fontWeight: 900,
  fontSize: '14vw', // Responsive base size
  lineHeight: 0.9,
  background: 'linear-gradient(135deg, #F54EA2 0%, #4FD1C5 50%, #F54EA2 100%)',
  backgroundSize: '200% 200%',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: `${shine} 8s ease-in-out infinite`,
  filter: 'drop-shadow(0 0 30px rgba(245, 78, 162, 0.4))',
  [theme.breakpoints.up('md')]: {
    fontSize: '12vw', // Adjust for wider screens
  },
  [theme.breakpoints.up('xl')]: {
    fontSize: '10rem', // Cap at some point for ultra-wide
  },
}));

function HomeContent() {
  const { notes, addNote, fetchNote, syncNotes } = useNotesStore();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Scroll Animation Hooks
  const { scrollY } = useScroll();

  // 1. Text Split - Fly COMPLETELY off screen (using vw to ensure it clears any device)
  // Range increased to 0-600 for a longer initial phase
  const xLeft = useTransform(scrollY, [0, 600], ['0vw', '-150vw']);
  const xRight = useTransform(scrollY, [0, 600], ['0vw', '150vw']);

  // 2. Description Reveal (Mid-scroll: 400 -> 800)
  const descOpacity = useTransform(scrollY, [400, 600, 800, 1000], [0, 1, 1, 0]); // Fade in then out
  const descY = useTransform(scrollY, [400, 600], [100, 0]);

  // 3. Options Reveal (Last phase: 900 -> 1200)
  const opacity = useTransform(scrollY, [900, 1200], [0, 1]);
  const yButtons = useTransform(scrollY, [900, 1200], [100, 0]);
  const scaleButtons = useTransform(scrollY, [900, 1200], [0.8, 1]);

  // Initial hint fades out immediately
  const uniqueTaglineOpacity = useTransform(scrollY, [0, 150], [1, 0]);

  // Sync with backend on load
  useEffect(() => {
    syncNotes();
  }, []); // Run once on mount

  // Sync selection with URL and fetch if missing
  useEffect(() => {
    const noteId = searchParams.get('note');
    if (noteId) {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        setSelectedNote(note);
      } else {
        fetchNote(noteId);
      }
    } else {
      setSelectedNote(null);
    }
  }, [searchParams, notes]);

  const handleOpenNote = (note: Note) => {
    router.push(`/?note=${note.id}`);
  };

  const handleCreatedNewNote = async () => {
    const owner = typeof window !== 'undefined' ? localStorage.getItem('colab-user-name') : undefined;
    const id = await addNote(owner || undefined);
    router.push(`/?note=${id}`);
  };

  const handleCloseNote = () => {
    router.push('/');
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
    <MainLayout>
      {/* Scrollable Container - Significantly Increased for Long Scroll */}
      <Box sx={{ height: '350vh', position: 'relative' }}>
        <Box sx={{ position: 'sticky', top: 80, height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

          {/* 1. Splitting Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FloatingText style={{ x: xLeft }} sx={{ mr: 2 }}>Colab</FloatingText>
            <FloatingText style={{ x: xRight }}>Note</FloatingText>
          </Box>

          {/* Scroll Hint (Fades out) */}
          <motion.div style={{ opacity: uniqueTaglineOpacity, textAlign: 'center', position: 'absolute', bottom: '10%' }}>
            <Typography variant="body2" sx={{ opacity: 0.5, letterSpacing: 2 }}>SCROLL TO EXPLORE</Typography>
          </motion.div>

          {/* 2. Description (Longer, Richer) */}
          <motion.div style={{ opacity: descOpacity, y: descY, textAlign: 'center', maxWidth: 800, padding: '0 20px', position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 3, background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Sync. Create. Collaborate.
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', lineHeight: 1.6, fontWeight: 400, mb: 2 }}>
              The world is moving fast. Your notes should too.<br />
              Experience a workspace that adapts to your speed of thought.
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: 600, mx: 'auto' }}>
              Real-time synchronization across all your devices.<br />
              Secure, private, and beautifully designed for focus.
            </Typography>
          </motion.div>

          {/* 3. Revealed Actions (Fades in last) */}
          <motion.div style={{ opacity, y: yButtons, scale: scaleButtons, display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center', width: '100%', position: 'absolute', zIndex: 10 }}>

            {/* Instructional Steps - Replaces Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', textAlign: 'center', maxWidth: 600 }}>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="h6" sx={{ color: '#F54EA2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>
                  Step 1: Create
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Tap the <b>New Note (+)</b> button in the top right to start a fresh canvas.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="h6" sx={{ color: '#4FD1C5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>
                  Step 2: Share
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Toggle <b>Collaboration</b> inside any note to get a shareable code.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="h6" sx={{ color: '#FDCB6E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>
                  Step 3: Join
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Friends can enter the code via <b>Join Session</b> in the top bar.
                </Typography>
              </Box>

            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* Library Section Removed - moved to /library */}


      <NoteEditor
        open={!!selectedNote}
        onClose={handleCloseNote}
        note={selectedNote}
      />

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
    </MainLayout>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
