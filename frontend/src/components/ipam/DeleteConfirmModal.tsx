"use client";

import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    CircularProgress,
    IconButton,
} from "@mui/material";
import { Warning as WarningIcon, Close as CloseIcon } from "@mui/icons-material";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName?: string;
    isLoading?: boolean;
}

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
    isLoading = false,
}: DeleteConfirmModalProps) {
    return (
        <Dialog open={isOpen} onClose={!isLoading ? onClose : undefined} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1, pr: 6 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "error.light",
                        color: "error.main",
                        mr: 1,
                    }}
                >
                    <WarningIcon color="error" />
                </Box>
                {title}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                    disabled={isLoading}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pb: 3, pt: "8px !important" }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: itemName ? 2 : 0 }}>
                    {message}
                </Typography>
                {itemName && (
                    <Box sx={{ bgcolor: "grey.100", p: 1.5, borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight="medium" color="text.primary">
                            {itemName}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
                <Button onClick={onClose} color="inherit" disabled={isLoading} sx={{ textTransform: "none", fontWeight: 500 }}>
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
                    sx={{ textTransform: "none", fontWeight: 500, boxShadow: "none" }}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
