"use client";

import React from "react";
import { 
    Card, CardContent, Typography, Box, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton
} from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
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
            <Card variant="outlined" sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Card>
        );
    }

    if (isError || !data) {
        return (
            <Alert severity="error" sx={{ minHeight: 400 }}>
                Failed to load hosts: {error instanceof Error ? error.message : "No data"}
            </Alert>
        );
    }

    const hostList: any[] = Array.isArray(data) ? data : ((data as any).hosts || []);

    return (
        <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Host Availability ({hostList.length})
                </Typography>
                <TableContainer sx={{ maxHeight: 320 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Host</TableCell>
                                <TableCell>IP</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {hostList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No hosts found</TableCell>
                                </TableRow>
                            ) : (
                                hostList.slice(0, 10).map((h: any, idx: number) => {
                                    // Parse main IP interface
                                    const ip = h.interfaces?.find((i: any) => i.main === "1")?.ip || h.interfaces?.[0]?.ip || "-";
                                    const isAvailable = h.available === "1";
                                    const isUnknown = h.available === "0";

                                    return (
                                        <TableRow key={h.hostid || idx} hover sx={{ cursor: 'pointer' }} onClick={() => onSelectHost(h.hostid, h.name || h.host)}>
                                            <TableCell sx={{ fontWeight: 500 }}>{h.name || h.host}</TableCell>
                                            <TableCell>{ip}</TableCell>
                                            <TableCell>
                                                {isAvailable ? (
                                                    <Chip size="small" label="Available" color="success" variant="outlined" />
                                                ) : isUnknown ? (
                                                    <Chip size="small" label="Unknown" color="default" variant="outlined" />
                                                ) : (
                                                    <Chip size="small" label="Unavailable" color="error" variant="filled" />
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectHost(h.hostid, h.name || h.host);
                                                }}>
                                                    <OpenInNew fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
}
