"use client";

import React from "react";
import { Box, Typography, Grid, Skeleton, Alert, alpha } from "@mui/material";
import {
    Storage, ErrorOutline, CheckCircleOutline,
    CheckCircle, WarningAmber, Error as ErrorIcon, Warning,
    TrendingUp, Shield, Dns
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/apiv2/fetch";
import { paths } from "@/lib/apiv2/schema";

type OverviewData = paths["/api/v1/zabbix/dashboard/overview"]["get"]["responses"]["200"]["content"]["application/json"];

// Severity card config
const severityCards = [
    { key: "disaster", label: "Disaster", icon: ErrorIcon, gradient: "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)", lightBg: "#fde8e8" },
    { key: "high", label: "High", icon: Warning, gradient: "linear-gradient(135deg, #e65100 0%, #bf360c 100%)", lightBg: "#fff3e0" },
    { key: "average", label: "Average", icon: WarningAmber, gradient: "linear-gradient(135deg, #f9a825 0%, #f57f17 100%)", lightBg: "#fffde7" },
    { key: "warning", label: "Warning", icon: CheckCircle, gradient: "linear-gradient(135deg, #0288d1 0%, #01579b 100%)", lightBg: "#e1f5fe" },
] as const;

export function ZabbixSummaryCards() {
    const { data, isLoading, isError, error } = useQuery<OverviewData>({
        queryKey: ["zabbix-overview"],
        queryFn: async () => {
            const { data, error } = await fetchClient.GET("/api/v1/zabbix/dashboard/overview");
            if (error) throw error;
            return data as OverviewData;
        },
        refetchInterval: 60000,
    });

    if (isLoading) {
        return (
            <Grid container spacing={2.5}>
                {[...Array(5)].map((_, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: i === 0 ? 4 : 2 }}>
                        <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (isError) {
        return (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
                Failed to load summary: {error instanceof Error ? error.message : "Network error"}
            </Alert>
        );
    }

    if (!data) return null;

    const d = data as any;
    const totalHosts = d.hosts?.total || 0;
    const available = d.hosts?.available || 0;
    const unavailable = d.hosts?.unavailable || 0;
    const healthPercent = totalHosts > 0 ? Math.round((available / totalHosts) * 100) : 0;

    return (
        <Grid container spacing={2.5}>
            {/* Main Host Card */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Box
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)",
                        color: "white",
                        height: "100%",
                        minHeight: 140,
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Background decoration */}
                    <Box
                        sx={{
                            position: "absolute",
                            right: -20,
                            top: -20,
                            width: 120,
                            height: 120,
                            borderRadius: "50%",
                            bgcolor: "rgba(255,255,255,0.06)",
                        }}
                    />
                    <Box
                        sx={{
                            position: "absolute",
                            right: 20,
                            bottom: -30,
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            bgcolor: "rgba(255,255,255,0.04)",
                        }}
                    />

                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" position="relative">
                        <Box>
                            <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1 }}>
                                Total Hosts
                            </Typography>
                            <Typography variant="h3" fontWeight={800} sx={{ mt: -0.5 }}>
                                {totalHosts}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                bgcolor: "rgba(255,255,255,0.15)",
                                display: "grid",
                                placeItems: "center",
                            }}
                        >
                            <Dns sx={{ fontSize: 28 }} />
                        </Box>
                    </Box>

                    <Box display="flex" gap={3} mt={2}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <CheckCircleOutline sx={{ fontSize: 16, opacity: 0.9 }} />
                            <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.95 }}>
                                {available} Online
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <ErrorOutline sx={{ fontSize: 16, opacity: 0.9 }} />
                            <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.95 }}>
                                {unavailable} Offline
                            </Typography>
                        </Box>
                    </Box>

                    {/* Health bar */}
                    <Box mt={1.5}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>Uptime Health</Typography>
                            <Typography variant="caption" fontWeight={700}>{healthPercent}%</Typography>
                        </Box>
                        <Box sx={{ height: 5, borderRadius: 3, bgcolor: "rgba(255,255,255,0.15)" }}>
                            <Box
                                sx={{
                                    height: "100%",
                                    borderRadius: 3,
                                    width: `${healthPercent}%`,
                                    bgcolor: healthPercent > 80 ? "#66bb6a" : healthPercent > 50 ? "#ffa726" : "#ef5350",
                                    transition: "width 0.8s ease-in-out",
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Grid>

            {/* Severity Cards */}
            {severityCards.map(({ key, label, icon: Icon, gradient, lightBg }) => {
                const count = d.problems?.[key] || 0;
                return (
                    <Grid key={key} size={{ xs: 6, sm: 3, md: 2 }}>
                        <Box
                            sx={{
                                p: 2.5,
                                borderRadius: 3,
                                bgcolor: count > 0 ? lightBg : "grey.50",
                                border: "1px solid",
                                borderColor: count > 0 ? alpha(lightBg, 0.5) : "divider",
                                height: "100%",
                                minHeight: 140,
                                display: "flex",
                                flexDirection: "column",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 2,
                                    background: count > 0 ? gradient : "linear-gradient(135deg, #9e9e9e, #bdbdbd)",
                                    display: "grid",
                                    placeItems: "center",
                                    mb: 1.5,
                                }}
                            >
                                <Icon sx={{ fontSize: 20, color: "white" }} />
                            </Box>
                            <Typography variant="h4" fontWeight={800} color={count > 0 ? "text.primary" : "text.disabled"}>
                                {count}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mt: "auto", letterSpacing: 0.5 }}>
                                {label}
                            </Typography>
                        </Box>
                    </Grid>
                );
            })}
        </Grid>
    );
}
