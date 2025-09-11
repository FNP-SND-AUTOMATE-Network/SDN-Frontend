import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#61B4E8',
      light: '#A9D5EE',
      dark: '#0284C7',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#A9D5EE',
      light: '#F0F9FF',
      dark: '#718096',
      contrastText: '#1A202C',
    },
    success: {
      main: '#22C55E',
      light: '#86EFAC',
      dark: '#16A34A',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444',
      light: '#FCA5A5',
      dark: '#DC2626',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F78A04',
      light: '#FCD34D',
      dark: '#D97706',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#61B4E8',
      light: '#BAE6FD',
      dark: '#0369A1',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A202C',
      secondary: '#718096',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      'SF Pro Display',
      'SF Pro Text',
      'system-ui',
      'Helvetica Neue',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      fontWeight: 600,
    },
    body1: {
      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    },
    body2: {
      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    },
    button: {
      fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          fontWeight: 500,
        },
      },
    },
  },
});
