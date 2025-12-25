'use client';

import { Box, styled } from '@mui/material';
import TopBar from './TopBar';
import { motion, AnimatePresence } from 'framer-motion';

const MainContent = styled(motion.div)(({ theme }) => ({ // Changed to motion.div
    marginLeft: 0,
    marginTop: 80, // TopBar height
    padding: theme.spacing(4),
    paddingBottom: 120, // Space for Bottom Dock
    minHeight: 'calc(100vh - 80px)',
    width: '100%',
    maxWidth: 1200,
    margin: '0 auto',
}));

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', bgcolor: 'background.default' }}>
            <TopBar />
            <AnimatePresence mode="wait">
                <MainContent
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                >
                    {children}
                </MainContent>
            </AnimatePresence>
        </Box>
    );
}
