import React, { useEffect, useState } from "react";
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
import { Close as CloseIcon, WarningAmber } from "@mui/icons-material";
import { fetchClient } from "@/lib/apiv2/fetch";
import { components } from "@/lib/apiv2/schema";

interface CompareDiffModalProps {
    open: boolean;
    onClose: () => void;
    record1: components["schemas"]["DeviceBackupRecordResponse"] | null;
    record2: components["schemas"]["DeviceBackupRecordResponse"] | null;
}

export function CompareDiffModal({ open, onClose, record1, record2 }: CompareDiffModalProps) {
    const [diffOutput, setDiffOutput] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && record1 && record2) {
            loadDiff();
        } else {
            setDiffOutput(null);
            setError(null);
        }
    }, [open, record1, record2]);

    const loadDiff = async () => {
        if (!record1 || !record2) return;
        setIsLoading(true);
        setError(null);
        try {
            // Send earlier record first (record 2 in our ordered list normally, assuming record2 is older)
            // But let's just make sure record 1 is the older one by comparing created_at
            const r1Time = new Date(record1.created_at).getTime();
            const r2Time = new Date(record2.created_at).getTime();

            const olderRecord = r1Time <= r2Time ? record1 : record2;
            const newerRecord = r1Time <= r2Time ? record2 : record1;

            const { data, error } = await fetchClient.POST("/api/v1/devices/backups/diff", {
                body: {
                    record_id_1: olderRecord.id,
                    record_id_2: newerRecord.id
                }
            });

            if (error) {
                const message = (error as any)?.detail || (error as any)?.message || "Failed to load diff";
                setError(message);
            } else if (data) {
                setDiffOutput(data.diff_output || "No changes found between the two configurations.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div" fontWeight={600}>Configuration Diff</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: diffOutput && !error ? '#1E1E1E' : 'background.paper', p: 0 }}>
                {isLoading ? (
                    <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress />
                        <Typography color="text.secondary">Comparing configurations...</Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'error.main' }}>
                        <WarningAmber fontSize="large" />
                        <Typography>{error}</Typography>
                    </Box>
                ) : diffOutput ? (
                    <Box sx={{ p: 2, overflowX: 'auto' }}>
                        <pre style={{
                            margin: 0,
                            fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                            fontSize: '0.85rem',
                            color: '#E5E7EB',
                        }}>
                            {diffOutput.split('\n').map((line, i) => {
                                let color = "#E5E7EB"; // Default white-ish
                                let bgColor = "transparent";
                                if (line.startsWith("+")) {
                                    color = "#4ADE80"; // Green
                                    bgColor = "rgba(74, 222, 128, 0.1)";
                                } else if (line.startsWith("-")) {
                                    color = "#F87171"; // Red
                                    bgColor = "rgba(248, 113, 113, 0.1)";
                                } else if (line.startsWith("@@")) {
                                    color = "#60A5FA"; // Blue for hunks
                                }
                                return (
                                    <div key={i} style={{ color, backgroundColor: bgColor, padding: '0 4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                        {line || " "}
                                    </div>
                                );
                            })}
                        </pre>
                    </Box>
                ) : (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">No diff available.</Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined">Close</Button>
            </DialogActions>
        </Dialog>
    );
}
