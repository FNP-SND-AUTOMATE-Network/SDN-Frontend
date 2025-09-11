"use client";

import React from 'react';
import { Alert as MuiAlert, AlertTitle } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationTriangle, 
  faExclamationCircle, 
  faInfoCircle,
  faTimes 
} from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@mui/material';

export interface AlertProps {
  variant?: "success" | "error" | "warning" | "info" | "danger";
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  closable?: boolean;
  className?: string;
}

const iconMap = {
  success: faCheckCircle,
  error: faExclamationCircle,
  warning: faExclamationTriangle,
  info: faInfoCircle,
};

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  children,
  onClose,
  closable = false,
  className,
}) => {
  const muiVariant = variant === "danger" ? "error" : variant;

  return (
    <MuiAlert
      severity={muiVariant}
      className={className}
      icon={<FontAwesomeIcon icon={iconMap[muiVariant]} />}
      action={
        closable && onClose ? (
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </IconButton>
        ) : null
      }
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
      {children}
    </MuiAlert>
  );
};
