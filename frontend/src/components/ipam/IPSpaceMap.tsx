"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { $api } from "@/lib/apiv2/fetch";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Tooltip,
    Alert,
    Button,
    Pagination,
    Chip,
} from "@mui/material";
import {
    NavigateBefore as PrevIcon,
    NavigateNext as NextIcon,
} from "@mui/icons-material";

// phpIPAM address tag statuses
const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    offline:     { color: "#94a3b8", label: "Offline" },
    used:        { color: "#f59e0b", label: "Used" },
    active:      { color: "#f59e0b", label: "Active" },
    used_child:  { color: "#fb923c", label: "Child Subnet" },
    reserved:    { color: "#6366f1", label: "Reserved" },
    dhcp:        { color: "#06b6d4", label: "DHCP" },
    gateway:     { color: "#a855f7", label: "Gateway" },
    free:        { color: "#22c55e", label: "Free" },
    available:   { color: "#22c55e", label: "Available" },
    unreachable: { color: "#ef4444", label: "Unreachable" },
};

function getStatusConfig(status: string) {
    const key = status.toLowerCase().trim();
    return STATUS_CONFIG[key] || { color: "#22c55e", label: status || "Free" };
}

const PAGE_SIZE = 256; // IPs per page

export default function IPSpaceMap({ subnetId }: { subnetId: string }) {
    const [page, setPage] = useState(0);
    const gridRef = useRef<HTMLDivElement>(null);

    // Reset page when subnet changes
    useEffect(() => { setPage(0); }, [subnetId]);

    const offset = page * PAGE_SIZE;

    const { data: spaceMapData, isLoading, error, isFetching } = $api.useQuery(
        "get",
        "/ipam/subnets/{subnet_id}/space-map",
        {
            params: {
                path: { subnet_id: subnetId },
                query: { offset, limit: PAGE_SIZE } as any,
            },
        },
        {
            enabled: !!subnetId,
            keepPreviousData: true,
        }
    );

    const totalHosts = spaceMapData?.total_hosts || 0;
    const totalPages = Math.max(1, Math.ceil(totalHosts / PAGE_SIZE));
    const entries = spaceMapData?.addresses || [];
    const hasMore = (spaceMapData as any)?.has_more ?? false;

    const handlePageChange = useCallback((_: any, newPage: number) => {
        setPage(newPage - 1); // MUI Pagination is 1-indexed
        gridRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    if (isLoading && entries.length === 0) {
        return (
            <Paper elevation={0} sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <CircularProgress />
            </Paper>
        );
    }

    if (error) {
        return (
            <Alert severity="error">
                Failed to load space map: {(error as any)?.message || "Unknown error"}
            </Alert>
        );
    }

    if (entries.length === 0 && !isFetching) {
        return (
            <Paper elevation={0} sx={{ p: 4, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Typography color="text.secondary">No space map data available for this subnet</Typography>
            </Paper>
        );
    }

    // Collect unique statuses for the legend
    const uniqueStatuses = Array.from(
        new Set(entries.map((a: any) => a.status.toLowerCase().trim()))
    );

    // Calculate IP range label for current page
    const firstIp = entries.length > 0 ? entries[0].ip : "";
    const lastIp = entries.length > 0 ? entries[entries.length - 1].ip : "";

    return (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                        IP Space Map — {spaceMapData?.subnet}/{spaceMapData?.mask}
                    </Typography>
                    {totalPages > 1 && (
                        <Chip
                            label={`${firstIp} — ${lastIp}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem" }}
                        />
                    )}
                    {isFetching && <CircularProgress size={16} sx={{ ml: 1 }} />}
                </Box>
                {/* Legend */}
                <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                    {uniqueStatuses.map((s) => {
                        const cfg = getStatusConfig(s);
                        return (
                            <Box key={s} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Box sx={{ width: 12, height: 12, bgcolor: cfg.color, borderRadius: 0.5, flexShrink: 0 }} />
                                <Typography variant="caption">{cfg.label}</Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            {/* Grid */}
            <Box
                ref={gridRef}
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(16, 1fr)",
                    gap: "3px",
                    maxHeight: 400,
                    overflowY: "auto",
                    position: "relative",
                    opacity: isFetching ? 0.6 : 1,
                    transition: "opacity 0.2s",
                }}
            >
                {entries.map((addr: any) => {
                    const cfg = getStatusConfig(addr.status);
                    const chunks = addr.ip.split(".");
                    const lastOctet = chunks.length === 4 ? chunks[3] : "";

                    return (
                        <Tooltip
                            key={addr.ip}
                            title={
                                <Box sx={{ p: 0.5 }}>
                                    <Typography variant="caption" fontWeight="bold" display="block">{addr.ip}</Typography>
                                    <Typography variant="caption" display="block">Status: {cfg.label}</Typography>
                                    {addr.hostname && <Typography variant="caption" display="block">Host: {addr.hostname}</Typography>}
                                    {addr.description && <Typography variant="caption" display="block">Desc: {addr.description}</Typography>}
                                </Box>
                            }
                            arrow
                            placement="top"
                        >
                            <Box
                                sx={{
                                    height: 28,
                                    bgcolor: cfg.color,
                                    borderRadius: 0.5,
                                    opacity: 0.85,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.15s ease-in-out",
                                    "&:hover": {
                                        opacity: 1,
                                        transform: "scale(1.15)",
                                        zIndex: 1,
                                        boxShadow: "0 4px 12px rgb(0 0 0 / 0.2)",
                                    }
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: "0.55rem",
                                        color: "white",
                                        fontWeight: 600,
                                        userSelect: "none",
                                        lineHeight: 1,
                                    }}
                                >
                                    {lastOctet}
                                </Typography>
                            </Box>
                        </Tooltip>
                    );
                })}
            </Box>

            {/* Footer: Pagination + Stats */}
            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    Total: {totalHosts.toLocaleString()} hosts — Used: {spaceMapData?.used || 0} | Free: {spaceMapData?.free || 0}
                </Typography>

                {totalPages > 1 && (
                    <Pagination
                        count={totalPages}
                        page={page + 1}
                        onChange={handlePageChange}
                        size="small"
                        color="primary"
                        showFirstButton
                        showLastButton
                        siblingCount={1}
                    />
                )}
            </Box>
        </Paper>
    );
}
