"use client";

import React from "react";
import { Box, Typography, Grid, Skeleton, Alert, LinearProgress, Stack, alpha } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/apiv2/fetch";
import { paths } from "@/lib/apiv2/schema";

type TopMetricsData = paths["/api/v1/zabbix/dashboard/top-metrics"]["get"]["responses"]["200"]["content"]["application/json"];

// Metric configs
const metricConfigs = [
    { key: "top_cpu", title: "CPU Usage", unit: "%", color: "#3b82f6", gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)", bgAccent: "#eff6ff" },
    { key: "top_memory", title: "Memory Usage", unit: "%", color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)", bgAccent: "#f5f3ff" },
    { key: "top_bandwidth", title: "Bandwidth", unit: "Mbps", color: "#10b981", gradient: "linear-gradient(135deg, #10b981, #059669)", bgAccent: "#ecfdf5" },
] as const;

function getProgressColor(value: number): string {
    if (value >= 90) return "#ef4444";
    if (value >= 70) return "#f59e0b";
    return "#22c55e";
}

const normalizeBandwidth = (val: number, unit: string) => {
    if (!unit) return val;
    const u = unit.toLowerCase();
    if (u === 'kbps' || u === 'k') return val * 1000;
    if (u === 'mbps' || u === 'm') return val * 1000 * 1000;
    if (u === 'gbps' || u === 'g') return val * 1000 * 1000 * 1000;
    return val;
};

export function ZabbixTopMetrics() {
    const { data, isLoading, isError, error } = useQuery<TopMetricsData>({
        queryKey: ["zabbix-top-metrics"],
        queryFn: async () => {
            const { data, error } = await fetchClient.GET("/api/v1/zabbix/dashboard/top-metrics");
            if (error) throw new Error((error as any).detail || "Failed to fetch top metrics");
            return data as TopMetricsData;
        },
        refetchInterval: 60000,
    });

    if (isLoading) {
        return (
            <Grid container spacing={2.5}>
                {[...Array(3)].map((_, i) => (
                    <Grid key={i} size={{ xs: 12, md: 4 }}>
                        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3 }} />
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (isError || !data) {
        return (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
                Failed to load top metrics: {error instanceof Error ? error.message : "No data"}
            </Alert>
        );
    }

    const metrics: any = data;

    return (
        <Grid container spacing={2.5}>
            {metricConfigs.map(({ key, title, unit, color, gradient, bgAccent }) => {
                const items: any[] = metrics[key] || [];
                const hasData = items.length > 0;

                return (
                    <Grid key={key} size={{ xs: 12, md: 4 }}>
                        <Box
                            sx={{
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                overflow: "hidden",
                                height: "100%",
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
                                    background: gradient,
                                    color: "white",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={700} letterSpacing={0.3}>
                                    {title}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                    Top {Math.min(items.length, 5)}
                                </Typography>
                            </Box>

                            {/* Content */}
                            <Box sx={{ p: 2 }}>
                                {!hasData ? (
                                    <Box sx={{ py: 6, textAlign: "center" }}>
                                        <Typography color="text.disabled" variant="body2">No data available</Typography>
                                    </Box>
                                ) : (
                                    <Stack spacing={1.5}>
                                        {items.slice(0, 5).map((item: any, idx: number) => {
                                            const value = Number(item.value || 0);
                                            const itemUnit = item.unit || unit;
                                            
                                            const displayValue = value % 1 === 0 ? value.toString() : value.toFixed(1);
                                            
                                            // Normalized calculation for progress bar
                                            let barPercent = 0;
                                            if (key === "top_bandwidth") {
                                                const maxVal = Math.max(...items.map((i: any) => normalizeBandwidth(Number(i.value || 0), i.unit || itemUnit)));
                                                const normalizedValue = normalizeBandwidth(value, itemUnit);
                                                barPercent = maxVal > 0 ? (normalizedValue / maxVal) * 100 : 0;
                                            } else {
                                                barPercent = Math.min(value, 100);
                                            }
                                            
                                            // Format name
                                            let displayName = "Unknown";
                                            if (key === "top_bandwidth") {
                                                const dir = item.direction ? `(${item.direction})` : "";
                                                displayName = `${item.host || ""} ${item.interface || ""} ${dir}`.trim();
                                            } else {
                                                const nameSection = item.name ? `- ${item.name.replace('Processor: ', '')}` : ''; // Simplify memory processor string if needed
                                                displayName = item.host ? `${item.host} ${nameSection}` : (item.name || "Unknown");
                                            }

                                            return (
                                                <Box key={idx}>
                                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Box
                                                                sx={{
                                                                    width: 20,
                                                                    height: 20,
                                                                    borderRadius: 1,
                                                                    bgcolor: alpha(color, 0.1),
                                                                    color: color,
                                                                    display: "grid",
                                                                    placeItems: "center",
                                                                    fontSize: "0.65rem",
                                                                    fontWeight: 700,
                                                                    flexShrink: 0
                                                                }}
                                                            >
                                                                {idx + 1}
                                                            </Box>
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight={500}
                                                                title={displayName}
                                                                sx={{
                                                                    maxWidth: 180,
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                {displayName}
                                                            </Typography>
                                                        </Box>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={700}
                                                            color={itemUnit === "%" || unit === "%" ? getProgressColor(value) : "text.primary"}
                                                            sx={{ whiteSpace: "nowrap", pl: 1 }}
                                                        >
                                                            {displayValue} {itemUnit}
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={barPercent}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            bgcolor: alpha(color, 0.08),
                                                            "& .MuiLinearProgress-bar": {
                                                                borderRadius: 3,
                                                                bgcolor: itemUnit === "%" || unit === "%" ? getProgressColor(value) : color,
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                );
            })}
        </Grid>
    );
}
