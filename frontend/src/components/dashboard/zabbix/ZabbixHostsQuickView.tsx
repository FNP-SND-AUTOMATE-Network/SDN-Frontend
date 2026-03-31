"use client";

import React from "react";
import {
    Box, Typography, Alert,
    Chip, Stack, Skeleton, Tooltip, IconButton, alpha
} from "@mui/material";
import { OpenInNew, FiberManualRecord } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/apiv2/fetch";
import { paths } from "@/lib/apiv2/schema";

type HostsData = paths["/api/v1/zabbix/dashboard/hosts"]["get"]["responses"]["200"]["content"]["application/json"];

interface ZabbixHostsQuickViewProps {
    onSelectHost: (hostId: string, hostName: string) => void;
}

export function ZabbixHostsQuickView({ onSelectHost }: ZabbixHostsQuickViewProps) {
    const { data, isLoading, isError, error } = useQuery<HostsData>({
        queryKey: ["zabbix-hosts"],
        queryFn: async () => {
            const { data, error } = await fetchClient.GET("/api/v1/zabbix/dashboard/hosts");
            if (error) throw new Error((error as any).detail || "Failed to fetch hosts");
            return data as HostsData;
        },
        refetchInterval: 60000,
    });

    if (isLoading) {
        return (
            <Box sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                <Box sx={{ px: 2.5, py: 1.5, bgcolor: "grey.50" }}>
                    <Skeleton width={160} height={24} />
                </Box>
                <Stack spacing={0}>
                    {[...Array(5)].map((_, i) => (
                        <Box key={i} sx={{ px: 2.5, py: 1.5, borderTop: "1px solid", borderColor: "divider", display: "flex", gap: 2 }}>
                            <Skeleton variant="circular" width={32} height={32} />
                            <Box flex={1}>
                                <Skeleton width="60%" height={20} />
                                <Skeleton width="40%" height={16} sx={{ mt: 0.5 }} />
                            </Box>
                        </Box>
                    ))}
                </Stack>
            </Box>
        );
    }

    if (isError || !data) {
        return (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
                Failed to load hosts: {error instanceof Error ? error.message : "No data"}
            </Alert>
        );
    }

    const hostList: any[] = Array.isArray(data) ? data : ((data as any).hosts || []);
    const available = hostList.filter(h => h.availability === "available").length;
    const unavailable = hostList.filter(h => h.availability === "unavailable").length;

    return (
        <Box
            sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.paper",
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: "0 4px 24px rgba(0,0,0,0.06)" },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    px: 2.5,
                    py: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "grey.50",
                }}
            >
                <Typography variant="subtitle2" fontWeight={700}>
                    Host Availability
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Chip
                        size="small"
                        icon={<FiberManualRecord sx={{ fontSize: "8px !important", color: "#4caf50 !important" }} />}
                        label={available}
                        sx={{ fontWeight: 600, fontSize: "0.7rem", bgcolor: alpha("#4caf50", 0.08), color: "#2e7d32" }}
                    />
                    <Chip
                        size="small"
                        icon={<FiberManualRecord sx={{ fontSize: "8px !important", color: "#f44336 !important" }} />}
                        label={unavailable}
                        sx={{ fontWeight: 600, fontSize: "0.7rem", bgcolor: alpha("#f44336", 0.08), color: "#c62828" }}
                    />
                </Stack>
            </Box>

            {/* Host List */}
            <Box sx={{ flex: 1, overflowY: "auto", maxHeight: 400 }}>
                {hostList.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: "center" }}>
                        <Typography color="text.secondary" variant="body2">No hosts found</Typography>
                    </Box>
                ) : (
                    <Stack spacing={0}>
                        {hostList.slice(0, 15).map((h: any, idx: number) => {
                            const ip = h.interfaces?.find((i: any) => i.main === true || i.main === "1")?.ip || h.interfaces?.[0]?.ip || "-";
                            const isAvailable = h.availability === "available";
                            const isUnknown = h.availability === "unknown";
                            const statusColor = isAvailable ? "#4caf50" : isUnknown ? "#9e9e9e" : "#f44336";
                            const statusLabel = isAvailable ? "Online" : isUnknown ? "Unknown" : "Offline";

                            return (
                                <Box
                                    key={h.hostid || idx}
                                    onClick={() => onSelectHost(h.hostid, h.name || h.host)}
                                    sx={{
                                        px: 2.5,
                                        py: 1.5,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                        borderBottom: "1px solid",
                                        borderColor: "divider",
                                        cursor: "pointer",
                                        transition: "background 0.15s",
                                        "&:hover": { bgcolor: "action.hover" },
                                        "&:last-child": { borderBottom: 0 },
                                    }}
                                >
                                    {/* Status avatar */}
                                    <Box
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 2,
                                            bgcolor: alpha(statusColor, 0.1),
                                            display: "grid",
                                            placeItems: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <FiberManualRecord sx={{ fontSize: 12, color: statusColor }} />
                                    </Box>

                                    {/* Info */}
                                    <Box flex={1} minWidth={0}>
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                            sx={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {h.name || h.host}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                            {ip}
                                        </Typography>
                                    </Box>

                                    {/* Status + Action */}
                                    <Tooltip title={statusLabel} arrow>
                                        <Chip
                                            size="small"
                                            label={statusLabel}
                                            sx={{
                                                fontSize: "0.65rem",
                                                height: 22,
                                                fontWeight: 600,
                                                bgcolor: alpha(statusColor, 0.1),
                                                color: statusColor,
                                                flexShrink: 0,
                                            }}
                                        />
                                    </Tooltip>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectHost(h.hostid, h.name || h.host);
                                        }}
                                        sx={{ color: "text.disabled", "&:hover": { color: "primary.main" } }}
                                    >
                                        <OpenInNew sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Box>
        </Box>
    );
}
