"use client";

import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
    List,
    ListItemText,
    Divider,
    Alert,
    Button,
} from "@mui/material";
import { StagedIntent } from "./config-panels/types";

interface TopologyConfigConfirmModalProps {
    open: boolean;
    onClose: () => void;
    deviceName: string;
    nodeId: string;
    stagedIntents: StagedIntent[];
    onConfirm: () => void;
}

export function TopologyConfigConfirmModal({
    open,
    onClose,
    deviceName,
    nodeId,
    stagedIntents,
    onConfirm,
}: TopologyConfigConfirmModalProps) {
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle> Confirm Changes </DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    Do you want to push these changes to <b>{deviceName || nodeId}</b>?
                </Typography>
                
                <Box sx={{ bgcolor: "grey.50", border: "1px solid", borderColor: "grey.200", borderRadius: 1, p: 2, maxHeight: 300, overflowY: "auto" }}>
                    <List dense disablePadding>
                        {stagedIntents.map((intent, idx) => (
                            <Box key={idx}>
                                <ListItemText 
                                    primary={
                                        <Typography variant="body2" fontWeight={600}>
                                            {`${idx + 1}. ${intent.label || intent.intent}`}
                                        </Typography>
                                    } 
                                    secondary={
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, wordBreak: 'break-word' }}>
                                            {Object.entries(intent.params || {})
                                                .map(([key, value]) => `${key}: ${value}`)
                                                .join(" • ")}
                                        </Typography>
                                    }
                                    sx={{ my: 0.5 }}
                                />
                                {idx < stagedIntents.length - 1 && <Divider sx={{ my: 1 }} />}
                            </Box>
                        ))}
                    </List>
                </Box>
                <Alert severity="warning" sx={{ mt: 2 }}>
                    If any item fails, the system will stop processing the rest immediately
                </Alert>
            </DialogContent>
            <Box sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5, borderTop: 1, borderColor: "divider" }}>
                <Button variant="outlined" color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" color="primary" onClick={onConfirm}>
                    Confirm Changes
                </Button>
            </Box>
        </Dialog>
    );
}
