"use client";

import React, { useState } from "react";
import { Box, Grid, Typography } from "@mui/material";

import { ZabbixSummaryCards } from "./ZabbixSummaryCards";
import { ZabbixTopMetrics } from "./ZabbixTopMetrics";
import { ZabbixActiveProblems } from "./ZabbixActiveProblems";
import { ZabbixHostsQuickView } from "./ZabbixHostsQuickView";
import { ZabbixHostModal } from "./ZabbixHostModal";

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

    // Auto-refresh is managed inside components via react-query refetchInterval

    return (
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Top Row: Global Overview Summary */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: -1 }}>
                Network Observability Overview
            </Typography>
            <Box>
                <ZabbixSummaryCards />
            </Box>

            {/* Middle Row: Top Metrics Grid */}
            <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: -1 }}>
                Top Resource Consumers
            </Typography>
            <Box>
                <ZabbixTopMetrics />
            </Box>

            {/* Bottom Row: Active Problems & Host Quick View */}
            <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: -1 }}>
                System Status
            </Typography>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <ZabbixActiveProblems />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <ZabbixHostsQuickView onSelectHost={handleSelectHost} />
                </Grid>
            </Grid>

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
