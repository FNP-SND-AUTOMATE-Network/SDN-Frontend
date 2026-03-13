"use client";

import React from "react";
import { Box, Paper, Grid, Skeleton, Typography } from "@mui/material";

interface IPAMSkeletonProps {
    showStats?: boolean;
    sectionCount?: number;
}

function StatsCardSkeleton() {
    return (
        <Paper elevation={0} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <Skeleton variant="rounded" width={40} height={40} />
            <Box>
                <Skeleton variant="text" width={80} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width={48} height={32} />
            </Box>
        </Paper>
    );
}

function SectionRowSkeleton({ level = 0 }: { level?: number }) {
    const paddingLeft = level * 24 + 16;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                py: 1.5,
                px: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                pl: `${paddingLeft}px`,
            }}
        >
            <Skeleton variant="rounded" width={16} height={16} />
            <Skeleton variant="rounded" width={20} height={20} />
            <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={192} height={24} />
            </Box>
            <Skeleton variant="text" width={128} height={20} />
        </Box>
    );
}

export default function IPAMSkeleton({ showStats = true, sectionCount = 6 }: IPAMSkeletonProps) {
    return (
        <Box sx={{ p: 3 }}>
            {/* Header Skeleton */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Box>
                    <Skeleton variant="text" width={256} height={40} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width={384} height={24} />
                </Box>
                <Skeleton variant="rounded" width={128} height={40} />
            </Box>

            {/* Stats Cards Skeleton */}
            {showStats && (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                </Box>
            )}

            {/* Sections List Skeleton */}
            <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
                <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Skeleton variant="text" width={96} height={28} />
                </Box>

                <Box>
                    {Array.from({ length: sectionCount }).map((_, index) => {
                        const level = index === 0 ? 0 :
                            index === 1 || index === 2 ? 1 :
                                index === 3 ? 0 :
                                    index === 4 ? 1 : 0;
                        return <SectionRowSkeleton key={index} level={level} />;
                    })}
                </Box>
            </Paper>
        </Box>
    );
}

// Export individual components for flexibility
export { StatsCardSkeleton, SectionRowSkeleton };
