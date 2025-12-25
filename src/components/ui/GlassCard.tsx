'use client';

import { Paper, PaperProps, styled } from '@mui/material';

const StyledGlassCard = styled(Paper)(({ theme }) => ({
    // More "Liquid" look - dynamic gradients and sheen
    background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 100%)',
    backdropFilter: 'blur(20px) saturate(180%)',
    // Ultra-thin bright border on top/left to simulate light source
    border: 'none', // Reset defaults
    boxShadow: theme.palette.mode === 'dark'
        ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 8px 32px 0 rgba(0, 0, 0, 0.3)'
        : 'inset 0 1px 0 0 rgba(255, 255, 255, 0.4), 0 8px 32px 0 rgba(31, 38, 135, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', // Smooth iOS spring-like ease
    overflow: 'hidden',
    position: 'relative',

    // Glossy reflection overlay
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
        opacity: 0.5,
        pointerEvents: 'none',
    },

    '&:hover': {
        transform: 'translateY(-4px) scale(1.02)',
        boxShadow: theme.palette.mode === 'dark'
            ? '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)'
            : '0 20px 40px rgba(31,38,135,0.15), inset 0 1px 0 0 rgba(255,255,255,0.6)',
    },
}));

export default function GlassCard(props: PaperProps) {
    return <StyledGlassCard elevation={0} {...props} />;
}
