"use client";

import React from "react";
import { 
    Card, CardContent, Typography, Box, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip 
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/apiv2/fetch";
import { paths } from "@/lib/apiv2/schema";

type ProblemsData = paths["/api/v1/zabbix/dashboard/problems"]["get"]["responses"]["200"]["content"]["application/json"];

export function ZabbixActiveProblems() {
    const { data, isLoading, isError, error } = useQuery<ProblemsData>({
        queryKey: ["zabbix-problems"],
        queryFn: async () => {
            const { data, error } = await fetchClient.GET("/api/v1/zabbix/dashboard/problems");
            if (error) throw new Error((error as any).detail || "Failed to fetch problems");
            return data as ProblemsData;
        },
        refetchInterval: 30000,
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
            <Alert severity="error">
                Failed to load problems: {error instanceof Error ? error.message : "No data"}
            </Alert>
        );
    }

    const { problems } = data as any; // Cast for now, will refine type if needed by IDE
    const problemList: any[] = Array.isArray(problems) ? problems : [];

    // Severity mapping
    // 0 = Not classified, 1 = Information, 2 = Warning, 3 = Average, 4 = High, 5 = Disaster
    const getSeverityLabel = (sev: number | string) => {
        const severityMap: Record<string, { label: string, color: "default" | "info" | "success" | "warning" | "error" }> = {
            "0": { label: "Not classified", color: "default" },
            "1": { label: "Information", color: "info" },
            "2": { label: "Warning", color: "success" }, // using info/success just for differentiation
            "3": { label: "Average", color: "warning" },
            "4": { label: "High", color: "warning" },
            "5": { label: "Disaster", color: "error" },
        };
        return severityMap[String(sev)] || { label: "Unknown", color: "default" };
    };

    return (
        <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Recent Problems ({problemList.length})
                </Typography>
                <TableContainer sx={{ maxHeight: 320 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Time</TableCell>
                                <TableCell>Host</TableCell>
                                <TableCell>Problem</TableCell>
                                <TableCell>Severity</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {problemList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No active problems</TableCell>
                                </TableRow>
                            ) : (
                                problemList.slice(0, 10).map((p: any, idx: number) => {
                                    const sevInfo = getSeverityLabel(p.severity);
                                    // Use clock (Unix timestamp) if available
                                    const timeStr = p.clock 
                                        ? new Date(Number(p.clock) * 1000).toLocaleString() 
                                        : "Unknown";

                                    return (
                                        <TableRow key={p.eventid || idx} hover>
                                            <TableCell>{timeStr}</TableCell>
                                            <TableCell>{p.host || "Unknown"}</TableCell>
                                            <TableCell sx={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {p.name || p.description}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    size="small" 
                                                    label={sevInfo.label} 
                                                    color={sevInfo.color} 
                                                    variant={sevInfo.color === "error" || sevInfo.color === "warning" ? "filled" : "outlined"} 
                                                />
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
