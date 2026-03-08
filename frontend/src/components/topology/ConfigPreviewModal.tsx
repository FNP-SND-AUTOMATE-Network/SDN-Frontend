"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { components } from "@/lib/apiv2/schema";
import { $api } from "@/lib/apiv2/fetch";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    IconButton,
    Button,
    Chip,
    CircularProgress,
    Stack,
    Divider
} from "@mui/material";
import { Close } from "@mui/icons-material";

type DeviceNetwork = components["schemas"]["DeviceNetworkResponse"];

interface ConfigPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    device: DeviceNetwork | null;
}

export default function ConfigPreviewModal({
    isOpen,
    onClose,
    device,
}: ConfigPreviewModalProps) {
    // 1. Fetch backup history for the device to get the latest record_id
    const { data: historyData, isLoading: isLoadingHistory } = $api.useQuery(
        "get",
        "/api/v1/devices/backups/device/{device_id}",
        {
            params: { path: { device_id: device?.id || "" } },
        },
        { enabled: isOpen && !!device?.id }
    );

    // Find the latest successful backup record
    const latestRecordId = historyData && historyData.length > 0
        ? historyData.find(record => record.status === "SUCCESS")?.id
        : null;

    // 2. Fetch the actual config_content using the latest record_id
    const { data: detailData, isLoading: isLoadingDetail } = $api.useQuery(
        "get",
        "/api/v1/devices/backups/{record_id}",
        {
            params: { path: { record_id: latestRecordId || "" } },
        },
        { enabled: isOpen && !!latestRecordId }
    );

    if (!isOpen || !device) return null;

    const isLoading = isLoadingHistory || (!!latestRecordId && isLoadingDetail);
    const noBackupFound = !isLoadingHistory && (!historyData || historyData.length === 0 || !latestRecordId);

    // Determine content text format
    const configContent = (() => {
        const detail = detailData as any;
        if (!detail?.config_content) return "";
        return typeof detail.config_content === 'string'
            ? detail.config_content
            : JSON.stringify(detail.config_content, null, 2);
    })();

    const getStatusChip = () => {
        const isOnline = device.status === "ONLINE";
        return (
            <Chip
                icon={<FontAwesomeIcon icon={faCircle} className="w-2 h-2 ml-1" />}
                label={isOnline ? "Online" : "Offline"}
                size="small"
                sx={{
                    bgcolor: isOnline ? "#22C55E" : "#EF4444",
                    color: "white",
                    fontWeight: 500,
                    height: 24,
                    "& .MuiChip-icon": { color: "white", width: 8, height: 8 }
                }}
            />
        );
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, maxHeight: "85vh" } }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1.5 }}>
                <Typography component="div" variant="h6" fontWeight={700}>
                    Preview Latest Configuration
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>

            <Divider />

            {/* Device Info Header */}
            <Box sx={{ p: 2, bgcolor: "grey.50", borderBottom: 1, borderColor: "divider" }}>
                <Stack direction="row" spacing={4} sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Device</Typography>
                        <Typography variant="body2" fontWeight={600}>{device.device_name}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">IP mgmt</Typography>
                        <Typography variant="body2" fontWeight={600}>{device.ip_address || "-"}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Status</Typography>
                        <Box sx={{ mt: 0.5 }}>{getStatusChip()}</Box>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">OS</Typography>
                        <Typography variant="body2" fontWeight={600}>{device.operatingSystem?.os_type || "N/A"}</Typography>
                    </Box>
                </Stack>
            </Box>

            <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
                <Box
                    sx={{
                        flex: 1,
                        bgcolor: "#1E1E1E",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Header of the config box */}
                    <Box sx={{
                        px: 2,
                        py: 1.5,
                        bgcolor: "grey.100",
                        borderBottom: 1,
                        borderColor: "divider",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
                            Configuration Preview (Read-only)
                        </Typography>
                        {(detailData as any)?.updated_at && (
                            <Typography variant="caption" color="text.secondary">
                                Backed up on: {new Date((detailData as any).updated_at).toLocaleString()}
                            </Typography>
                        )}
                    </Box>

                    {/* Content Area */}
                    <Box
                        sx={{
                            flex: 1,
                            p: 2,
                            overflowY: "auto",
                            fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                            fontSize: "0.875rem",
                            color: "#E4E4E7",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                        }}
                    >
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 200 }}>
                                <CircularProgress size={32} />
                            </Box>
                        ) : noBackupFound ? (
                            <Typography color="text.secondary" sx={{ fontStyle: "italic", textAlign: "center", mt: 4 }}>
                                No configuration backup found for this device.
                            </Typography>
                        ) : (
                            <Box
                                component="textarea"
                                value={configContent || "No configuration content available."}
                                readOnly
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    minHeight: 400,
                                    p: 2,
                                    bgcolor: "#1E1E1E",
                                    color: "#D4D4D4",
                                    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                                    fontSize: "0.875rem",
                                    border: "none",
                                    resize: "none",
                                    "&:focus": { outline: "none" }
                                }}
                                spellCheck={false}
                            />
                        )}
                    </Box>
                </Box>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined" color="inherit" sx={{ textTransform: "none" }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
