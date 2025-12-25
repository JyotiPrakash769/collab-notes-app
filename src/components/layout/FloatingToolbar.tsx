'use client';

import { Paper, ToggleButton, ToggleButtonGroup, styled, Slide, Popover, Box, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Dialog, Typography, CircularProgress } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicIcon from '@mui/icons-material/FormatItalicRounded';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlinedRounded';
import ChecklistIcon from '@mui/icons-material/CheckBoxRounded';
import ColorLensIcon from '@mui/icons-material/ColorLensRounded';
import FormatColorResetIcon from '@mui/icons-material/FormatColorResetRounded';
import ShareIcon from '@mui/icons-material/IosShareRounded';
import LinkIcon from '@mui/icons-material/LinkRounded';
import QrCodeIcon from '@mui/icons-material/QrCodeRounded';
import ImageIcon from '@mui/icons-material/ImageRounded';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdfRounded';
import TextFormatIcon from '@mui/icons-material/TextFormatRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { Editor } from '@tiptap/react';
import { useState } from 'react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ToolbarContainer = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    bottom: 40,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '6px',
    borderRadius: 32,
    background: theme.palette.mode === 'dark'
        ? 'rgba(31, 29, 43, 0.7)'
        : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(24px)',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'}`,
    boxShadow: theme.palette.mode === 'dark'
        ? '0 8px 32px rgba(0,0,0,0.4)'
        : '0 8px 32px rgba(0,0,0,0.05)',
    zIndex: 1400,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
    border: 'none',
    borderRadius: '50%',
    color: theme.palette.text.secondary,
    width: 44,
    height: 44,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&.Mui-selected': {
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(245, 78, 162, 0.15)'
            : 'rgba(245, 78, 162, 0.1)',
        '&:hover': {
            backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(245, 78, 162, 0.25)'
                : 'rgba(245, 78, 162, 0.2)',
        }
    },
    '&:hover': {
        backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.04)',
        transform: 'scale(1.1)',
        color: theme.palette.text.primary,
    }
}));

const ColorDot = styled(Box)<{ bgcolor: string }>(({ theme, bgcolor }) => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: bgcolor,
    cursor: 'pointer',
    border: '2px solid rgba(255,255,255,0.1)',
    transition: 'transform 0.2s',
    '&:hover': {
        transform: 'scale(1.2)',
        borderColor: theme.palette.primary.main,
    }
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 24,
        marginTop: 0,
        marginBottom: 12, // Position above the dock
        minWidth: 220,
        background: theme.palette.mode === 'dark'
            ? 'rgba(31, 29, 43, 0.9)'
            : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        padding: '8px',
        '& .MuiMenuItem-root': {
            borderRadius: 12,
            margin: '4px',
            '&:hover': {
                background: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
            },
        },
    },
}));

const COLORS = [
    '#F54EA2', // Pink
    '#FF7675', // Salmon
    '#FDCB6E', // Mustard
    '#55EFC4', // Teal
    '#74B9FF', // Light Blue
    '#A29BFE', // Lavender
    '#FFFFFF', // White
];

const FONTS = [
    { name: 'Default', value: 'Inter' },
    { name: 'Serif', value: 'Merriweather, serif' },
    { name: 'Monospace', value: 'JetBrains Mono, monospace' },
    { name: 'Cursive', value: 'Comic Sans MS, cursive' },
];

interface FloatingToolbarProps {
    show: boolean;
    editor?: Editor | null;
}

export default function FloatingToolbar({ show, editor }: FloatingToolbarProps) {
    const [colorAnchorEl, setColorAnchorEl] = useState<HTMLElement | null>(null);
    const [shareAnchorEl, setShareAnchorEl] = useState<HTMLElement | null>(null);
    const [inviteAnchorEl, setInviteAnchorEl] = useState<HTMLElement | null>(null);
    const [fontAnchorEl, setFontAnchorEl] = useState<HTMLElement | null>(null);

    // Dialogs
    const [qrOpen, setQrOpen] = useState(false);
    const [qrMode, setQrMode] = useState<'share' | 'invite'>('share'); // Track which QR to show

    const [linkCopied, setLinkCopied] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    if (!editor) return null;

    // --- Color Handlers ---
    const handleColorClick = (event: React.MouseEvent<HTMLElement>) => setColorAnchorEl(event.currentTarget);
    const handleColorClose = () => setColorAnchorEl(null);
    const applyColor = (color: string) => { editor.chain().focus().setColor(color).run(); handleColorClose(); };
    const handleResetColor = () => { editor.chain().focus().unsetColor().run(); handleColorClose(); };

    // --- Font Handlers ---
    const handleFontClick = (event: React.MouseEvent<HTMLElement>) => setFontAnchorEl(event.currentTarget);
    const handleFontClose = () => setFontAnchorEl(null);
    const applyFont = (fontFamily: string) => {
        editor.chain().focus().setFontFamily(fontFamily).run();
        handleFontClose();
    };

    // --- Share Handlers ---
    const handleShareClick = (event: React.MouseEvent<HTMLElement>) => setShareAnchorEl(event.currentTarget);
    const handleShareClose = () => {
        setShareAnchorEl(null);
        setLinkCopied(false);
    };

    // --- Invite Handlers ---
    const handleInviteClick = (event: React.MouseEvent<HTMLElement>) => setInviteAnchorEl(event.currentTarget);
    const handleInviteClose = () => {
        setInviteAnchorEl(null);
        setLinkCopied(false);
    };

    // Logic
    const handleCopyLink = (closeMethod: () => void) => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        navigator.clipboard.writeText(url);
        setLinkCopied(true);
        setTimeout(() => closeMethod(), 1000);
    };

    const handleShowQr = (mode: 'share' | 'invite', closeMethod: () => void) => {
        setQrMode(mode);
        setQrOpen(true);
        closeMethod();
    };

    // --- Export Handlers ---
    const handleExportImage = async () => {
        handleShareClose();
        setIsExporting(true);
        try {
            const element = document.getElementById('note-editor-content');
            if (element) {
                const canvas = await html2canvas(element, {
                    backgroundColor: '#1F1D2B',
                    scale: 2
                });
                const link = document.createElement('a');
                link.download = `colab-note-${Date.now()}.png`;
                link.href = canvas.toDataURL();
                link.click();
            }
        } catch (err) {
            console.error('Export failed', err);
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportPdf = async () => {
        handleShareClose();
        setIsExporting(true);
        try {
            const element = document.getElementById('note-editor-content');
            if (element) {
                const canvas = await html2canvas(element, {
                    backgroundColor: '#1F1D2B',
                    scale: 2
                });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });

                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`colab-note-${Date.now()}.pdf`);
            }
        } catch (err) {
            console.error('Export PDF failed', err);
        } finally {
            setIsExporting(false);
        }
    };

    const colorOpen = Boolean(colorAnchorEl);
    const shareOpen = Boolean(shareAnchorEl);
    const inviteOpen = Boolean(inviteAnchorEl);
    const fontOpen = Boolean(fontAnchorEl);

    return (
        <>
            <Slide direction="up" in={show} mountOnEnter unmountOnExit>
                <ToolbarContainer elevation={0}>
                    <ToggleButtonGroup size="small">
                        <StyledToggleButton
                            value="font"
                            selected={fontOpen}
                            onClick={handleFontClick}
                        >
                            <TextFormatIcon fontSize="small" />
                        </StyledToggleButton>

                        <StyledToggleButton
                            value="bold"
                            selected={editor.isActive('bold')}
                            onClick={() => editor.chain().focus().toggleBold().run()}
                        >
                            <FormatBoldIcon fontSize="small" />
                        </StyledToggleButton>

                        <StyledToggleButton
                            value="italic"
                            selected={editor.isActive('italic')}
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                        >
                            <FormatItalicIcon fontSize="small" />
                        </StyledToggleButton>

                        <StyledToggleButton
                            value="underline"
                            selected={editor.isActive('underline')}
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                        >
                            <FormatUnderlinedIcon fontSize="small" />
                        </StyledToggleButton>

                        <StyledToggleButton
                            value="checklist"
                            selected={editor.isActive('taskList')}
                            onClick={() => editor.chain().focus().toggleTaskList().run()}
                        >
                            <ChecklistIcon fontSize="small" />
                        </StyledToggleButton>

                        <StyledToggleButton
                            value="color"
                            selected={!!editor.getAttributes('textStyle').color}
                            onClick={handleColorClick}
                        >
                            <ColorLensIcon fontSize="small" sx={{ color: editor.getAttributes('textStyle').color || 'inherit' }} />
                        </StyledToggleButton>

                        <StyledToggleButton
                            value="invite"
                            selected={inviteOpen}
                            onClick={handleInviteClick}
                            sx={{ color: '#F54EA2' }} // Pink for invite/people
                        >
                            <PersonAddRoundedIcon fontSize="small" />
                        </StyledToggleButton>

                        <StyledToggleButton
                            value="share"
                            selected={shareOpen}
                            onClick={handleShareClick}
                        >
                            <ShareIcon fontSize="small" />
                        </StyledToggleButton>

                    </ToggleButtonGroup>
                </ToolbarContainer>
            </Slide>

            {/* Color Popover */}
            <Popover
                open={colorOpen}
                anchorEl={colorAnchorEl}
                onClose={handleColorClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                slotProps={{
                    paper: {
                        sx: {
                            p: 2,
                            background: 'rgba(31, 29, 43, 0.9)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px',
                            display: 'flex',
                            gap: 1,
                            mb: 2,
                        }
                    }
                }}
            >
                {COLORS.map((color) => (
                    <ColorDot key={color} bgcolor={color} onClick={() => applyColor(color)} />
                ))}
                <Box sx={{ width: 1, height: 32, borderLeft: '1px solid rgba(255,255,255,0.1)', mx: 0.5 }} />
                <StyledToggleButton value="reset" onClick={handleResetColor} sx={{ width: 32, height: 32, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <FormatColorResetIcon fontSize="small" />
                </StyledToggleButton>
            </Popover>

            {/* Font Menu */}
            <StyledMenu
                anchorEl={fontAnchorEl}
                open={fontOpen}
                onClose={handleFontClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                {FONTS.map((font) => (
                    <MenuItem key={font.name} onClick={() => applyFont(font.value)}>
                        <ListItemText primaryTypographyProps={{ style: { fontFamily: font.value } }}>
                            {font.name}
                        </ListItemText>
                    </MenuItem>
                ))}
            </StyledMenu>

            {/* Invite Menu */}
            <StyledMenu
                anchorEl={inviteAnchorEl}
                open={inviteOpen}
                onClose={handleInviteClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <MenuItem disabled>
                    <ListItemText primaryTypographyProps={{ variant: 'caption', color: 'primary.main', fontWeight: 700 }}>
                        INVITE FRIENDS
                    </ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleCopyLink(handleInviteClose)}>
                    <ListItemIcon>
                        <ContentCopyRoundedIcon fontSize="small" color={linkCopied ? 'success' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText>{linkCopied ? 'Invite Link Copied!' : 'Copy Invite Link'}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleShowQr('invite', handleInviteClose)}>
                    <ListItemIcon>
                        <QrCodeIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Invite via QR Code</ListItemText>
                </MenuItem>
            </StyledMenu>

            {/* Share Menu */}
            <StyledMenu
                anchorEl={shareAnchorEl}
                open={shareOpen}
                onClose={handleShareClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <MenuItem onClick={() => handleCopyLink(handleShareClose)}>
                    <ListItemIcon>
                        <LinkIcon fontSize="small" color={linkCopied ? 'success' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText>{linkCopied ? 'Link Copied!' : 'Copy Link'}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleShowQr('share', handleShareClose)}>
                    <ListItemIcon>
                        <QrCodeIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Show QR Code</ListItemText>
                </MenuItem>
                <Divider sx={{ my: 1, opacity: 0.1 }} />
                <MenuItem disabled>
                    <ListItemText primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}>
                        EXPORT OPTIONS
                    </ListItemText>
                </MenuItem>
                <MenuItem onClick={handleExportImage} disabled={isExporting}>
                    <ListItemIcon>
                        {isExporting ? <CircularProgress size={20} /> : <ImageIcon fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText>Export Image</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleExportPdf} disabled={isExporting}>
                    <ListItemIcon>
                        {isExporting ? <CircularProgress size={20} /> : <PictureAsPdfIcon fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText>Export PDF</ListItemText>
                </MenuItem>
            </StyledMenu>

            {/* QR Code Dialog */}
            <Dialog
                open={qrOpen}
                onClose={() => setQrOpen(false)}
                PaperProps={{
                    sx: {
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                    }
                }}
            >
                <Typography variant="h6" sx={{ color: '#000', fontWeight: 700 }}>
                    {qrMode === 'invite' ? 'Invite Collaborators' : 'Share Note'}
                </Typography>
                <Box sx={{ background: 'white', p: 2, borderRadius: 4 }}>
                    <QRCode value={typeof window !== 'undefined' ? window.location.href : ''} size={200} />
                </Box>
                <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                    {qrMode === 'invite'
                        ? 'Friends can scan this to join and edit.'
                        : 'Use your camera to open this note.'}
                </Typography>
            </Dialog>
        </>
    );
}
