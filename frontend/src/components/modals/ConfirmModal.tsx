"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Avatar,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const colorMap = {
    danger: {
      bg: "#FEE2E2",
      icon: "#DC2626",
      button: "error" as const,
    },
    warning: {
      bg: "#FEF3C7",
      icon: "#D97706",
      button: "warning" as const,
    },
    info: {
      bg: "#DBEAFE",
      icon: "#2563EB",
      button: "primary" as const,
    },
  };

  const colors = colorMap[type];

  return (
    <Dialog
      open={isOpen}
      onClose={isLoading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pr: 6,
        }}
      >
        <Avatar
          sx={{
            bgcolor: colors.bg,
            width: 40,
            height: 40,
          }}
        >
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            style={{ color: colors.icon, fontSize: 18 }}
          />
        </Avatar>
        {title}
        <IconButton
          onClick={onClose}
          disabled={isLoading}
          sx={{ position: "absolute", right: 8, top: 8 }}
          size="small"
        >
          <FontAwesomeIcon icon={faTimes} style={{ fontSize: 16 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ color: "text.secondary" }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          variant="outlined"
          color="inherit"
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          variant="contained"
          color={colors.button}
          disableElevation
        >
          {isLoading ? "Processing..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
