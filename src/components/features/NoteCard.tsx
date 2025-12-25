'use client';

import { Box, Typography, styled, Checkbox, Avatar, AvatarGroup, Chip } from '@mui/material';
import GlassCard from '../ui/GlassCard';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const CardContent = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 200,
    position: 'relative',
}));

const CardHeader = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const CardTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    fontSize: '1.25rem',
    marginBottom: theme.spacing(1),
    color: '#fff',
}));

const CardFooter = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: '1px solid rgba(255,255,255,0.05)',
}));

const MetaInfo = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
}));

// Gradient decoration hook or prop could go here
// For now, using inline styles for variation based on the "SyncPad" image

export default function NoteCard({ title, items, time, users, variant = 'default' }: any) {
    // Simple variant logic for demo (pink, orange, blue gradients)
    let gradientOverlay = '';
    if (variant === 'pink') {
        gradientOverlay = 'linear-gradient(135deg, rgba(245, 78, 162, 0.15) 0%, rgba(245, 78, 162, 0) 50%)';
    } else if (variant === 'cyan') {
        gradientOverlay = 'linear-gradient(135deg, rgba(79, 209, 197, 0.15) 0%, rgba(79, 209, 197, 0) 50%)';
    } else if (variant === 'orange') {
        gradientOverlay = 'linear-gradient(135deg, rgba(255, 176, 32, 0.15) 0%, rgba(255, 176, 32, 0) 50%)';
    }

    return (
        <GlassCard sx={{ position: 'relative' }}>
            {/* Subtle colorful glow overlay */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: gradientOverlay,
                pointerEvents: 'none',
                zIndex: 0,
            }} />

            <CardContent sx={{ zIndex: 1 }}>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {items?.slice(0, 3).map((item: string, i: number) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', opacity: 0.7 }} />
                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{item}</Typography>
                            </Box>
                        ))}
                    </Box>
                </CardHeader>

                <CardFooter>
                    <MetaInfo>
                        <AccessTimeIcon sx={{ fontSize: 14 }} />
                        {time}
                    </MetaInfo>

                    {users && (
                        <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 10, border: 'none' } }}>
                            {users.map((u: string, i: number) => (
                                <Avatar key={i} alt={u} src={`https://i.pravatar.cc/150?u=${u}`} />
                            ))}
                        </AvatarGroup>
                    )}
                </CardFooter>
            </CardContent>
        </GlassCard>
    );
}
