'use client';

import { Paper, BottomNavigation, BottomNavigationAction, styled, useMediaQuery } from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import FolderIcon from '@mui/icons-material/FolderRounded';
import StarIcon from '@mui/icons-material/StarRounded';
import LightModeIcon from '@mui/icons-material/LightModeRounded';
import DarkModeIcon from '@mui/icons-material/DarkModeRounded';
import { useState, useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '@/theme/ThemeRegistry';

const DockContainer = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    bottom: 32,
    left: '50%',
    transform: 'translateX(-50%)',
    borderRadius: 40,
    padding: '6px 12px',
    background: theme.palette.mode === 'dark'
        ? 'rgba(31, 29, 43, 0.7)'
        : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(24px)',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'}`,
    boxShadow: theme.palette.mode === 'dark'
        ? '0 12px 40px rgba(0,0,0,0.4)'
        : '0 12px 40px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    zIndex: 1300,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    width: 'auto',
    maxWidth: '90vw',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateX(-50%) translateY(-2px)',
        boxShadow: theme.palette.mode === 'dark'
            ? '0 16px 48px rgba(0,0,0,0.5)'
            : '0 16px 48px rgba(0,0,0,0.08)',
    },
    [theme.breakpoints.up('md')]: {
        padding: '8px 16px',
    }
}));

const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
    background: 'transparent',
    height: 'auto',
    minHeight: 64,
    gap: 8,
    '& .MuiBottomNavigationAction-root': {
        color: theme.palette.text.secondary,
        padding: '8px 16px',
        minWidth: 'auto',
        borderRadius: 24,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        gap: 6,
        '&.Mui-selected': {
            color: theme.palette.primary.main,
            background: theme.palette.mode === 'dark'
                ? 'rgba(245, 78, 162, 0.15)'
                : 'rgba(245, 78, 162, 0.1)',
            boxShadow: `0 0 20px ${theme.palette.mode === 'dark' ? 'rgba(245, 78, 162, 0.2)' : 'rgba(245, 78, 162, 0.1)'}`,
            '& .MuiSvgIcon-root': {
                color: theme.palette.primary.main,
                transform: 'scale(1.1)',
                filter: 'drop-shadow(0 0 8px rgba(245, 78, 162, 0.4))',
            }
        },
        '&:hover': {
            background: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.04)',
            transform: 'translateY(-2px)',
            color: theme.palette.text.primary,
        }
    },
    '& .MuiBottomNavigationAction-label': {
        fontSize: '0.875rem',
        fontWeight: 600,
        fontFamily: theme.typography.fontFamily,
        '&.Mui-selected': {
            fontSize: '0.875rem',
        }
    },
    '& .MuiSvgIcon-root': {
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '1.75rem',
    }
}));

export default function BottomDock() {
    const [value, setValue] = useState(0);
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const colorMode = useContext(ColorModeContext);

    return (
        <DockContainer elevation={0}>
            <StyledBottomNavigation
                showLabels={isDesktop}
                value={value}
                onChange={(event, newValue) => {
                    if (newValue !== 'theme-toggle') {
                        setValue(newValue);
                    }
                }}
            >
                <BottomNavigationAction label="Notes" icon={<DashboardIcon />} />
                <BottomNavigationAction label="Starred" icon={<StarIcon />} />
                <BottomNavigationAction label="Folders" icon={<FolderIcon />} />

                <BottomNavigationAction
                    value="theme-toggle"
                    label={theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    icon={theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    onClick={colorMode.toggleColorMode}
                />
            </StyledBottomNavigation>
        </DockContainer>
    );
}
