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
import { Close as CloseIcon, ContentCopy } from "@mui/icons-material";
import { fetchClient } from "@/lib/apiv2/fetch";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";

interface BackupConfigModalProps {
    open: boolean;
    onClose: () => void;
    recordId: string | null;
}

export function BackupConfigModal({ open, onClose, recordId }: BackupConfigModalProps) {
    const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
    const [configData, setConfigData] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (open && recordId) {
            loadConfig();
        } else {
            setConfigData(null);
            setErrorMsg(null);
        }
    }, [open, recordId]);

    const loadConfig = async () => {
        if (!recordId) return;
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const { data: dataDetails, error } = await fetchClient.GET("/api/v1/devices/backups/{record_id}", {
                params: {
                    path: { record_id: recordId }
                }
            });

            if (error) {
                setErrorMsg((error as any)?.detail || "Failed to load backup configuration.");
            } else if (dataDetails) {
                const configContent = (() => {
                    const detail = dataDetails as any;
                    if (!detail?.config_content) return "";
                    return typeof detail.config_content === 'string'
                        ? detail.config_content
                        : JSON.stringify(detail.config_content, null, 2);
                })();
                setConfigData(configContent);
            }
        } catch (err: any) {
            setErrorMsg(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (configData) {
            navigator.clipboard.writeText(configData);
            showSuccess("Configuration copied to clipboard.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div" fontWeight={600}>Backup Configuration Preview</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={handleCopy} size="small" disabled={!configData} title="Copy to clipboard">
                        <ContentCopy fontSize="small" />
                    </IconButton>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: configData && !errorMsg ? '#1E1E1E' : 'background.paper', p: 0 }}>
                {isLoading ? (
                    <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress />
                        <Typography color="text.secondary">Loading configuration...</Typography>
                    </Box>
                ) : errorMsg ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="error.main">{errorMsg}</Typography>
                    </Box>
                ) : configData ? (
                    <Box sx={{ p: 2, overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
                        <pre style={{
                            margin: 0,
                            fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                            fontSize: '0.85rem',
                            color: '#E5E7EB',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all'
                        }}>
                            {configData}
                        </pre>
                    </Box>
                ) : (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">No configuration data available.</Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined">Close</Button>
            </DialogActions>

            <MuiSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={hideSnackbar}
                title={snackbar.title}
            />
        </Dialog>
    );
}
