"use client";

import { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    Stack,
    IconButton,
    Tooltip,
    Button,
} from "@mui/material";
import {
    Code,
    Lan,
    Visibility,
    ContentCopy,
    Check,
} from "@mui/icons-material";
import { paths } from "@/lib/apiv2/schema";

type DeviceNetwork =
    paths["/device-networks/{device_id}"]["get"]["responses"]["200"]["content"]["application/json"];

interface DeviceConfigurationTabProps {
    device: DeviceNetwork;
    onPreviewTemplate?: (templateId: string) => void;
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
                    <Typography variant="body2" fontWeight={value ? 500 : 400} color={value ? "text.primary" : "text.disabled"}>
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
    onPreviewTemplate,
}: DeviceConfigurationTabProps) {
    const template = device.configuration_template;

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                gap: 3,
            }}
        >
            {/* Configuration Template Card */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 0.5 }}>
                <CardHeader
                    icon={<Code fontSize="small" color="action" />}
                    title="Configuration Template"
                />
                <Box sx={{ fontSize: 14 }}>
                    <InfoRow label="Template Name" value={template?.template_name} />
                    <InfoRow label="Template Type" value={template?.template_type} />
                    <InfoRow
                        label="Template ID"
                        value={template?.id}
                        copyable
                        action={
                            template?.id && onPreviewTemplate ? (
                                <Button
                                    size="small"
                                    variant="text"
                                    startIcon={<Visibility sx={{ fontSize: 14 }} />}
                                    onClick={() => onPreviewTemplate(template.id)}
                                    sx={{ fontSize: 12, textTransform: "none" }}
                                >
                                    Preview
                                </Button>
                            ) : null
                        }
                    />
                </Box>
                {!template && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: "grey.50", borderRadius: 0.5, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            No configuration template assigned
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* NETCONF Setting Card */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 0.5 }}>
                <CardHeader
                    icon={<Lan fontSize="small" color="action" />}
                    title="NETCONF Setting"
                />
                <Box sx={{ fontSize: 14 }}>
                    <InfoRow label="Host" value={device.netconf_host} copyable />
                    <InfoRow label="Port" value={device.netconf_port?.toString()} />
                </Box>
                {!device.netconf_host && !device.netconf_port && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: "grey.50", borderRadius: 0.5, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            NETCONF not configured
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}
