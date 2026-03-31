"use client";

import React, { useState } from "react";
import { Box, Grid, Typography, Stack, alpha } from "@mui/material";

import { ZabbixSummaryCards } from "./ZabbixSummaryCards";
import { ZabbixTopMetrics } from "./ZabbixTopMetrics";
import { ZabbixActiveProblems } from "./ZabbixActiveProblems";
import { ZabbixHostsQuickView } from "./ZabbixHostsQuickView";
import { ZabbixHostModal } from "./ZabbixHostModal";

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ letterSpacing: "-0.01em" }}>
                {title}
            </Typography>
            {subtitle && (
                <Typography variant="caption" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
}

export function ZabbixDashboardView() {
    const [selectedHostId, setSelectedHostId] = useState<string | null>(null);
    const [selectedHostName, setSelectedHostName] = useState<string>("");
    const [isHostModalOpen, setIsHostModalOpen] = useState(false);

    const handleSelectHost = (hostId: string, hostName: string) => {
        setSelectedHostId(hostId);
        setSelectedHostName(hostName);
        setIsHostModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsHostModalOpen(false);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Section 1: Summary Cards */}
            <Box>
                <SectionHeader
                    title="Overview"
                    subtitle="Host availability and active problem severity"
                />
                <ZabbixSummaryCards />
            </Box>

            {/* Section 2: Top Resource Consumers */}
            <Box>
                <SectionHeader
                    title="Top Resource Consumers"
                    subtitle="Hosts with highest resource utilization — auto-refreshed every 60s"
                />
                <ZabbixTopMetrics />
            </Box>

            {/* Section 3: Problems & Hosts */}
            <Box>
                <SectionHeader
                    title="System Status"
                    subtitle="Live problems and host availability — click a host for detailed metrics"
                />
                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <ZabbixActiveProblems />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <ZabbixHostsQuickView onSelectHost={handleSelectHost} />
                    </Grid>
                </Grid>
            </Box>

            {/* Host Detail Modal */}
            <ZabbixHostModal
                open={isHostModalOpen}
                onClose={handleCloseModal}
                hostId={selectedHostId}
                hostName={selectedHostName}
            />
        </Box>
    );
}
