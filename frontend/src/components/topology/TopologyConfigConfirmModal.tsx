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
    LinearProgress,
} from "@mui/material";
import { CheckCircle, ErrorOutline, Block, HourglassEmpty } from "@mui/icons-material";
import { StagedIntent } from "./config-panels/types";
import { components } from "@/lib/apiv2/schema";

type BulkIntentItemResult = components["schemas"]["BulkIntentItemResult"];

interface TopologyConfigConfirmModalProps {
    open: boolean;
    onClose: () => void;
    deviceName: string;
    nodeId: string;
    stagedIntents: StagedIntent[];
    isPushing: boolean;
    results: BulkIntentItemResult[] | null;
    onConfirm: () => void;
    onReset?: () => void;
}

export function TopologyConfigConfirmModal({
    open,
    onClose,
    deviceName,
    nodeId,
    stagedIntents,
    isPushing,
    results,
    onConfirm,
    onReset,
}: TopologyConfigConfirmModalProps) {
    const isFinished = results !== null;
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
                
                <Box sx={{ bgcolor: "grey.50", border: "1px solid", borderColor: "grey.200", borderRadius: 1, p: 2, maxHeight: 300, overflowY: "auto", position: "relative" }}>
                    {isPushing && (
                        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
                            <LinearProgress />
                        </Box>
                    )}
                    <List dense disablePadding sx={{ opacity: isPushing ? 0.6 : 1 }}>
                        {stagedIntents.map((intent, idx) => {
                            const res = results?.find(r => r.index === idx);
                            
                            let StatusIcon = null;
                            if (isPushing) {
                                StatusIcon = <HourglassEmpty fontSize="small" sx={{ color: "text.disabled", mr: 1, verticalAlign: "middle" }} />;
                            } else if (res) {
                                if (res.status === "SUCCESS") StatusIcon = <CheckCircle fontSize="small" color="success" sx={{ mr: 1, verticalAlign: "middle" }} />;
                                else if (res.status === "FAILED") StatusIcon = <ErrorOutline fontSize="small" color="error" sx={{ mr: 1, verticalAlign: "middle" }} />;
                                else if (res.status === "CANCELLED") StatusIcon = <Block fontSize="small" sx={{ color: "grey.500", mr: 1, verticalAlign: "middle" }} />;
                            }

                            return (
                                <Box key={idx}>
                                    <ListItemText 
                                        primary={
                                            <Typography variant="body2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
                                                {StatusIcon}
                                                {`${idx + 1}. ${intent.label || intent.intent}`}
                                            </Typography>
                                        } 
                                        secondary={
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, wordBreak: 'break-word', pl: StatusIcon ? 3.5 : 0 }}>
                                                    {Object.entries(intent.params || {})
                                                        .map(([key, value]) => `${key}: ${value}`)
                                                        .join(" • ")}
                                                </Typography>
                                                {res?.status === "FAILED" && res.error && (
                                                    <Alert severity="error" sx={{ mt: 1, ml: StatusIcon ? 2.5 : 0, py: 0, '& .MuiAlert-message': { p: 0.5 } }}>
                                                        {res.error}
                                                    </Alert>
                                                )}
                                                {res?.status === "CANCELLED" && (
                                                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5, pl: StatusIcon ? 3.5 : 0, fontStyle: 'italic' }}>
                                                        Skipped due to previous failure
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                        sx={{ my: 0.5 }}
                                    />
                                    {idx < stagedIntents.length - 1 && <Divider sx={{ my: 1 }} />}
                                </Box>
                            );
                        })}
                    </List>
                </Box>
                
                {!isFinished && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        If any item fails, the system will stop processing the rest immediately
                    </Alert>
                )}
            </DialogContent>
            <Box sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5, borderTop: 1, borderColor: "divider" }}>
                {!isFinished ? (
                    <>
                        <Button variant="outlined" color="inherit" onClick={onClose} disabled={isPushing}>
                            Cancel
                        </Button>
                        <Button variant="contained" color="primary" onClick={onConfirm} disabled={isPushing}>
                            {isPushing ? "Processing..." : "Confirm Changes"}
                        </Button>
                    </>
                ) : (
                    <Button variant="contained" color="primary" onClick={onReset || onClose}>
                        Done
                    </Button>
                )}
            </Box>
        </Dialog>
    );
}
