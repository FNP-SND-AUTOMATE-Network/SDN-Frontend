"use client";

import React from "react";
import {
    Dialog, DialogTitle, DialogContent, Typography, Box, IconButton,
    CircularProgress, Alert, Grid, Divider, Chip, Stack, alpha, Skeleton, ToggleButtonGroup, ToggleButton
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
    const [trafficViewMode, setTrafficViewMode] = React.useState<"total" | "out" | "in">("total");

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
    const isMonitored = detail?.host?.status === "0" || detail?.host?.status === "enabled";

    const trafficTimestamps = React.useMemo(
        () => ((trafficData as any)?.timestamps || []).map((t: number) => new Date(t * 1000)),
        [trafficData]
    );

    const trafficSeries = React.useMemo(
        () =>
            (((trafficData as any)?.series || []) as any[]).map((s: any) => ({
                ...s,
                data: (s.data || []).map((v: any) => {
                    if (v === null || v === undefined) return null;
                    const n = Number(v);
                    return Number.isFinite(n) ? n : null;
                }),
            })),
        [trafficData]
    );

    const formatBps = React.useCallback((value: number | null | undefined) => {
        if (value === null || value === undefined || Number.isNaN(value)) return "0 bps";
        const abs = Math.abs(value);
        if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)} Gbps`;
        if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} Mbps`;
        if (abs >= 1_000) return `${(value / 1_000).toFixed(2)} Kbps`;
        return `${Math.round(value)} bps`;
    }, []);

    const pickDisplayUnit = React.useCallback((maxBps: number) => {
        if (maxBps >= 1_000_000_000) return "Gbps" as const;
        if (maxBps >= 1_000_000) return "Mbps" as const;
        if (maxBps >= 1_000) return "Kbps" as const;
        return "bps" as const;
    }, []);

    const formatInUnit = React.useCallback((value: number | null | undefined, unit: "bps" | "Kbps" | "Mbps" | "Gbps") => {
        if (value === null || value === undefined || Number.isNaN(value)) return `0 ${unit}`;
        if (unit === "Gbps") return `${(value / 1_000_000_000).toFixed(2)} Gbps`;
        if (unit === "Mbps") return `${(value / 1_000_000).toFixed(2)} Mbps`;
        if (unit === "Kbps") return `${(value / 1_000).toFixed(2)} Kbps`;
        return `${Math.round(value)} bps`;
    }, []);

    const trafficChartData = React.useMemo(() => {
        const parsed = trafficSeries.map((s: any) => {
            const rawLabel = String(s.label || "Unknown");
            const [ifacePart, directionPart = ""] = rawLabel.split(":");
            const iface = ifacePart.trim();
            const isIn = directionPart.toLowerCase().includes("in");
            const peak = (s.data || []).reduce((m: number, v: number | null) => {
                if (v === null || v === undefined || Number.isNaN(v)) return m;
                return Math.max(m, v);
            }, 0);
            return {
                ...s,
                iface,
                direction: isIn ? "in" : "out",
                peak,
            };
        });

        const interfacePeakMap = new Map<string, number>();
        parsed.forEach((s: any) => {
            interfacePeakMap.set(s.iface, Math.max(interfacePeakMap.get(s.iface) || 0, s.peak));
        });

        const activeInterfaces = [...interfacePeakMap.entries()]
            .filter(([, peak]) => peak > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([iface]) => iface);

        const palette = ["#2563eb", "#ef6c00", "#059669", "#7c3aed", "#d946ef", "#dc2626", "#0d9488", "#9333ea", "#475569", "#0284c7"];
        const colorByIface = new Map<string, string>();
        activeInterfaces.forEach((iface, idx) => {
            colorByIface.set(iface, palette[idx % palette.length]);
        });

        const interfaceDataMap = new Map<string, { inData: (number | null)[]; outData: (number | null)[] }>();
        activeInterfaces.forEach((iface) => {
            const inSeries = parsed.find((s: any) => s.iface === iface && s.direction === "in");
            const outSeries = parsed.find((s: any) => s.iface === iface && s.direction === "out");
            const fallbackLength = trafficTimestamps.length;
            interfaceDataMap.set(iface, {
                inData: inSeries?.data || Array.from({ length: fallbackLength }, () => null),
                outData: outSeries?.data || Array.from({ length: fallbackLength }, () => null),
            });
        });

        const chartMaxBps = activeInterfaces.reduce((maxVal, iface) => {
            const pair = interfaceDataMap.get(iface);
            if (!pair) return maxVal;
            const outData = pair.outData;
            const inData = pair.inData;
            const totalData = outData.map((v, idx) => (v ?? 0) + (inData[idx] ?? 0));
            const localMax = Math.max(
                ...totalData,
                ...outData.map((v) => v ?? 0),
                ...inData.map((v) => v ?? 0),
                0,
            );
            return Math.max(maxVal, localMax);
        }, 0);

        const displayUnit = pickDisplayUnit(chartMaxBps);

        const chartSeries = activeInterfaces
            .map((iface) => {
                const pair = interfaceDataMap.get(iface);
                if (!pair) return null;

                const outData = pair.outData;
                const inData = pair.inData;
                const totalData = outData.map((v, idx) => {
                    const outV = v ?? 0;
                    const inV = inData[idx] ?? 0;
                    return outV + inV;
                });

                if (trafficViewMode === "out") {
                    return {
                        data: outData,
                        label: `${iface} Out`,
                        color: colorByIface.get(iface),
                        showMark: false,
                        curve: "linear" as const,
                        connectNulls: true,
                        valueFormatter: (v: number | null) => formatInUnit(v, displayUnit),
                    };
                }

                if (trafficViewMode === "in") {
                    return {
                        data: inData,
                        label: `${iface} In`,
                        color: alpha(colorByIface.get(iface) || "#64748b", 0.8),
                        showMark: false,
                        curve: "linear" as const,
                        connectNulls: true,
                        valueFormatter: (v: number | null) => formatInUnit(v, displayUnit),
                    };
                }

                return {
                    data: totalData,
                    label: `${iface} Total`,
                    color: colorByIface.get(iface),
                    showMark: false,
                    curve: "linear" as const,
                    connectNulls: true,
                    valueFormatter: (v: number | null) => formatInUnit(v, displayUnit),
                };
            })
            .filter(Boolean) as any[];

        const summary = activeInterfaces.map((iface) => {
            const outSeries = parsed.find((s: any) => s.iface === iface && s.direction === "out");
            const inSeries = parsed.find((s: any) => s.iface === iface && s.direction === "in");
            const pair = interfaceDataMap.get(iface);
            const totalPeak = (pair?.outData || []).reduce((m: number, v: number | null, idx: number) => {
                const outV = v ?? 0;
                const inV = pair?.inData[idx] ?? 0;
                return Math.max(m, outV + inV);
            }, 0);
            return {
                iface,
                color: colorByIface.get(iface) || "#64748b",
                outPeak: outSeries?.peak || 0,
                inPeak: inSeries?.peak || 0,
                totalPeak,
            };
        });

        return { chartSeries, summary, activeInterfaceCount: activeInterfaces.length, displayUnit };
    }, [formatBps, formatInUnit, pickDisplayUnit, trafficSeries, trafficTimestamps.length, trafficViewMode]);

    const trafficYAxisLabel = React.useMemo(() => {
        if (trafficViewMode === "total") return `Total Traffic (${trafficChartData.displayUnit})`;
        if (trafficViewMode === "out") return `Outbound Traffic (${trafficChartData.displayUnit})`;
        return `Inbound Traffic (${trafficChartData.displayUnit})`;
    }, [trafficChartData.displayUnit, trafficViewMode]);

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
                                    {((detail?.host?.interfaces || []) as any[]).length === 0 ? (
                                        <Typography variant="caption" color="text.secondary">No interfaces</Typography>
                                    ) : (
                                        (detail.host.interfaces as any[]).map((iface: any, idx: number) => (
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
                                                    {Array.isArray(items) ? items.slice(0, 5).map((item: any, i: number) => {
                                                        const isLongValue = (item.lastvalue || "").length > 20;
                                                        return (
                                                        <Box
                                                            key={i}
                                                            sx={{
                                                                display: "flex",
                                                                flexDirection: isLongValue ? "column" : "row",
                                                                justifyContent: isLongValue ? "flex-start" : "space-between",
                                                                alignItems: isLongValue ? "flex-start" : "center",
                                                                gap: isLongValue ? 0.25 : 0,
                                                                py: 0.5,
                                                                px: 1,
                                                                borderRadius: 1,
                                                                "&:hover": { bgcolor: "grey.50" },
                                                            }}
                                                        >
                                                            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, minWidth: isLongValue ? "auto" : "40%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                {item.name}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                fontWeight={600}
                                                                fontFamily="monospace"
                                                                sx={{
                                                                    wordBreak: "break-word",
                                                                    textAlign: isLongValue ? "left" : "right",
                                                                    ...(isLongValue ? {
                                                                        fontSize: "0.68rem",
                                                                        lineHeight: 1.4,
                                                                        color: "text.primary",
                                                                        mt: 0.25,
                                                                    } : {}),
                                                                }}
                                                            >
                                                                {item.lastvalue}
                                                            </Typography>
                                                        </Box>
                                                        );
                                                    }) : null}
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
                                    <Typography variant="subtitle2" fontWeight={700}>Traffic — Active Interfaces</Typography>
                                    <ToggleButtonGroup
                                        size="small"
                                        exclusive
                                        value={trafficViewMode}
                                        onChange={(_, v) => {
                                            if (v) setTrafficViewMode(v);
                                        }}
                                        sx={{ ml: "auto", height: 28 }}
                                    >
                                        <ToggleButton value="total" sx={{ px: 1.25, py: 0, fontSize: "0.72rem" }}>Total (In+Out)</ToggleButton>
                                        <ToggleButton value="out" sx={{ px: 1.25, py: 0, fontSize: "0.72rem" }}>Out</ToggleButton>
                                        <ToggleButton value="in" sx={{ px: 1.25, py: 0, fontSize: "0.72rem" }}>In</ToggleButton>
                                    </ToggleButtonGroup>
                                </Stack>
                                {isLoadingTraffic ? (
                                    <Box display="flex" justifyContent="center" alignItems="center" height={350}>
                                        <CircularProgress size={32} />
                                    </Box>
                                ) : trafficChartData.chartSeries.length > 0 ? (
                                    <Box sx={{ width: "100%" }}>
                                        <Stack direction="row" spacing={1} mb={1.5} flexWrap="wrap" useFlexGap>
                                            {trafficChartData.summary.map((item) => (
                                                <Box
                                                    key={item.iface}
                                                    sx={{
                                                        flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)", md: "1 1 calc(33.333% - 8px)" },
                                                        minWidth: 0,
                                                        borderRadius: 1.5,
                                                        border: "1px solid",
                                                        borderColor: "divider",
                                                        px: 1.25,
                                                        py: 1,
                                                        bgcolor: alpha(item.color, 0.06),
                                                    }}
                                                >
                                                    <Typography variant="caption" fontWeight={700} sx={{ color: item.color }}>
                                                        {item.iface}
                                                    </Typography>
                                                    {trafficViewMode === "total" ? (
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            Total peak: {formatBps(item.totalPeak)}
                                                        </Typography>
                                                    ) : null}
                                                    {trafficViewMode !== "in" ? (
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            Out peak: {formatBps(item.outPeak)}
                                                        </Typography>
                                                    ) : null}
                                                    {trafficViewMode !== "out" ? (
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            In peak: {formatBps(item.inPeak)}
                                                        </Typography>
                                                    ) : null}
                                                </Box>
                                            ))}
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                            Showing {trafficChartData.activeInterfaceCount} interface(s) with traffic ({trafficViewMode === "total" ? "Total (In+Out)" : trafficViewMode.toUpperCase()})
                                        </Typography>
                                        {trafficViewMode === "total" ? (
                                            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                                Total is calculated as In + Out at each timestamp.
                                            </Typography>
                                        ) : null}
                                        <Box sx={{ height: 400, width: "100%" }}>
                                        <LineChart
                                            xAxis={[{
                                                data: trafficTimestamps,
                                                scaleType: "time",
                                                label: "Time",
                                            }]}
                                            yAxis={[{
                                                label: trafficYAxisLabel,
                                                scaleType: "sqrt",
                                                valueFormatter: (v: number) => formatInUnit(v, trafficChartData.displayUnit),
                                            }]}
                                            series={trafficChartData.chartSeries}
                                            grid={{ horizontal: true, vertical: false }}
                                            margin={{ left: 75, right: 20, top: 80, bottom: 50 }}
                                            sx={{
                                                ".MuiLineElement-root": {
                                                    strokeWidth: 2.2,
                                                },
                                                ".MuiChartsAxis-line": {
                                                    stroke: "#94a3b8",
                                                },
                                                ".MuiChartsGrid-line": {
                                                    stroke: "#e2e8f0",
                                                },
                                            }}
                                            slotProps={{
                                                legend: {
                                                    direction: "horizontal",
                                                    position: { vertical: "bottom", horizontal: "center" },
                                                }
                                            }}
                                        />
                                        </Box>
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
