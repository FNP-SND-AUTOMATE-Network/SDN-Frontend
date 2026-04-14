"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Stack,
    IconButton,
    Tooltip,
    Button,
    Skeleton,
} from "@mui/material";
import {
    Code,
    Lan,
    Visibility,
    ContentCopy,
    Check,
    CloudSync,
} from "@mui/icons-material";
import { paths } from "@/lib/apiv2/schema";
import { fetchClient } from "@/lib/apiv2/fetch";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { formatDate } from "./helpers";

type DeviceNetwork =
    paths["/device-networks/{device_id}"]["get"]["responses"]["200"]["content"]["application/json"];

interface DeviceConfigurationTabProps {
    device: DeviceNetwork;
}

// --- Helper: Copyable Text ---
function CopyableText({ value, label }: { value: string; label?: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="body2">{value}</Typography>
            <Tooltip title={copied ? "Copied!" : `Copy ${label || "value"}`}>
                <IconButton size="small" onClick={handleCopy} sx={{ p: 0.25 }}>
                    {copied ? (
                        <Check sx={{ fontSize: 14, color: "success.main" }} />
                    ) : (
                        <ContentCopy sx={{ fontSize: 14, color: "action.active" }} />
                    )}
                </IconButton>
            </Tooltip>
        </Stack>
    );
}

// --- Helper: Info Row ---
function InfoRow({
    label,
    value,
    copyable = false,
    action,
}: {
    label: string;
    value: string | null | undefined;
    copyable?: boolean;
    action?: React.ReactNode;
}) {
    const displayValue = value || "-";
    const isOfflineConfig = value?.toString().includes("Offline Config");
    
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1.25,
                borderBottom: 1,
                borderColor: "grey.100",
                "&:last-child": { borderBottom: 0 },
            }}
        >
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
                {copyable && value ? (
                    <CopyableText value={value} label={label} />
                ) : (
                    <Typography 
                        variant="body2" 
                        fontWeight={value ? (isOfflineConfig ? 600 : 500) : 400} 
                        color={isOfflineConfig ? "error.main" : (value ? "text.primary" : "text.disabled")}
                    >
                        {displayValue}
                    </Typography>
                )}
                {action}
            </Stack>
        </Box>
    );
}

// --- Helper: Card Header ---
function CardHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 2, pb: 1.5, borderBottom: 1, borderColor: "divider" }}
        >
            {icon}
            <Typography variant="subtitle2" fontWeight={600}>
                {title}
            </Typography>
        </Stack>
    );
}

