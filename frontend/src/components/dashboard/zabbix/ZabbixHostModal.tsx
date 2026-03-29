"use client";

import React from "react";
import { 
    Dialog, DialogTitle, DialogContent, Typography, Box, IconButton, 
    CircularProgress, Alert, Grid, Divider, Chip
} from "@mui/material";
import { Close } from "@mui/icons-material";
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
    // 1. Fetch Detail
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

    // 2. Fetch Traffic
    const { data: trafficData, isLoading: isLoadingTraffic } = useQuery({
        queryKey: ["zabbix-host-traffic", hostId],
        queryFn: async () => {
            if (!hostId) return null;
            const res = await fetchClient.GET("/api/v1/zabbix/dashboard/hosts/{host_id}/traffic", {
                params: { path: { host_id: hostId }, query: { period: 1 } as any } // Last 1 hour maybe
            });
            if (res.error) throw new Error((res.error as any).detail || "Failed to fetch traffic");
            return res.data;
        },
        enabled: open && !!hostId,
    });

    // 3. Fetch SNMP Overview
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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography component="div" variant="h6" fontWeight={700}>Host Details: {hostName}</Typography>
                <IconButton onClick={onClose}><Close /></IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent>
                {isLoadingDetail && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
                {detailError ? <Alert severity="error">Failed to load host detail: {String(detailError)}</Alert> : null}
                
                {!isLoadingDetail && !detailError && detailData ? (
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Device Info</Typography>
                            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary">ID: {hostId}</Typography>
                                <Typography variant="body2" color="text.secondary">Name: {(detailData as any).host?.name || hostName}</Typography>
                                <Typography variant="body2" color="text.secondary">Status: {(detailData as any).host?.status === "0" ? "Monitored" : "Unmonitored"}</Typography>
                                <Box mt={1}>
                                    {((detailData as any).interfaces || []).map((iface: any, idx: number) => (
                                        <Chip key={idx} size="small" label={`IP: ${iface.ip}`} sx={{ mr: 0.5, mb: 0.5 }} />
                                    ))}
                                </Box>
                            </Box>
                            
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>SNMP Status</Typography>
                            {isLoadingSnmp ? <CircularProgress size={24} /> : (
                                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, maxHeight: 300, overflow: 'auto' }}>
                                    {/* Map through SNMP items */}
                                    {snmpData ? Object.entries(snmpData as any).map(([category, items]: [string, any]) => (
                                        <Box key={category} mb={1}>
                                            <Typography variant="caption" color="primary" fontWeight="bold">{category.toUpperCase()}</Typography>
                                            <Box pl={1}>
                                                {Array.isArray(items) ? items.slice(0, 5).map((item, i) => (
                                                    <Typography key={i} variant="caption" display="block">
                                                        {item.name}: {item.lastvalue}
                                                    </Typography>
                                                )) : null}
                                            </Box>
                                        </Box>
                                    )) : null}
                                    {!snmpData || Object.keys(snmpData || {}).length === 0 ? (
                                        <Typography variant="caption" color="text.secondary">No SNMP data available</Typography>
                                    ) : null}
                                </Box>
                            )}
                        </Grid>
                        
                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Recent Traffic (Top Interfaces)</Typography>
                            {isLoadingTraffic ? (
                                <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
                            ) : (
                                <Box sx={{ height: 400, bgcolor: 'grey.50', borderRadius: 1, p: 2 }}>
                                    {trafficData && (trafficData as any).series && (trafficData as any).series.length > 0 ? (
                                        <LineChart
                                            xAxis={[{ 
                                                data: (trafficData as any).timestamps ? (trafficData as any).timestamps.map((t: number) => new Date(t * 1000)) : [], 
                                                scaleType: 'time' 
                                            }]}
                                            series={(trafficData as any).series.map((s: any) => ({
                                                data: s.data,
                                                label: s.label,
                                                showMark: false,
                                                curve: 'linear',
                                            }))}
                                            margin={{ left: 60, right: 20, top: 20, bottom: 30 }}
                                        />
                                    ) : (
                                        <Box display="flex" height="100%" alignItems="center" justifyContent="center">
                                            <Typography color="text.secondary">No Traffic Data</Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
