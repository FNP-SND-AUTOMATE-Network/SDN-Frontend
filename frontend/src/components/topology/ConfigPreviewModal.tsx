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
                    bgcolor: isOnline ? "#22C55E" : "#6B7280",
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

            <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column" }}>
                <Box
                    sx={{
                        border: "1px solid",
                        borderColor: "primary.light",
                        borderRadius: 2,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        minHeight: 400
                    }}
                >
                    <Box sx={{ bgcolor: "primary.50", px: 2, py: 1, borderBottom: "1px solid", borderColor: "primary.light" }}>
                        <Typography variant="body2" fontWeight={600} color="primary.dark">
                            Configuration Preview (Read-only)
                        </Typography>
                        {(detailData as any)?.updated_at && (
                            <Typography variant="caption" color="text.secondary">
                                Backed up on: {new Date((detailData as any).updated_at).toLocaleString()}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ p: 0, flex: 1, bgcolor: "background.paper", position: "relative" }}>
                        {isLoading ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 400 }}>
                                <CircularProgress />
                            </Box>
                        ) : noBackupFound ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", p: 4, minHeight: 400 }}>
                                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                    No successful backup records found for this device.
                                </Typography>
                            </Box>
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