export default function DeviceConfigurationTab({
    device,
}: DeviceConfigurationTabProps) {
    const { snackbar, hideSnackbar, showError, showSuccess, showWarning } = useSnackbar();
    const [liveConfig, setLiveConfig] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchedAt, setFetchedAt] = useState<string | null>(null);
    const [isCached, setIsCached] = useState<boolean>(false);
    const [isOfflineConfig, setIsOfflineConfig] = useState<boolean>(false);

    const fetchLiveConfig = async () => {
        if (!device?.id) return;
        setIsLoading(true);
        setIsOfflineConfig(false);
        try {
            const { data, error, response } = await fetchClient.GET(
                "/api/v1/nbi/devices/{device_id}/live-config",
                {
                    params: {
                        path: { device_id: device.id },
                    },
                }
            );

            if (response.status === 200 && data && data.success) {
                setLiveConfig(data.config || null);
                setIsCached(data.cached);
                setFetchedAt(data.fetched_at || null);
                if (!data.cached) {
                    showSuccess("Live configuration synced successfully");
                } else {
                    showSuccess("Loaded live configuration from cache");
                }
            } else {
                // If live config fails or success is false, try fetching fallback backup
                await fetchFallbackBackup();
                const errorMsg = data?.message || (error as any)?.detail || (error as any)?.message || "Service Unavailable (Offline)";
                showWarning(`Live Config failed (${errorMsg}). Fallback to Backup triggered.`);
            }
        } catch (err: any) {
             await fetchFallbackBackup();
             showWarning(`Live Config failed (${err?.message || "Timeout/Offline"}). Fallback to Backup triggered.`);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFallbackBackup = async () => {
        if (!device?.id) return;
        try {
            // 1. Fetch backup history
            const { data: historyData, response: historyResponse } = await fetchClient.GET(
                "/api/v1/devices/backups/device/{device_id}",
                {
                    params: { path: { device_id: device.id }, query: { limit: 10 } }
                }
            );

            if (historyResponse.status === 200 && Array.isArray(historyData)) {
                // Find latest successful backup
                const latestSuccess = historyData.find(record => record.status === "SUCCESS");
                
                if (latestSuccess) {
                    // 2. Fetch backup record details
                    const { data: recordData, response: recordResponse } = await fetchClient.GET(
                        "/api/v1/devices/backups/{record_id}",
                        {
                            params: { path: { record_id: latestSuccess.id } }
                        }
                    );

                    if (recordResponse.status === 200 && recordData) {
                        const detail = recordData as any;
                        const configContent = (() => {
                            if (!detail?.config_content) return "";
                            return typeof detail.config_content === 'string'
                                ? detail.config_content
                                : JSON.stringify(detail.config_content, null, 2);
                        })();
                        
                        setLiveConfig(configContent || null);
                        setIsCached(false);
                        setIsOfflineConfig(true);
                        setFetchedAt(latestSuccess.created_at || null);
                        return; // Successfully fetched fallback
                    }
                }
            }
            
            // If we reached here, no valid backup was found or fetching record failed
            setLiveConfig(null);
            showError("Device is offline and no matching 'SUCCESS' backup could be found.");
        } catch (fallbackErr) {
            setLiveConfig(null);
            showError("Device is offline and failed to fetch fallback backup history.");
        }
    };

    useEffect(() => {
        fetchLiveConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [device.id]);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 0.5 }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    spacing={2}
                    sx={{ mb: 2, pb: 1.5, borderBottom: 1, borderColor: "divider" }}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Code fontSize="small" color="action" />
                        <Typography variant="subtitle2" fontWeight={600}>
                            Current Live Configuration
                        </Typography>
                    </Stack>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CloudSync />}
                        onClick={fetchLiveConfig}
                        disabled={isLoading}
                        sx={{ textTransform: "none" }}
                    >
                        {isLoading ? "Syncing..." : "Sync Live Config"}
                    </Button>
                </Stack>
                
                <Box sx={{ fontSize: 14 }}>
                    <InfoRow 
                        label="Status" 
                        value={
                            isLoading ? "Loading..." : 
                            isOfflineConfig ? "Offline Config (Fallback to Backup)" :
                            liveConfig ? (isCached ? "Loaded from Cache" : "Freshly Fetched") : 
                            "No config available"
                        } 
                    />
                    {fetchedAt && (
                        <InfoRow 
                            label={isOfflineConfig ? "Backup Date" : "Last Fetched At"} 
                            value={formatDate(fetchedAt)} 
                        />
                    )}
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                        Configuration Output
                    </Typography>
                    <Box
                        sx={{
                            bgcolor: "grey.900",
                            color: "grey.100",
                            p: 2,
                            borderRadius: 1,
                            overflowX: "auto",
                            fontFamily: "monospace",
                            fontSize: "0.85rem",
                            lineHeight: 1.5,
                            maxHeight: "500px",
                            overflowY: "auto",
                        }}
                    >
                        {isLoading ? (
                            <Stack spacing={1}>
                                <Skeleton variant="rounded" width="100%" height={20} sx={{ bgcolor: "grey.800" }} />
                                <Skeleton variant="rounded" width="90%" height={20} sx={{ bgcolor: "grey.800" }} />
                                <Skeleton variant="rounded" width="95%" height={20} sx={{ bgcolor: "grey.800" }} />
                                <Skeleton variant="rounded" width="80%" height={20} sx={{ bgcolor: "grey.800" }} />
                                <Skeleton variant="rounded" width="60%" height={20} sx={{ bgcolor: "grey.800" }} />
                                <Skeleton variant="rounded" width="85%" height={20} sx={{ bgcolor: "grey.800" }} />
                                <Skeleton variant="rounded" width="70%" height={20} sx={{ bgcolor: "grey.800" }} />
                            </Stack>
                        ) : liveConfig ? (
                            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                                {liveConfig}
                            </pre>
                        ) : (
                            <Typography variant="body2" sx={{ color: "grey.500", fontStyle: "italic" }}>
                                No configuration content. Click "Sync Live Config" to fetch.
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Paper>

            <MuiSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                title={snackbar.title}
                onClose={hideSnackbar}
            />
        </Box>
    );
}
