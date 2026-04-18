"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Typography, Alert,
    Chip, Stack, Tooltip, Skeleton, alpha,
    FormControl, Select, MenuItem, Pagination
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/apiv2/fetch";
import { paths } from "@/lib/apiv2/schema";

type ProblemsData = paths["/api/v1/zabbix/dashboard/problems"]["get"]["responses"]["200"]["content"]["application/json"];

type TimeRangeOption = {
    value: string;
    label: string;
    seconds: number | null;
};

type TimeRangeOptionsResponse = {
    default?: string;
    options?: TimeRangeOption[];
};

const fallbackTimeRangeOptions: TimeRangeOption[] = [
    { value: "1h", label: "Last 1 hour", seconds: 3600 },
    { value: "1d", label: "Last 1 day", seconds: 86400 },
    { value: "1w", label: "Last 1 week", seconds: 604800 },
    { value: "1mo", label: "Last 1 month", seconds: 2592000 },
    { value: "1y", label: "Last 1 year", seconds: 31536000 },
    { value: "all", label: "All time", seconds: null },
];

const severityConfig: Record<string, { label: string; color: string; bg: string; chipColor: "default" | "info" | "success" | "warning" | "error" }> = {
    "0": { label: "N/A", color: "#9e9e9e", bg: "#f5f5f5", chipColor: "default" },
    "1": { label: "Info", color: "#2196f3", bg: "#e3f2fd", chipColor: "info" },
    "2": { label: "Warning", color: "#ff9800", bg: "#fff3e0", chipColor: "warning" },
    "3": { label: "Average", color: "#ff9800", bg: "#fff3e0", chipColor: "warning" },
    "4": { label: "High", color: "#f44336", bg: "#fce4ec", chipColor: "error" },
    "5": { label: "Disaster", color: "#b71c1c", bg: "#ffebee", chipColor: "error" },
};

