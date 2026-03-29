"use client";

import React from "react";
import { Card, CardContent, Typography, Grid, Box, CircularProgress, Alert } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/apiv2/fetch";
import { paths } from "@/lib/apiv2/schema";

type TopMetricsData = paths["/api/v1/zabbix/dashboard/top-metrics"]["get"]["responses"]["200"]["content"]["application/json"];

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
            <Card variant="outlined" sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Card>
        );
    }

    if (isError || !data) {
        return (
            <Alert severity="error">
                Failed to load top metrics: {error instanceof Error ? error.message : "No data"}
            </Alert>
        );
    }

    // Cast as any, but I will log them to console if needed or adjust later.
    const metrics: any = data;

    const renderBarChart = (title: string, items: any[], dataKey: string, labelKey: string, color: string) => {
        if (!items || items.length === 0) {
            return (
                <Box height={250} display="flex" alignItems="center" justifyContent="center">
                    <Typography color="text.secondary">No data</Typography>
                </Box>
            );
        }

        const chartData = items.map(item => ({
            [labelKey]: item.name || item.host || "Unknown",
            [dataKey]: Number(item.value || 0),
        }));

        return (
            <Box height={250}>
                <Typography variant="subtitle2" gutterBottom align="center" color="text.secondary">
                    {title}
                </Typography>
                <BarChart
                    dataset={chartData}
                    yAxis={[{ scaleType: 'band', dataKey: labelKey }]}
                    series={[{ dataKey: dataKey, color }]}
                    layout="horizontal"
                    margin={{ left: 100, right: 10, top: 10, bottom: 20 }}
                />
            </Box>
        );
    };

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Card variant="outlined">
                    <CardContent>
                        {renderBarChart("Top CPU Usage (%)", metrics.top_cpu, "value", "name", "#1976d2")}
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Card variant="outlined">
                    <CardContent>
                        {renderBarChart("Top Memory Usage (%)", metrics.top_memory, "value", "name", "#9c27b0")}
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Card variant="outlined">
                    <CardContent>
                        {renderBarChart("Top Bandwidth (Mbps)", metrics.top_bandwidth, "value", "name", "#2e7d32")}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}
