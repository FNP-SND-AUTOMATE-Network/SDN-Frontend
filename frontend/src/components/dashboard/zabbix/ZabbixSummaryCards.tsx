"use client";

import React from "react";
import { Card, CardContent, Typography, Grid, Box, CircularProgress, Alert } from "@mui/material";
import { Storage, Warning, ErrorOutline, CheckCircleOutline, CheckCircle, WarningAmber, Error as ErrorIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/apiv2/fetch";
import { paths } from "@/lib/apiv2/schema";

type OverviewData = paths["/api/v1/zabbix/dashboard/overview"]["get"]["responses"]["200"]["content"]["application/json"];

export function ZabbixSummaryCards() {
    const { data, isLoading, isError, error } = useQuery<OverviewData>({
        queryKey: ["zabbix-overview"],
        queryFn: async () => {
            const { data, error } = await fetchClient.GET("/api/v1/zabbix/dashboard/overview");
            if (error) throw error;
            return data as OverviewData;
        },
        refetchInterval: 60000, // Refresh every 1 minute
    });

    if (isLoading) {
        return (
            <Card variant="outlined" sx={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={32} />
            </Card>
        );
    }

    if (isError) {
        return (
            <Alert severity="error">
                Failed to load summary: {error instanceof Error ? error.message : "Network error"}
            </Alert>
        );
    }

    if (!data) return null;

    return (
        <Grid container spacing={3}>
            {/* Hosts Overview */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Card variant="outlined" sx={{ height: '100%', borderColor: 'success.light' }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography color="text.secondary" gutterBottom variant="overline">
                                    Total Hosts
                                </Typography>
                                <Typography variant="h3" component="div">
                                    {((data as any).hosts?.total) || 0}
                                </Typography>
                            </Box>
                            <Storage color="primary" sx={{ fontSize: 40, opacity: 0.8 }} />
                        </Box>
                        <Box display="flex" gap={2} mt={2}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <CheckCircleOutline color="success" fontSize="small" />
                                <Typography variant="body2" color="success.main">
                                    {((data as any).hosts?.available) || 0} Available
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <ErrorOutline color="error" fontSize="small" />
                                <Typography variant="body2" color="error.main">
                                    {((data as any).hosts?.unavailable) || 0} Unavailable
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Problems Overview */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Card variant="outlined" sx={{ height: '100%', borderColor: 'warning.light' }}>
                    <CardContent>
                        <Typography color="text.secondary" gutterBottom variant="overline">
                            Active Problems Breakdown
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                <Box textAlign="center" p={1} bgcolor="error.main" color="white" borderRadius={1}>
                                    <ErrorIcon sx={{ fontSize: 24, mb: 0.5 }} />
                                    <Typography variant="h5" fontWeight="bold">{(data as any).problems?.disaster || 0}</Typography>
                                    <Typography variant="caption">Disaster</Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                <Box textAlign="center" p={1} bgcolor="warning.dark" color="white" borderRadius={1}>
                                    <Warning sx={{ fontSize: 24, mb: 0.5 }} />
                                    <Typography variant="h5" fontWeight="bold">{(data as any).problems?.high || 0}</Typography>
                                    <Typography variant="caption">High</Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                <Box textAlign="center" p={1} bgcolor="warning.main" color="white" borderRadius={1}>
                                    <WarningAmber sx={{ fontSize: 24, mb: 0.5 }} />
                                    <Typography variant="h5" fontWeight="bold">{(data as any).problems?.average || 0}</Typography>
                                    <Typography variant="caption">Average</Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                <Box textAlign="center" p={1} bgcolor="info.main" color="white" borderRadius={1}>
                                    <CheckCircle sx={{ fontSize: 24, mb: 0.5 }} />
                                    <Typography variant="h5" fontWeight="bold">{(data as any).problems?.warning || 0}</Typography>
                                    <Typography variant="caption">Warning</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}