function formatTimeAgo(clock: string | number): string {
    const ts = Number(clock) * 1000;
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

type ZabbixActiveProblemsProps = {
    timeRange: string;
    onTimeRangeChange: (value: string) => void;
};

export function ZabbixActiveProblems({
    timeRange,
    onTimeRangeChange,
}: ZabbixActiveProblemsProps) {
    const PAGE_SIZE = 15;
    const [page, setPage] = useState(1);

    const timeRangeQuery = useQuery<TimeRangeOptionsResponse>({
        queryKey: ["zabbix-problems-time-ranges"],
        queryFn: async () => {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${baseUrl}/api/v1/zabbix/dashboard/problems/time-ranges`, {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch problem time ranges");
            }

            return (await response.json()) as TimeRangeOptionsResponse;
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    const timeRangeOptions = useMemo(() => {
        return timeRangeQuery.data?.options?.length
            ? timeRangeQuery.data.options
            : fallbackTimeRangeOptions;
    }, [timeRangeQuery.data]);

    const currentTimeRange = useMemo(() => {
        const exists = timeRangeOptions.some((opt) => opt.value === timeRange);
        if (exists) return timeRange;
        return timeRangeQuery.data?.default || "1w";
    }, [timeRange, timeRangeOptions, timeRangeQuery.data]);

    useEffect(() => {
        if (timeRange !== currentTimeRange) {
            onTimeRangeChange(currentTimeRange);
        }
    }, [timeRange, currentTimeRange, onTimeRangeChange]);

    useEffect(() => {
        setPage(1);
    }, [currentTimeRange]);

    const { data, isLoading, isError, error } = useQuery<ProblemsData>({
        queryKey: ["zabbix-problems", currentTimeRange, page, PAGE_SIZE],
        queryFn: async () => {
            const { data, error } = await fetchClient.GET(
                "/api/v1/zabbix/dashboard/problems",
                {
                    params: {
                        query: {
                            time_range: currentTimeRange,
                            page,
                            page_size: PAGE_SIZE,
                        },
                    },
                } as any,
            );
            if (error) throw new Error((error as any).detail || "Failed to fetch problems");
            return data as ProblemsData;
        },
        refetchInterval: 30000,
    });

    const rawData = data as any;
    const problemList: any[] = Array.isArray(rawData?.problems) ? rawData.problems : [];
    const severityCounts: Record<string, number> = rawData?.severity_counts || {};
    const totalProblems = Number(rawData?.total ?? problemList.length) || 0;
    const pageSize = Number(rawData?.page_size ?? PAGE_SIZE) || PAGE_SIZE;
    const totalPages = Math.max(1, Number(rawData?.total_pages ?? Math.ceil(totalProblems / pageSize)) || 1);
    const currentPage = Math.max(1, Math.min(Number(rawData?.page ?? page) || page, totalPages));
    const startItem = totalProblems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = totalProblems === 0 ? 0 : Math.min(startItem + problemList.length - 1, totalProblems);

    useEffect(() => {
        if (!data) return;
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [data, page, totalPages]);

    if (isLoading) {
        return (
            <Box sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                <Box sx={{ px: 2.5, py: 1.5, bgcolor: "grey.50" }}>
                    <Skeleton width={160} height={24} />
                </Box>
                <Stack spacing={0}>
                    {[...Array(5)].map((_, i) => (
                        <Box key={i} sx={{ px: 2.5, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                            <Skeleton width="80%" height={20} />
                            <Skeleton width="40%" height={16} sx={{ mt: 0.5 }} />
                        </Box>
                    ))}
                </Stack>
            </Box>
        );
    }

    if (isError || !data) {
        return (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
                Failed to load problems: {error instanceof Error ? error.message : "No data"}
            </Alert>
        );
    }

    return (
        <Box
            sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                height: "100%",
                display: "flex",
                flexDirection: "column",
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
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "grey.50",
                }}
            >
                <Typography variant="subtitle2" fontWeight={700}>
                    Active Problems
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 128, mr: 0.5 }}>
                        <Select
                            value={currentTimeRange}
                            onChange={(event) => onTimeRangeChange(event.target.value)}
                            sx={{
                                height: 28,
                                fontSize: "0.75rem",
                                borderRadius: 1.5,
                                bgcolor: "background.paper",
                                ".MuiSelect-select": { py: 0.25, px: 1.25 },
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        borderRadius: 2,
                                        mt: 0.5,
                                    },
                                },
                            }}
                        >
                            {timeRangeOptions.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.8rem" }}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {(["5", "4", "3", "2"] as const).map((sKey) => {
                        const count = severityCounts[sKey] || 0;
                        if (count === 0) return null;
                        const sConf = severityConfig[sKey];
                        return (
                            <Tooltip key={sKey} title={`${sConf.label}: ${count}`} arrow>
                                <Chip
                                    size="small"
                                    label={`${sConf.label.charAt(0)} ${count}`}
                                    sx={{
                                        fontSize: "0.65rem",
                                        height: 22,
                                        fontWeight: 700,
                                        bgcolor: alpha(sConf.color, 0.1),
                                        color: sConf.color,
                                    }}
                                />
                            </Tooltip>
                        );
                    })}
                    <Chip
                        label={totalProblems}
                        size="small"
                        color={totalProblems > 0 ? "error" : "default"}
                        sx={{ fontWeight: 700, minWidth: 32 }}
                    />
                </Stack>
            </Box>

            {/* Problem List */}
            <Box sx={{ flex: 1, overflowY: "auto", maxHeight: 400 }}>
                {problemList.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: "center" }}>
                        <Typography variant="h4" sx={{ mb: 1 }}>✅</Typography>
                        <Typography color="text.secondary" variant="body2" fontWeight={500}>
                            No active problems
                        </Typography>
                        <Typography color="text.disabled" variant="caption">
                            All systems operating normally
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={0}>
                        {problemList.map((p: any, idx: number) => {
                            const sev = severityConfig[String(p.severity)] || severityConfig["0"];
                            const timeAgo = p.clock ? formatTimeAgo(p.clock) : "Unknown";
                            const fullTime = p.clock ? new Date(Number(p.clock) * 1000).toLocaleString() : "";

                            return (
                                <Box
                                    key={p.eventid || idx}
                                    sx={{
                                        px: 2.5,
                                        py: 1.5,
                                        borderBottom: "1px solid",
                                        borderColor: "divider",
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 1.5,
                                        transition: "background 0.15s",
                                        "&:hover": { bgcolor: "action.hover" },
                                        "&:last-child": { borderBottom: 0 },
                                    }}
                                >
                                    {/* Severity dot */}
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: "50%",
                                            bgcolor: sev.color,
                                            mt: 0.8,
                                            flexShrink: 0,
                                            animation: Number(p.severity) >= 4 ? "pulse 2s infinite" : "none",
                                            "@keyframes pulse": {
                                                "0%, 100%": { opacity: 1 },
                                                "50%": { opacity: 0.4 },
                                            },
                                        }}
                                    />
                                    <Box flex={1} minWidth={0}>
                                        <Typography
                                            variant="body2"
                                            fontWeight={500}
                                            sx={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {p.name || p.description}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                                            <Typography variant="caption" color="text.secondary">
                                                {p.host || "Unknown Host"}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled">•</Typography>
                                            <Tooltip title={fullTime} arrow placement="top">
                                                <Typography variant="caption" color="text.disabled">
                                                    {timeAgo}
                                                </Typography>
                                            </Tooltip>
                                        </Stack>
                                    </Box>
                                    <Chip
                                        size="small"
                                        label={sev.label}
                                        sx={{
                                            fontSize: "0.65rem",
                                            height: 22,
                                            fontWeight: 600,
                                            bgcolor: sev.bg,
                                            color: sev.color,
                                            flexShrink: 0,
                                        }}
                                    />
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Box>

            {totalProblems > pageSize && (
                <Box
                    sx={{
                        px: 2,
                        py: 1.25,
                        borderTop: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        flexWrap: "wrap",
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        Showing {startItem}-{endItem} of {totalProblems}
                    </Typography>
                    <Pagination
                        size="small"
                        color="primary"
                        page={currentPage}
                        count={totalPages}
                        onChange={(_, nextPage) => setPage(nextPage)}
                        siblingCount={1}
                        boundaryCount={1}
                    />
                </Box>
            )}
        </Box>
    );
}
