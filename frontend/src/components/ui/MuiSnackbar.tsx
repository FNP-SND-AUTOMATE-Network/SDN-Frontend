"use client";

import React from 'react';
import { Snackbar, Alert as MuiAlert, AlertTitle } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationTriangle, 
  faExclamationCircle, 
  faInfoCircle 
} from '@fortawesome/free-solid-svg-icons';
import type { AlertColor } from '@/hooks/useSnackbar';

interface MuiSnackbarProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  title?: string;
  onClose: () => void;
  autoHideDuration?: number;
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

const iconMap = {
  success: faCheckCircle,
  error: faExclamationCircle,
  warning: faExclamationTriangle,
  info: faInfoCircle,
};

export const MuiSnackbar: React.FC<MuiSnackbarProps> = ({
  open,
  message,
  severity,
  title,
  onClose,
  autoHideDuration = 6000,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      <MuiAlert
        onClose={onClose}
        severity={severity}
        variant="filled"
        icon={<FontAwesomeIcon icon={iconMap[severity]} />}
        sx={{
          fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          '& .MuiAlert-message': {
            fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          },
          '& .MuiAlertTitle-root': {
            fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            fontWeight: 600,
          },
        }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </MuiAlert>
    </Snackbar>
  );
};
