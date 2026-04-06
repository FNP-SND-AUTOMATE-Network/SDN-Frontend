"use client";

import { useState } from "react";
import {
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    Divider
} from "@mui/material";
import {
    KeyboardArrowUp as KeyboardArrowUpIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    TableChart as TableChartIcon,
} from "@mui/icons-material";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import TopologySiteTree from "@/components/topology/TopologySiteTree";
import TopologyCanvas from "@/components/topology/TopologyCanvas";
import TopologyDeviceTable from "@/components/topology/TopologyDeviceTable";
import { useAuth } from "@/contexts/AuthContext";
import { $api } from "@/lib/apiv2/fetch";
import { components } from "@/lib/apiv2/schema";

export type TopologyDeviceItem = components["schemas"]["DeviceNetworkResponse"];

export default function TopologyPage() {
    const { token } = useAuth();
    const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
    const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
    const [isTableCollapsed, setIsTableCollapsed] = useState(false);

    // Fetch devices when site is selected using React Query
    const { data: devicesData, isLoading: isLoadingDevices } = $api.useQuery(
        "get",
        "/device-networks/",
        {
            params: {
                query: {
                    local_site_id: selectedSiteId as string,
                    page: 1,
                    page_size: 100,
                },
            },
        },
        {
            enabled: !!selectedSiteId,
        }
    );

    const devices = devicesData?.devices || [];

    const handleSiteSelect = (siteId: string) => {
        setSelectedSiteId(siteId);
        setSelectedDeviceIds([]); // Reset device selection
    };

    const handleDeviceSelect = (deviceId: string) => {
        setSelectedDeviceIds([deviceId]);
    };

    return (
        <ProtectedRoute>
            <PageLayout>
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            Topology
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Topology canvas and device table
                        </Typography>
                    </Box>
                    {selectedSiteId && (
                        <Typography variant="body2" color="text.secondary">
                            {devices.length} device{devices.length !== 1 ? "s" : ""} found
                        </Typography>
                    )}
                </Box>

                {/* Main Grid Layout */}
                <Grid container spacing={3} sx={{ height: "calc(100vh - 160px)" }}>
                    {/* Left Sidebar - Sites Tree */}
                    <Grid size={{ xs: 2 }} sx={{ height: "100%" }}>
                        <Paper elevation={0} sx={{ height: "100%", borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                            <TopologySiteTree
                                onSiteSelect={handleSiteSelect}
                                onDeviceSelect={handleDeviceSelect}
                                selectedSiteId={selectedSiteId}
                                selectedDeviceId={selectedDeviceIds.length === 1 ? selectedDeviceIds[0] : null}
                            />
                        </Paper>
                    </Grid>

                    {/* Right Side - Canvas + Table */}
                    <Grid size={{ xs: 10 }} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                        {/* Topology Canvas - Expands when table is collapsed */}
                        <Paper
                            elevation={0}
                            sx={{
                                flex: isTableCollapsed ? 1 : 3,
                                transition: "all 0.3s ease-in-out",
                                borderRadius: 2,
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                border: "1px solid",
                                borderColor: "divider",
                            }}
                        >
                            <TopologyCanvas selectedSiteId={selectedSiteId} />
                        </Paper>

                        {/* Toggle Button */}
                        <Box sx={{ display: "flex", alignItems: "center", py: 1 }}>
                            <Button
                                variant="text"
                                color="inherit"
                                size="small"
                                onClick={() => setIsTableCollapsed(!isTableCollapsed)}
                                startIcon={<TableChartIcon fontSize="small" />}
                                endIcon={isTableCollapsed ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowUpIcon fontSize="small" />}
                                sx={{
                                    textTransform: "none",
                                    color: "text.secondary",
                                    fontSize: "0.75rem",
                                    "&:hover": { color: "text.primary", bgcolor: "action.hover" },
                                }}
                            >
                                Devices
                            </Button>
                            <Divider sx={{ flexGrow: 1, ml: 2 }} />
                        </Box>

                        {/* Device Table - Collapsible */}
                        <Paper
                            elevation={0}
                            sx={{
                                flex: isTableCollapsed ? "none" : 2,
                                height: isTableCollapsed ? 0 : "auto",
                                transition: "all 0.3s ease-in-out",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                minHeight: 0,
                                borderRadius: 2,
                                border: isTableCollapsed ? "none" : 1,
                                borderColor: "divider",
                                bgcolor: "background.paper",
                            }}
                        >
                            <TopologyDeviceTable
                                devices={devices as any}
                                selectedDeviceIds={selectedDeviceIds}
                                onSelectionChange={setSelectedDeviceIds}
                                onDeviceSelect={handleDeviceSelect}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </PageLayout>
        </ProtectedRoute>
    );
}
