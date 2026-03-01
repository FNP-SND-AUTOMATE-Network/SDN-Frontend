import React from "react";
import {
    Box,
    Typography,
    Stack,
    IconButton,
    Paper,
    CircularProgress,
    Divider,
} from "@mui/material";
import { CheckCircleOutline, ErrorOutline, Close } from "@mui/icons-material";

export type BackupJobStatus = "SUCCESS" | "FAILED" | "IN_PROGRESS";

export interface BackupJobResult {
    id: string;
    name: string;
    status: BackupJobStatus;
    message?: string;
}

interface BackupStatusOverlayProps {
    open: boolean;
    jobs: BackupJobResult[] | null;
    onClose: () => void;
}

export default function BackupStatusOverlay({ open, jobs, onClose }: BackupStatusOverlayProps) {
    if (!open || !jobs || jobs.length === 0) return null;

    const inProgressCount = jobs.filter(j => j.status === "IN_PROGRESS").length;
    const successCount = jobs.filter(j => j.status === "SUCCESS").length;
    const failedCount = jobs.filter(j => j.status === "FAILED").length;
    const isComplete = inProgressCount === 0;

    return (
        <Paper
            elevation={8}
            sx={{
                position: "fixed",
                bottom: 24,
                right: 24,
                width: 360,
                zIndex: 1300,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                borderRadius: 2,
            }}
        >
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, pb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {!isComplete ? (
                        <CircularProgress size={20} sx={{ color: "#f59e0b" }} thickness={4} />
                    ) : (
                        <CheckCircleOutline sx={{ color: "text.primary" }} />
                    )}
                    <Typography variant="subtitle1" fontWeight={600}>
                        {!isComplete ? "Backup in Progress" : "Backup Complete"}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
                    <Close fontSize="small" />
                </IconButton>
            </Box>

            <Divider />

            {/* Content */}
            <Box sx={{ p: 2, maxHeight: 300, overflowY: "auto" }}>
                <Stack spacing={2}>
                    {jobs.map((job) => (
                        <Box key={job.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="body2" fontFamily="SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif">
                                {job.name}
                            </Typography>

                            {job.status === "SUCCESS" && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: "#dcfce7", color: "#166534", px: 1, py: 0.5, borderRadius: 1.5, border: "1px solid #bbf7d0" }}>
                                    <CheckCircleOutline fontSize="small" sx={{ fontSize: 16 }} />
                                    <Typography variant="caption" fontWeight={600}>Success</Typography>
                                </Box>
                            )}

                            {job.status === "FAILED" && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: "#fee2e2", color: "#991b1b", px: 1, py: 0.5, borderRadius: 1.5, border: "1px solid #fecaca" }}>
                                    <ErrorOutline fontSize="small" sx={{ fontSize: 16 }} />
                                    <Typography variant="caption" fontWeight={600}>Failed</Typography>
                                </Box>
                            )}

                            {job.status === "IN_PROGRESS" && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: "#ffedd5", color: "#9a3412", px: 1, py: 0.5, borderRadius: 1.5, border: "1px solid #fed7aa" }}>
                                    <CircularProgress size={12} sx={{ color: "inherit" }} thickness={5} />
                                    <Typography variant="caption" fontWeight={600}>In Progress</Typography>
                                </Box>
                            )}
                        </Box>
                    ))}
                </Stack>
            </Box>

            {/* Footer */}
            {isComplete && (
                <>
                    <Divider />
                    <Box sx={{ p: 2, bgcolor: "grey.50" }}>
                        <Typography variant="body2" color="text.secondary">
                            {successCount} succeeded, {failedCount} failed · {new Date().toLocaleTimeString()}
                        </Typography>
                    </Box>
                </>
            )}
        </Paper>
    );
}
