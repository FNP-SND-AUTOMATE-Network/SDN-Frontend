'use client';

import { useState } from 'react';

export type AlertColor = 'success' | 'info' | 'warning' | 'error';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
  title?: string;
}

export const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info'
  });

  const showSnackbar = (
    severity: AlertColor, 
    message: string, 
    title?: string
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
      title
    });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const showSuccess = (message: string, title?: string) => {
    showSnackbar('success', message, title);
  };

  const showError = (message: string, title?: string) => {
    showSnackbar('error', message, title);
  };

  const showWarning = (message: string, title?: string) => {
    showSnackbar('warning', message, title);
  };

  const showInfo = (message: string, title?: string) => {
    showSnackbar('info', message, title);
  };

  return {
    snackbar,
    showSnackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
