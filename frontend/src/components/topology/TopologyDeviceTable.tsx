"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCog,
    faDatabase,
    faFile,
    faEllipsisVertical
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
    Checkbox,
    Button,
    TableSortLabel
} from "@mui/material";

import { fetchClient } from "@/lib/apiv2/fetch";
import { Inventory2, DnsRounded } from "@mui/icons-material";
import ConfigPreviewModal from "./ConfigPreviewModal";
import TopologyConfigModal from "./TopologyConfigModal";
import BackupStatusOverlay, { BackupJobResult } from "../device/backup/BackupStatusOverlay";
import DeployTemplateModal from "./DeployTemplateModal";
import { components } from "@/lib/apiv2/schema";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { useAuth } from "@/contexts/AuthContext";

type DeviceNetwork = components["schemas"]["DeviceNetworkResponse"];
type StatusDevice = components["schemas"]["StatusDevice"];

interface TopologyDeviceTableProps {
    devices: DeviceNetwork[];
    selectedDeviceIds?: string[];
    onSelectionChange?: (deviceIds: string[]) => void;
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

const typeConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    SWITCH: { color: "#2563EB", icon: <DnsRounded fontSize="small" /> },
    ROUTER: { color: "#7C3AED", icon: <RouterIcon fontSize="small" /> },
    FIREWALL: { color: "#DC2626", icon: <Shield fontSize="small" /> },
    ACCESS_POINT: { color: "#0891B2", icon: <Wifi fontSize="small" /> },
    OTHER: { color: "#6B7280", icon: <Inventory2 fontSize="small" /> },
};

const getStatusChipProps = (status: StatusDevice) => {
    switch (status) {
        case "ONLINE":
            return { bgcolor: "#22C55E", color: "white", label: "Online" };
        case "OFFLINE":
            return { bgcolor: "#EF4444", color: "white", label: "Offline" };
        case "MAINTENANCE":
            return { bgcolor: "#F59E0B", color: "white", label: "Maintenance" };
        default:
            return { bgcolor: "#6B7280", color: "white", label: "Other" };
    }
};

