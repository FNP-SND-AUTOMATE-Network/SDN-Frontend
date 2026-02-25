"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCog,
    faDatabase,
    faFile,
    faEllipsisVertical,
    faCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
    Router as RouterIcon,
    Shield,
    Wifi,
    Box as BoxIcon,
    Server,
} from "lucide-react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Chip,
} from "@mui/material";
import ConfigPreviewModal from "./ConfigPreviewModal";
import TopologyConfigModal from "./TopologyConfigModal";
import { components } from "@/lib/apiv2/schema";

type DeviceNetwork = components["schemas"]["DeviceNetworkResponse"];
type StatusDevice = components["schemas"]["StatusDevice"];

interface TopologyDeviceTableProps {
    devices: DeviceNetwork[];
    selectedDeviceId?: string | null;
    onDeviceSelect?: (deviceId: string) => void;
}

const getTypeIcon = (type: string, className = "w-4 h-4") => {
    switch (type) {
        case "SWITCH":
            return <Server className={className} />;
        case "ROUTER":
            return <RouterIcon className={className} />;
        case "FIREWALL":
            return <Shield className={className} />;
        case "ACCESS_POINT":
            return <Wifi className={className} />;
        default:
            return <BoxIcon className={className} />;
    }
};

const getTypeChipProps = (type: string) => {
    switch (type) {
        case "SWITCH":
            return { bgcolor: "info.50", color: "info.700" };
        case "ROUTER":
            return { bgcolor: "secondary.50", color: "secondary.700" };
        case "FIREWALL":
            return { bgcolor: "error.50", color: "error.700" };
        case "ACCESS_POINT":
            return { bgcolor: "primary.50", color: "primary.700" };
        default:
            return { bgcolor: "grey.50", color: "grey.700" };
    }
};

const getStatusChipProps = (status: StatusDevice) => {
    switch (status) {
        case "ONLINE":
            return { bgcolor: "success.100", color: "success.800", label: "Online" };
        case "OFFLINE":
            return { bgcolor: "error.100", color: "error.800", label: "Offline" };
        case "MAINTENANCE":
            return { bgcolor: "warning.100", color: "warning.800", label: "Maintenance" };
        default:
            return { bgcolor: "info.100", color: "info.800", label: "Other" };
    }
};

export default function TopologyDeviceTable({
    devices,
    selectedDeviceId,
    onDeviceSelect,
}: TopologyDeviceTableProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuDeviceId, setMenuDeviceId] = useState<string | null>(null);
    const [configModalDevice, setConfigModalDevice] = useState<any | null>(null);
    const [configEditorDevice, setConfigEditorDevice] = useState<any | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, deviceId: string) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setMenuDeviceId(deviceId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuDeviceId(null);
    };

    if (devices.length === 0) {
        return (
            <Paper elevation={0} sx={{ p: 4, textAlign: "center", border: 1, borderColor: "divider", borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    No devices to display
                </Typography>
            </Paper>
        );
    }

    const currentDevice = devices.find(d => d.id === menuDeviceId);

    return (
        <Box>
            <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflowX: "auto" }}>
                <Table sx={{ minWidth: 650 }} aria-label="topology devices table">
                    <TableHead sx={{ bgcolor: "grey.50" }}>
                        <TableRow>
                            <TableCell sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase" }}>Name</TableCell>
                            <TableCell sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase" }}>Type</TableCell>
                            <TableCell sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase" }}>IP Management</TableCell>
                            <TableCell sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase" }}>Status</TableCell>
                            <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase" }}></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {devices.map((device) => {
                            const isSelected = selectedDeviceId === device.id;
                            const typeProps = getTypeChipProps(device.type as string);
                            const statusProps = getStatusChipProps(device.status as StatusDevice);

                            return (
                                <TableRow
                                    key={device.id}
                                    hover
                                    selected={isSelected}
                                    onClick={() => onDeviceSelect?.(device.id)}
                                    sx={{
                                        cursor: "pointer",
                                        "&.Mui-selected": { bgcolor: "primary.50", "&:hover": { bgcolor: "primary.100" } },
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500} color="text.primary">
                                            {device.device_name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {device.device_model}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={<Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>{getTypeIcon(device.type as string)}</Box>}
                                            label={(device.type as string).replace("_", " ")}
                                            size="small"
                                            sx={{
                                                bgcolor: typeProps.bgcolor,
                                                color: typeProps.color,
                                                fontWeight: 500,
                                                borderRadius: 1,
                                                "& .MuiChip-icon": { color: typeProps.color }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.primary">
                                            {device.ip_address || "-"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={<FontAwesomeIcon icon={faCircle} className="w-2 h-2 ml-1.5" />}
                                            label={statusProps.label}
                                            size="small"
                                            sx={{
                                                bgcolor: statusProps.bgcolor,
                                                color: statusProps.color,
                                                fontWeight: 500,
                                                "& .MuiChip-icon": { color: statusProps.color, width: 8, height: 8 }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, device.id)}
                                            sx={{ color: "text.secondary" }}
                                        >
                                            <FontAwesomeIcon icon={faEllipsisVertical} className="w-4 h-4" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
                slotProps={{ paper: { sx: { width: 160, boxShadow: 3, mt: 0.5, borderRadius: 2 } } }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClose();
                    setConfigEditorDevice(currentDevice);
                }}>
                    <ListItemIcon>
                        <FontAwesomeIcon icon={faCog} className="text-green-600 w-4 h-4" />
                    </ListItemIcon>
                    <ListItemText primary="Config" primaryTypographyProps={{ variant: "body2", color: "text.primary" }} />
                </MenuItem>
                <MenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClose();
                    setConfigModalDevice(currentDevice);
                }}>
                    <ListItemIcon>
                        <FontAwesomeIcon icon={faFile} className="text-blue-600 w-4 h-4" />
                    </ListItemIcon>
                    <ListItemText primary="View Config" primaryTypographyProps={{ variant: "body2", color: "text.primary" }} />
                </MenuItem>
                <MenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClose();
                    // TODO: Implement backup
                }}>
                    <ListItemIcon>
                        <FontAwesomeIcon icon={faDatabase} className="text-orange-600 w-4 h-4" />
                    </ListItemIcon>
                    <ListItemText primary="Backup" primaryTypographyProps={{ variant: "body2", color: "text.primary" }} />
                </MenuItem>
            </Menu>

            {/* Config Preview Modal */}
            <ConfigPreviewModal
                isOpen={!!configModalDevice}
                onClose={() => setConfigModalDevice(null)}
                device={configModalDevice}
            />

            {/* Config Editor Modal */}
            <TopologyConfigModal
                isOpen={!!configEditorDevice}
                onClose={() => setConfigEditorDevice(null)}
                device={configEditorDevice}
            />
        </Box>
    );
}
