"use client";

import { useState } from "react";
import {
    Box,
    Typography,
    Table,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Alert,
    Skeleton,
    Stack,
} from "@mui/material";
import {
    MoreVert,
    Visibility,
    Edit,
    FiberManualRecord,
    Sync as SyncIcon,
} from "@mui/icons-material";
import { $api, fetchClient } from "@/lib/apiv2/fetch";
import { paths } from "@/lib/apiv2/schema";
import { InterfaceDiscoveryResponse } from "@/services/deviceNetworkService";
import { DeviceInterfaceModal } from "./DeviceInterfaceModal";
import { useSnackbar } from "@/hooks/useSnackbar";
import { LinearProgress, Button } from "@mui/material";

type DeviceNetwork =
    paths["/device-networks/{device_id}"]["get"]["responses"]["200"]["content"]["application/json"];

type NetworkInterface = InterfaceDiscoveryResponse["interfaces"][0];

interface DeviceInterfacesTabProps {
    device: DeviceNetwork;
}

export function DeviceInterfacesTab({ device }: DeviceInterfacesTabProps) {
    // Modal state
    const [selectedInterface, setSelectedInterface] = useState<NetworkInterface | null>(null);
    const [modalMode, setModalMode] = useState<"view" | "edit">("view");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuIface, setMenuIface] = useState<NetworkInterface | null>(null);

    // Sync state
    const [isSyncing, setIsSyncing] = useState(false);
    const { showSuccess, showError } = useSnackbar();

    const nodeId = device.node_id;

    // --- Fetch interfaces via React Query ---
    const {
        data: discoverData,
        isLoading,
        error,
        refetch,
    } = $api.useQuery(
        "get",
        "/interfaces/odl/{node_id}",
        {
            params: {
                path: { node_id: nodeId! },
            },
        },
        {
            enabled: !!nodeId,
        }
    );

    const interfaces = (discoverData as InterfaceDiscoveryResponse | undefined)?.interfaces ?? [];

    // --- Menu Handlers ---
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, iface: NetworkInterface) => {
        setAnchorEl(event.currentTarget);
        setMenuIface(iface);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuIface(null);
    };

    const handleView = () => {
        if (menuIface) {
            setSelectedInterface(menuIface);
            setModalMode("view");
            setIsModalOpen(true);
        }
        handleMenuClose();
    };

    const handleEdit = () => {
        if (menuIface) {
            setSelectedInterface(menuIface);
            setModalMode("edit");
            setIsModalOpen(true);
        }
        handleMenuClose();
    };

    // --- Sync Handler ---
    const handleSync = async () => {
        if (!nodeId) return;
        setIsSyncing(true);
        try {
            const { data, error } = await fetchClient.GET("/interfaces/odl/{node_id}/sync", {
                params: { path: { node_id: nodeId } }
            });
            if (error) throw error;
            showSuccess("Sync success");
            refetch();
        } catch (err: any) {
            showError(err?.message || "DB sync failed");
        } finally {
            setIsSyncing(false);
        }
    };

    // --- Loading ---
    if (isLoading && !isSyncing) {
        return (
            <Box py={4}>
                <Stack spacing={1}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={40} />
                    ))}
                </Stack>
            </Box>
        );
    }

    // --- No node_id ---
    if (!nodeId) {
        return (
            <Box py={4}>
                <Alert severity="warning">
                    Device does not have a valid Node ID. Please mount the device to ODL first.
                </Alert>
            </Box>
        );
    }

    // --- Error ---
    if (error) {
        return (
            <Box py={4}>
                <Alert severity="error">
                    Failed to discover interfaces. Please try again.
                </Alert>
            </Box>
        );
    }

    // --- Syncing State (Full override if data is empty, else overlay on table) ---
    if (isSyncing && interfaces.length === 0) {
        return (
            <Box py={6} textAlign="center">
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Syncing from device...
                </Typography>
                <Box sx={{ width: '50%', mx: 'auto' }}>
                    <LinearProgress />
                </Box>
            </Box>
        );
    }

    // --- Empty ---
    if (interfaces.length === 0) {
        return (
            <Box py={6} textAlign="center">
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Press the Sync button to pull from the device
                </Typography>
                <Button variant="contained" startIcon={<SyncIcon />} onClick={handleSync}>
                    Sync Now
                </Button>
            </Box>
        );
    }

    return (
        <Stack spacing={2}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button 
                    variant="outlined" 
                    startIcon={<SyncIcon />} 
                    onClick={handleSync}
                    disabled={isSyncing}
                >
                    {isSyncing ? "Syncing..." : "Sync Interfaces"}
                </Button>
            </Box>
            {isSyncing && interfaces.length > 0 && <LinearProgress />}
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 0.5, opacity: isSyncing ? 0.6 : 1 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: "grey.50" }}>
                            <TableCell align="center" sx={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "text.secondary", width: 64 }}>
                                Status
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "text.secondary" }}>
                                Interface Name
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "text.secondary" }}>
                                IP Address
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "text.secondary" }}>
                                Subnet Mask
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "text.secondary" }}>
                                Description
                            </TableCell>
                            <TableCell align="right" sx={{ width: 48 }} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[...interfaces].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })).map((iface, index) => {
                            const isUp = iface.oper_status?.toLowerCase() === "up";
                            return (
                                <TableRow
                                    key={`${iface.name}-${index}`}
                                    hover
                                    sx={{ "&:last-child td": { borderBottom: 0 } }}
                                >
                                    <TableCell align="center">
                                        <FiberManualRecord
                                            sx={{ fontSize: 10, color: isUp ? "success.main" : "error.main" }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500}>
                                            {iface.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {iface.ipv4_address || "-"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {iface.subnet_mask || "-"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                        >
                                            {iface.description || "-"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, iface)}
                                        >
                                            <MoreVert fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <MenuItem onClick={handleView}>
                    <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
                    <ListItemText>View Config</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleEdit}>
                    <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit Config</ListItemText>
                </MenuItem>
            </Menu>

            <DeviceInterfaceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                interfaceData={selectedInterface}
                mode={modalMode}
                deviceId={device.node_id || ""}
                onSuccess={() => refetch()}
            />
        </Stack>
    );
}
