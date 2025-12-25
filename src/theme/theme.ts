'use client';

import { createTheme, alpha } from '@mui/material/styles';
import { Inter } from 'next/font/google';

// Typography - Inter for that clean System UI look
export const inter = Inter({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
    fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
});

export const getTheme = (mode: 'light' | 'dark') => {
    // ---- Dynamic Shapes & Radii ----
    // Using 24px-32px for that "Squircle / Round Rect" feel
    const mainRadius = 28;

    return createTheme({
        palette: {
            mode,
            background: {
                // We handle the actual gradient in CssBaseline below
                default: 'transparent',
                paper: mode === 'dark'
                    ? 'rgba(30, 30, 35, 0.7)'
                    : 'rgba(255, 255, 255, 0.65)',
            },
            primary: {
                main: '#F54EA2', // Staying with the pink brand color, or switch to iOS Blue #007AFF if strictly requested
            },
            text: {
                primary: mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
                secondary: mode === 'dark' ? 'rgba(255, 255, 255, 0.55)' : 'rgba(0, 0, 0, 0.55)',
            }
        },
        typography: {
            fontFamily: inter.style.fontFamily,
            h1: { fontWeight: 700, letterSpacing: '-0.025em' },
            h2: { fontWeight: 700, letterSpacing: '-0.025em' },
            h3: { fontWeight: 600, letterSpacing: '-0.025em' },
            h4: { fontWeight: 600, letterSpacing: '-0.025em' },
            h5: { fontWeight: 600 },
            h6: { fontWeight: 600 },
            button: { fontWeight: 600, textTransform: 'none' },
        },
        shape: {
            borderRadius: mainRadius,
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        transition: 'background 0.5s ease-in-out',
                        minHeight: '100vh',
                        backgroundAttachment: 'fixed',
                        // DYNAMIC BACKGROUNDS
                        background: mode === 'dark'
                            ? `
                                radial-gradient(at 0% 0%, rgba(245, 78, 162, 0.15) 0px, transparent 50%),
                                radial-gradient(at 100% 0%, rgba(79, 209, 197, 0.15) 0px, transparent 50%),
                                radial-gradient(at 100% 100%, rgba(245, 78, 162, 0.1) 0px, transparent 50%),
                                radial-gradient(at 0% 100%, rgba(79, 209, 197, 0.1) 0px, transparent 50%),
                                #0f0e13
                              ` // Deep Dark
                            : `
                                radial-gradient(at 0% 0%, rgba(245, 78, 162, 0.15) 0px, transparent 50%),
                                radial-gradient(at 100% 0%, rgba(79, 209, 197, 0.2) 0px, transparent 50%),
                                radial-gradient(at 100% 100%, rgba(245, 78, 162, 0.1) 0px, transparent 50%),
                                radial-gradient(at 0% 100%, rgba(79, 209, 197, 0.15) 0px, transparent 50%),
                                #F2F2F7
                              `, // Apple System Grey/White Light
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backdropFilter: 'blur(25px) saturate(180%)',
                        border: mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.08)'
                            : '1px solid rgba(255, 255, 255, 0.4)',
                        backgroundImage: 'none',
                        boxShadow: mode === 'dark'
                            ? '0 12px 40px rgba(0,0,0,0.3)'
                            : '0 12px 40px rgba(0,0,0,0.1)',
                    },
                    rounded: {
                        borderRadius: mainRadius,
                    }
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 100, // Pill shape specifically for buttons
                        padding: '10px 24px',
                        backdropFilter: 'blur(10px)',
                    },
                    contained: {
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                            transform: 'scale(1.02)',
                        }
                    }
                }
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: mainRadius * 1.5, // Larger radius for modals
                        backgroundColor: mode === 'dark'
                            ? 'rgba(30, 30, 35, 0.85)'
                            : 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(35px) saturate(180%)',
                        boxShadow: '0 40px 80px -12px rgba(0, 0, 0, 0.4)',
                    }
                }
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 16, // Squircle icon buttons
                        '&:hover': {
                            backgroundColor: mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(0, 0, 0, 0.05)',
                        }
                    }
                }
            }
        },
    });
};
