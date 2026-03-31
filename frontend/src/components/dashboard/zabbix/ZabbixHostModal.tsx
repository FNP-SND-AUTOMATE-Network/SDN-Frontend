"use client";

import React from "react";
import {
    Dialog, DialogTitle, DialogContent, Typography, Box, IconButton,
    CircularProgress, Alert, Grid, Divider, Chip, Stack, alpha, Skeleton
} from "@mui/material";
import { Close, Dns, NetworkCheck, Router, Speed } from "@mui/icons-material";
import { LineChart } from "@mui/x-charts/LineChart";
import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/apiv2/fetch";

interface ZabbixHostModalProps {
    open: boolean;
    onClose: () => void;
    hostId: string | null;
    hostName: string;
}

export function ZabbixHostModal({ open, onClose, hostId, hostName }: ZabbixHostModalProps) {
    const { data: detailData, isLoading: isLoadingDetail, error: detailError } = useQuery({
        queryKey: ["zabbix-host-detail", hostId],
        queryFn: async () => {
            if (!hostId) return null;
            const res = await fetchClient.GET("/api/v1/zabbix/dashboard/hosts/{host_id}", {
                params: { path: { host_id: hostId } }
            });
            if (res.error) throw new Error((res.error as any).detail || "Failed to fetch host detail");
            return res.data;
        },
        enabled: open && !!hostId,
    });

    const { data: trafficData, isLoading: isLoadingTraffic } = useQuery({
        queryKey: ["zabbix-host-traffic", hostId],
        queryFn: async () => {
            if (!hostId) return null;
            const res = await fetchClient.GET("/api/v1/zabbix/dashboard/hosts/{host_id}/traffic", {
                params: { path: { host_id: hostId }, query: { period: 1 } as any }
            });
            if (res.error) throw new Error((res.error as any).detail || "Failed to fetch traffic");
            return res.data;
        },
        enabled: open && !!hostId,
    });

    const { data: snmpData, isLoading: isLoadingSnmp } = useQuery({
        queryKey: ["zabbix-host-snmp", hostId],
        queryFn: async () => {
            if (!hostId) return null;
            const res = await fetchClient.GET("/api/v1/zabbix/dashboard/hosts/{host_id}/snmp", {
                params: { path: { host_id: hostId } }
            });
            if (res.error) throw new Error((res.error as any).detail || "Failed to fetch SNMP data");
            return res.data;
        },
        enabled: open && !!hostId,
    });

    const detail: any = detailData;
    const isMonitored = detail?.host?.status === "0";

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, maxHeight: "85vh" }
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pb: 1.5,
                    pt: 2.5,
                    px: 3,
                }}
            >
                <Box display="flex" alignItems="center" gap={2}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #1a237e, #1565c0)",
                            display: "grid",
                            placeItems: "center",
                        }}
                    >
                        <Dns sx={{ color: "white", fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>{hostName}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                ID: {hostId}
                            </Typography>
                            {detail && (
                                <Chip
                                    size="small"
                                    label={isMonitored ? "Monitored" : "Unmonitored"}
                                    sx={{
                                        height: 20,
                                        fontSize: "0.65rem",
                                        fontWeight: 600,
                                        bgcolor: isMonitored ? alpha("#4caf50", 0.1) : alpha("#ff9800", 0.1),
                                        color: isMonitored ? "#2e7d32" : "#e65100",
                                    }}
                                />
                            )}
                        </Stack>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ px: 3, py: 2.5 }}>
                {isLoadingDetail && (
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Skeleton variant="rounded" height={350} sx={{ borderRadius: 2 }} />
                        </Grid>
                    </Grid>
                )}
                {detailError && <Alert severity="error" sx={{ borderRadius: 2 }}>Failed to load host detail</Alert>}

                {!isLoadingDetail && !detailError && detailData ? (
                    <Grid container spacing={3}>
                        {/* Left: Device Info + SNMP */}
                        <Grid size={{ xs: 12, md: 5 }}>
                            {/* Interfaces */}
                            <Box
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    mb: 2,
                                }}
                            >
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <NetworkCheck sx={{ fontSize: 18, color: "primary.main" }} />
                                    <Typography variant="subtitle2" fontWeight={700}>Interfaces</Typography>
                                </Stack>
                                <Stack spacing={1}>
                                    {((detail?.interfaces || []) as any[]).length === 0 ? (
                                        <Typography variant="caption" color="text.secondary">No interfaces</Typography>
                                    ) : (
                                        (detail.interfaces as any[]).map((iface: any, idx: number) => (
                                            <Box
                                                key={idx}
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    p: 1.5,
                                                    borderRadius: 1.5,
                                                    bgcolor: "grey.50",
                                                }}
                                            >
                                                <Typography variant="body2" fontFamily="monospace" fontWeight={500}>
                                                    {iface.ip}
                                                </Typography>
                                                <Stack direction="row" spacing={0.5}>
                                                    {iface.main === "1" && (
                                                        <Chip label="Main" size="small" sx={{ height: 20, fontSize: "0.6rem", fontWeight: 600, bgcolor: alpha("#1976d2", 0.1), color: "#1565c0" }} />
                                                    )}
                                                    <Chip label={`Port ${iface.port || "-"}`} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.6rem" }} />
                                                </Stack>
                                            </Box>
                                        ))
                                    )}
                                </Stack>
                            </Box>

                            {/* SNMP */}
                            <Box
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: "divider",
                                }}
                            >
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <Router sx={{ fontSize: 18, color: "secondary.main" }} />
                                    <Typography variant="subtitle2" fontWeight={700}>SNMP Data</Typography>
                                </Stack>
                                {isLoadingSnmp ? (
                                    <Stack spacing={1}>
                                        {[...Array(3)].map((_, i) => <Skeleton key={i} height={20} />)}
                                    </Stack>
                                ) : snmpData && Object.keys(snmpData as any).length > 0 ? (
                                    <Stack spacing={1.5} sx={{ maxHeight: 260, overflowY: "auto" }}>
                                        {Object.entries(snmpData as any).map(([category, items]: [string, any]) => (
                                            <Box key={category}>
                                                <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                                                    {category}
                                                </Typography>
                                                <Stack spacing={0.5} mt={0.5}>
                                                    {Array.isArray(items) ? items.slice(0, 5).map((item: any, i: number) => (
                                                        <Box
                                                            key={i}
                                                            sx={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                                py: 0.5,
                                                                px: 1,
                                                                borderRadius: 1,
                                                                "&:hover": { bgcolor: "grey.50" },
                                                            }}
                                                        >
                                                            <Typography variant="caption" color="text.secondary" sx={{ maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                {item.name}
                                                            </Typography>
                                                            <Typography variant="caption" fontWeight={600} fontFamily="monospace">
                                                                {item.lastvalue}
                                                            </Typography>
                                                        </Box>
                                                    )) : null}
                                                </Stack>
                                            </Box>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="caption" color="text.disabled">No SNMP data available</Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* Right: Traffic Chart */}
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Box
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    height: "100%",
                                }}
                            >
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <Speed sx={{ fontSize: 18, color: "success.main" }} />
                                    <Typography variant="subtitle2" fontWeight={700}>Traffic — Top Interfaces</Typography>
                                </Stack>
                                {isLoadingTraffic ? (
                                    <Box display="flex" justifyContent="center" alignItems="center" height={350}>
                                        <CircularProgress size={32} />
                                    </Box>
                                ) : trafficData && (trafficData as any).series && (trafficData as any).series.length > 0 ? (
                                    <Box sx={{ height: 380 }}>
                                        <LineChart
                                            xAxis={[{
                                                data: (trafficData as any).timestamps ? (trafficData as any).timestamps.map((t: number) => new Date(t * 1000)) : [],
                                                scaleType: "time"
                                            }]}
                                            series={(trafficData as any).series.map((s: any) => ({
                                                data: s.data,
                                                label: s.label,
                                                showMark: false,
                                                curve: "linear",
                                            }))}
                                            margin={{ left: 60, right: 20, top: 20, bottom: 30 }}
                                        />
                                    </Box>
                                ) : (
                                    <Box display="flex" height={350} alignItems="center" justifyContent="center" flexDirection="column" gap={1}>
                                        <Speed sx={{ fontSize: 40, color: "text.disabled" }} />
                                        <Typography color="text.secondary" variant="body2">No Traffic Data Available</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
