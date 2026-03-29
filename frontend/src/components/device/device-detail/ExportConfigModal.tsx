import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    FormControl,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Stack
} from "@mui/material";
import { Download, Block } from "@mui/icons-material";
import { fetchClient } from "@/lib/apiv2/fetch";
import { components } from "@/lib/apiv2/schema";

type DeviceBackupRecordResponse = components["schemas"]["DeviceBackupRecordResponse"];

interface ExportConfigModalProps {
    open: boolean;
    onClose: () => void;
    deviceId: string;
    deviceName: string;
}

export function ExportConfigModal({ open, onClose, deviceId, deviceName }: ExportConfigModalProps) {
    const [backups, setBackups] = useState<DeviceBackupRecordResponse[]>([]);
    const [selectedRecordId, setSelectedRecordId] = useState<string>("");
    const [previewContent, setPreviewContent] = useState<string>("");
    
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch backup history when modal opens
    useEffect(() => {
        if (open && deviceId) {
            fetchBackupHistory();
        } else {
            // Reset state on close
            setBackups([]);
            setSelectedRecordId("");
            setPreviewContent("");
            setError(null);
        }
    }, [open, deviceId]);

    const fetchBackupHistory = async () => {
        setIsLoadingList(true);
        setError(null);
        try {
            const { data, error } = await fetchClient.GET("/api/v1/devices/backups/device/{device_id}", {
                params: { path: { device_id: deviceId } }
            });

            if (error) {
                setError((error as any)?.detail || "Failed to load backup history");
            } else if (data) {
                // Sort by created_at descending
                const sorted = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setBackups(sorted);
                if (sorted.length > 0) {
                    handleSelectBackup(sorted[0].id);
                }
            }
        } catch (err: any) {
            setError(err.message || "Failed to load backup history");
        } finally {
            setIsLoadingList(false);
        }
    };

    const handleSelectBackup = async (recordId: string) => {
        setSelectedRecordId(recordId);
        setIsLoadingPreview(true);
        setError(null);
        setPreviewContent("");
        
        try {
            // fetch specific backup record for full details (including config_content if that's how it's implemented)
            // Or if it's raw text:
            const { data, error, response } = await fetchClient.GET("/api/v1/devices/backups/{record_id}", {
                params: { path: { record_id: recordId } }
            });

            if (error) {
                setError((error as any)?.detail || "Failed to load configuration preview");
            } else if (data) {
                // If the schema represents it as JSON but it might return string depending on the API design
                // Let's assume it returns a raw string or an object with config_content
                if (typeof data === "string") {
                    setPreviewContent(data);
                } else if ((data as any)?.config_content) {
                    setPreviewContent((data as any).config_content);
                } else if ((data as any)?.content) {
                    setPreviewContent((data as any).content);
                } else {
                    setPreviewContent(JSON.stringify(data, null, 2));
                }
            }
        } catch (err: any) {
            setError(err.message || "Failed to load configuration preview");
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleDownload = () => {
        if (!previewContent) return;

        const record = backups.find((b: any) => b.id === selectedRecordId);
        const timestamp = record ? new Date(record.created_at).toISOString().replace(/[:.]/g, "-") : Date.now();
        const filename = `${deviceName.replace(/\\s+/g, "_")}_config_${timestamp}.txt`;

        const blob = new Blob([previewContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Export Device Configuration</DialogTitle>
            <DialogContent dividers>
                {/* Error Banner */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                )}

                {/* Loading List */}
                {isLoadingList ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : backups.length === 0 ? (
                    <Box textAlign="center" py={6}>
                        <Block color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                            No backup configurations found for this device.
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {/* Selector */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Select Configuration Backup Version:</Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedRecordId}
                                    onChange={(e) => handleSelectBackup(e.target.value)}
                                    disabled={isLoadingPreview}
                                >
                                    {backups.map((backup: any) => (
                                        <MenuItem key={backup.id} value={backup.id}>
                                            <Stack direction="row" justifyContent="space-between" width="100%">
                                                <Typography variant="body2">
                                                    {new Date(backup.created_at).toLocaleString()}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {backup.config_type} | {backup.config_format}
                                                </Typography>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Preview */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Configuration Preview:</Typography>
                            <Box 
                                sx={{ 
                                    height: 400, 
                                    bgcolor: "grey.900", 
                                    color: "grey.100", 
                                    p: 2, 
                                    borderRadius: 1,
                                    overflowY: "auto",
                                    position: "relative"
                                }}
                            >
                                {isLoadingPreview ? (
                                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                        <CircularProgress color="inherit" />
                                    </Box>
                                ) : previewContent ? (
                                    <pre style={{ margin: 0, fontFamily: "monospace", fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
                                        {previewContent}
                                    </pre>
                                ) : (
                                    <Typography variant="body2" color="grey.500" fontStyle="italic">
                                        No content available to preview.
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="inherit" variant="outlined">
                    Cancel
                </Button>
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<Download />}
                    onClick={handleDownload}
                    disabled={!previewContent || isLoadingPreview || backups.length === 0}
                >
                    Download .txt
                </Button>
            </DialogActions>
        </Dialog>
    );
}
