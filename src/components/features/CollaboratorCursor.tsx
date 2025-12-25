'use client';

import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import NavigationIcon from '@mui/icons-material/Navigation';

interface CollaboratorCursorProps {
    name: string;
    color: string;
    x: number;
    y: number;
}

export default function CollaboratorCursor({ name, color, x, y }: CollaboratorCursorProps) {
    return (
        <motion.div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 9999,
                pointerEvents: 'none',
            }}
            animate={{ x, y }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        >
            <NavigationIcon sx={{ color: color, transform: 'rotate(135deg)', fontSize: 20 }} />
            <Box
                sx={{
                    background: color,
                    padding: '2px 8px',
                    borderRadius: 4,
                    marginLeft: 2,
                }}
            >
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700 }}>
                    {name}
                </Typography>
            </Box>
        </motion.div>
    );
}