export default function TopologyDeviceTable({
    devices,
    selectedDeviceIds,
    onSelectionChange,
    onDeviceSelect,
}: TopologyDeviceTableProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuDeviceId, setMenuDeviceId] = useState<string | null>(null);
    const [configModalDevice, setConfigModalDevice] = useState<any | null>(null);
    const [configEditorDevice, setConfigEditorDevice] = useState<any | null>(null);
    const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
    const { user } = useAuth();

    // Snackbar notifications
    const { snackbar, showSuccess, showError, showWarning, hideSnackbar } = useSnackbar();

    // Sorting state
    const [order, setOrder] = useState<"asc" | "desc">("asc");
    const [orderBy, setOrderBy] = useState<string>("device_name");

    const handleRequestSort = (property: string) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const sortedDevices = React.useMemo(() => {
        return [...devices].sort((a, b) => {
            let valueA = "";
            let valueB = "";

            if (orderBy === "device_name") {
                valueA = String(a.device_name || "").toLowerCase();
                valueB = String(b.device_name || "").toLowerCase();
            } else if (orderBy === "type") {
                valueA = String(a.type || "").toLowerCase();
                valueB = String(b.type || "").toLowerCase();
            } else if (orderBy === "ip_address") {
                valueA = String(a.ip_address || "").toLowerCase();
                valueB = String(b.ip_address || "").toLowerCase();
            } else if (orderBy === "status") {
                valueA = String(a.status || "").toLowerCase();
                valueB = String(b.status || "").toLowerCase();
            }

            if (valueA < valueB) {
                return order === "asc" ? -1 : 1;
            }
            if (valueA > valueB) {
                return order === "asc" ? 1 : -1;
            }
            return 0;
        });
    }, [devices, order, orderBy]);

    // Backup Task tracking
    const [backupJobs, setBackupJobs] = useState<BackupJobResult[]>([]);
    const [showBackupOverlay, setShowBackupOverlay] = useState(false);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, deviceId: string) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setMenuDeviceId(deviceId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuDeviceId(null);
    };

    const handleBackupDevices = async (devicesToBackup: DeviceNetwork[]) => {
        if (!devicesToBackup.length) return;

        setShowBackupOverlay(true);

        const localTasks = devicesToBackup.map(device => ({
            id: `backup-${Date.now()}-${device.id}`,
            name: device.device_name,
            status: 'IN_PROGRESS' as const,
        }));

        setBackupJobs(prev => [...prev, ...localTasks]);

        try {
            const result = await fetchClient.POST("/api/v1/devices/backups", {
                body: {
                    device_ids: devicesToBackup.map(d => d.id),
                    config_type: "RUNNING"
                }
            });

            if (result.error) throw result.error;

            const records = result.data?.job_info?.record_ids;

            if (!Array.isArray(records) || records.length === 0) {
                setBackupJobs(prev => prev.map(t =>
                    localTasks.some(lt => lt.id === t.id) ? { ...t, status: 'SUCCESS' } : t
                ));
                return;
            }

            const tasksToUpdate = [...localTasks];
            setBackupJobs(prev => prev.map(t => {
                const matchedTaskIndex = tasksToUpdate.findIndex(lt => lt.id === t.id);
                if (matchedTaskIndex !== -1 && records[matchedTaskIndex]) {
                    return { ...t, id: records[matchedTaskIndex] as string };
                }
                return t;
            }));

            const pollStatus = async (idToPoll: string, retryCount = 0) => {
                setTimeout(async () => {
                    try {
                        const res = await fetchClient.GET("/api/v1/devices/backups/{record_id}", {
                            params: { path: { record_id: idToPoll } }
                        });
                        if (res.data) {
                            // @ts-ignore
                            const currentStatus = res.data.status || "IN_PROGRESS";

                            setBackupJobs(prev => prev.map(job =>
                                job.id === idToPoll ? { ...job, status: currentStatus as any } : job
                            ));

                            if (currentStatus === "IN_PROGRESS" && retryCount < 60) {
                                pollStatus(idToPoll, retryCount + 1);
                            }
                        }
                    } catch (e) {
                        console.error("Polling error for backup", idToPoll, e);
                    }
                }, 3000);
            };

            records.forEach(id => pollStatus(id as string));

        } catch (error) {
            console.error("Backup failed for devices", error);
            setBackupJobs(prev => prev.map(t =>
                localTasks.some(lt => lt.id === t.id) ? { ...t, status: 'FAILED' } : t
            ));
        }
    };

    const currentDevice = devices.find(d => d.id === menuDeviceId);

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {selectedDeviceIds && selectedDeviceIds.length > 0 && (
                <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "primary.50", borderBottom: 1, borderColor: "divider" }}>
                    <Typography color="primary" variant="subtitle1" fontWeight={600}>
                        {selectedDeviceIds.length} device{selectedDeviceIds.length > 1 ? "s" : ""} selected
                    </Typography>
                    {user?.role !== "viewer" && (
                        <>
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<FontAwesomeIcon icon={faCog} />}
                                onClick={() => setIsDeployModalOpen(true)}
                            >
                                Template Config
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={<FontAwesomeIcon icon={faDatabase} />}
                                onClick={() => handleBackupDevices(devices.filter(d => selectedDeviceIds.includes(d.id)))}
                            >
                                Backup Devices
                            </Button>
                        </>
                    )}
                </Box>
            )}
            <TableContainer sx={{ overflowX: "auto", flexGrow: 1 }}>
                <Table sx={{ minWidth: 650 }} aria-label="topology devices table">
                    <TableHead sx={{ bgcolor: "grey.50", position: 'sticky', top: 0, zIndex: 1 }}>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    indeterminate={selectedDeviceIds && selectedDeviceIds.length > 0 && selectedDeviceIds.length < devices.length}
                                    checked={devices.length > 0 && selectedDeviceIds?.length === devices.length}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            onSelectionChange?.(devices.map(d => d.id));
                                        } else {
                                            onSelectionChange?.([]);
                                        }
                                    }}
                                />
                            </TableCell>
                            <TableCell sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase" }}>
                                <TableSortLabel
                                    active={orderBy === "device_name"}
                                    direction={orderBy === "device_name" ? order : "asc"}
                                    onClick={() => handleRequestSort("device_name")}
                                >
                                    Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase" }}>
                                <TableSortLabel
                                    active={orderBy === "type"}
                                    direction={orderBy === "type" ? order : "asc"}
                                    onClick={() => handleRequestSort("type")}
                                >
                                    Type
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase" }}>
                                <TableSortLabel
                                    active={orderBy === "ip_address"}
                                    direction={orderBy === "ip_address" ? order : "asc"}
                                    onClick={() => handleRequestSort("ip_address")}
                                >
                                    IP Management
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase" }}>
                                <TableSortLabel
                                    active={orderBy === "status"}
                                    direction={orderBy === "status" ? order : "asc"}
                                    onClick={() => handleRequestSort("status")}
                                >
                                    Status
                                </TableSortLabel>
                            </TableCell>
                            {user?.role !== "viewer" && <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase" }}></TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {devices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} sx={{ py: 10, borderBottom: 0, textAlign: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No devices to display
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedDevices.map((device) => {
                                const isSelected = selectedDeviceIds?.includes(device.id) || false;
                                const deviceType = (device.type as string) || "OTHER";
                                const typeProps = typeConfig[deviceType] || typeConfig.OTHER;
                                const statusProps = getStatusChipProps(device.status as StatusDevice);

                                return (
                                    <TableRow
                                        key={device.id}
                                        hover
                                        selected={isSelected}
                                        onClick={() => {
                                            const newSelected = isSelected
                                                ? (selectedDeviceIds || []).filter(id => id !== device.id)
                                                : [...(selectedDeviceIds || []), device.id];
                                            onSelectionChange?.(newSelected);
                                        }}
                                        sx={{
                                            cursor: "pointer",
                                            "&.Mui-selected": { bgcolor: "primary.50", "&:hover": { bgcolor: "primary.100" } },
                                        }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                color="primary"
                                                checked={isSelected}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    const newSelected = checked
                                                        ? [...(selectedDeviceIds || []), device.id]
                                                        : (selectedDeviceIds || []).filter(id => id !== device.id);
                                                    onSelectionChange?.(newSelected);
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500} color="text.primary">
                                                {device.device_name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {device.device_model}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                    color: typeProps.color,
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {typeProps.icon}
                                                {deviceType.replace("_", " ")}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.primary">
                                                {device.ip_address || "-"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
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
                                        {user?.role !== "viewer" && (
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleMenuOpen(e, device.id)}
                                                    sx={{ color: "text.secondary" }}
                                                >
                                                    <FontAwesomeIcon icon={faEllipsisVertical} className="w-4 h-4" />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            }))}
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
                    if (currentDevice) {
                        handleBackupDevices([currentDevice]);
                    }
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

            {/* Deploy Template Modal */}
            <DeployTemplateModal
                isOpen={isDeployModalOpen}
                onClose={() => setIsDeployModalOpen(false)}
                selectedDevices={devices.filter(d => selectedDeviceIds?.includes(d.id))}
                onSuccess={() => {
                    setIsDeployModalOpen(false);
                    onSelectionChange?.([]);
                    showSuccess("Template deployed successfully to selected devices");
                }}
                onError={(err) => {
                    showError(err || "Failed to deploy template");
                }}
                onWarning={(warn) => {
                    showWarning(warn);
                }}
            />

            {/* Bottom-right Backup Tasks Widget */}
            <BackupStatusOverlay
                open={showBackupOverlay}
                jobs={backupJobs}
                onClose={() => setShowBackupOverlay(false)}
            />

            <MuiSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={hideSnackbar}
                title={snackbar.title}
            />
        </Box>
    );
}
