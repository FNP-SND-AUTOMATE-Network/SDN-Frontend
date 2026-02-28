"use client";

import { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    Stack,
    IconButton,
    Tooltip,
    Chip,
} from "@mui/material";
import {
    Info,
    Lan,
    LocationOn,
    Storage,
    ContentCopy,
    Check,
    AccessTime,
} from "@mui/icons-material";
import { paths } from "@/lib/apiv2/schema";

type DeviceNetwork =
    paths["/device-networks/{device_id}"]["get"]["responses"]["200"]["content"]["application/json"];

interface DeviceDetailCardsProps {
    device: DeviceNetwork;
}

// --- Helper: Copyable Text ---
function CopyableText({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="body2">{value}</Typography>
            <Tooltip title={copied ? "Copied!" : "Copy"}>
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
}: {
    label: string;
    value: string | null | undefined;
    copyable?: boolean;
}) {
    const displayValue = value || "-";
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
            {copyable && value ? (
                <CopyableText value={value} />
            ) : (
                <Typography variant="body2" fontWeight={value ? 500 : 400} color={value ? "text.primary" : "text.disabled"}>
                    {displayValue}
                </Typography>
            )}
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

// --- Helper: Status Badge ---
function StatusBadge({ status }: { status: boolean | string | null | undefined }) {
    const isActive = status === true || status === "true" || status === "ONLINE";
    return (
        <Chip
            label={isActive ? "Active" : "Inactive"}
            color={isActive ? "success" : "default"}
            size="small"
            variant="filled"
            sx={{ fontWeight: 500, fontSize: 11 }}
        />
    );
}

// --- Helper: Format Date ---
function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

// --- Main Component ---
export default function DeviceDetailCards({ device }: DeviceDetailCardsProps) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                gap: 3,
            }}
        >
            {/* Basic Info */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 0.5 }}>
                <CardHeader
                    icon={<Info fontSize="small" color="action" />}
                    title="Basic Information"
                />
                <Box sx={{ fontSize: 14 }}>
                    <InfoRow label="Device Name" value={device.device_name} />
                    <InfoRow label="Type" value={device.type} />
                    <InfoRow label="Model" value={device.device_model} />
                    <InfoRow label="Serial Number" value={device.serial_number} copyable />
                    <InfoRow label="Vendor" value={device.vendor} />
                    <InfoRow label="Management Protocol" value={device.management_protocol} />
                </Box>
            </Paper>

            {/* Network Info */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 0.5 }}>
                <CardHeader
                    icon={<Lan fontSize="small" color="action" />}
                    title="Network Information"
                />
                <Box sx={{ fontSize: 14 }}>
                    <InfoRow label="IP Address" value={device.ip_address} copyable />
                    <InfoRow label="MAC Address" value={device.mac_address} copyable />
                    <InfoRow label="Node ID" value={device.node_id} copyable />
                    <InfoRow label="Datapath ID" value={device.datapath_id} copyable />
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            py: 1.25,
                        }}
                    >
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                ODL Mounted
                            </Typography>
                            {device.odl_mounted && device.odl_connection_status && device.odl_connection_status.toLowerCase() !== "connected" && (
                                <Typography variant="caption" color="warning.main" sx={{ display: "block", mt: 0.5, maxWidth: 220, wordBreak: "break-word" }}>
                                    {device.odl_connection_status}
                                </Typography>
                            )}
                        </Box>
                        <StatusBadge
                            status={device.odl_mounted && (!device.odl_connection_status || device.odl_connection_status.toLowerCase() === "connected")}
                        />
                    </Box>
                </Box>
            </Paper>

            {/* Location & Site */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 0.5 }}>
                <CardHeader
                    icon={<LocationOn fontSize="small" color="action" />}
                    title="Location & Site"
                />
                <Box sx={{ fontSize: 14 }}>
                    <InfoRow
                        label="Site"
                        value={
                            device.localSite
                                ? `${device.localSite.site_code}${device.localSite.site_name ? ` - ${device.localSite.site_name}` : ""}`
                                : null
                        }
                    />
                    <InfoRow
                        label="OS Type"
                        value={device.operatingSystem?.os_type || null}
                    />
                    <InfoRow label="Description" value={device.description} />
                </Box>
            </Paper>

            {/* Timestamps */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 0.5 }}>
                <CardHeader
                    icon={<AccessTime fontSize="small" color="action" />}
                    title="Timestamps"
                />
                <Box sx={{ fontSize: 14 }}>
                    <InfoRow label="Created" value={formatDate(device.created_at)} />
                    <InfoRow label="Updated" value={formatDate(device.updated_at)} />
                </Box>
            </Paper>
        </Box>
    );
}
