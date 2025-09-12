"use client";

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import { muiTheme } from '@/lib/theme';
import createEmotionCache from '@/lib/emotion';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MuiProviderProps {
  children: React.ReactNode;
}

export default function MuiProvider({ children }: MuiProviderProps) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={muiTheme}>
        {/* Temporarily disable CssBaseline to fix hydration issues */}
        {/* <CssBaseline enableColorScheme /> */}
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
