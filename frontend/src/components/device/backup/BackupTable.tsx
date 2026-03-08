import React from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    Box,
    Typography,
    IconButton,
    Chip,
} from "@mui/material";
import {
    Router as RouterIcon,
    Shield,
    Wifi,
    Inventory2,
    DnsRounded,
    History,
    DeviceHub
} from "@mui/icons-material";
import { paths } from "@/lib/apiv2/schema";

type DeviceNetwork =
    paths["/device-networks/"]["get"]["responses"]["200"]["content"]["application/json"]["devices"][number];

interface BackupTableProps {
    devices: DeviceNetwork[];
    selectedIds: string[];
    onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectRow: (id: string) => void;
}

const statusConfig: Record<string, { color: "success" | "error" | "info" | "warning" | "default"; label: string }> = {
    ONLINE: { color: "success", label: "Online" },
    OFFLINE: { color: "error", label: "Offline" },
    MAINTENANCE: { color: "info", label: "Maintenance" },
    WARNING: { color: "warning", label: "Warning" },
    OTHER: { color: "default", label: "Other" },
};

const typeConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    SWITCH: { color: "#2563EB", icon: <DnsRounded fontSize="small" /> },
    ROUTER: { color: "#7C3AED", icon: <RouterIcon fontSize="small" /> },
    FIREWALL: { color: "#DC2626", icon: <Shield fontSize="small" /> },
    ACCESS_POINT: { color: "#0891B2", icon: <Wifi fontSize="small" /> },
    OTHER: { color: "#6B7280", icon: <Inventory2 fontSize="small" /> },
};

export default function BackupTable({
    devices,
    selectedIds,
    onSelectAll,
    onSelectRow,
}: BackupTableProps) {
    const isAllSelected = devices.length > 0 && selectedIds.length === devices.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < devices.length;

    const router = useRouter();

    const handleOpenHistory = (device: DeviceNetwork) => {
        router.push(`/device/backup-config/${device.id}`);
    };

    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="backup device table">
                <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                        <TableCell padding="checkbox">
                            <Checkbox
                                color="primary"
                                indeterminate={isIndeterminate}
                                checked={isAllSelected}
                                onChange={onSelectAll}
                                disabled={devices.length === 0}
                            />
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Hostname</TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>IP Address</TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Vendor</TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Site</TableCell>
                        <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Status</TableCell>
                        <TableCell align="right" />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {devices.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                <DeviceHub sx={{ fontSize: 48, color: "grey.300", mb: 1 }} />
                                <Typography color="text.secondary">No devices found</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        devices.map((device) => {
                            const status = statusConfig[device.status] || statusConfig.OTHER;
                            const deviceType = typeConfig[device.type] || typeConfig.OTHER;
                            const isSelected = selectedIds.includes(device.id);

                            return (
                                <TableRow
                                    key={device.id}
                                    hover
                                    onClick={() => onSelectRow(device.id)}
                                    role="checkbox"
                                    aria-checked={isSelected}
                                    selected={isSelected}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            checked={isSelected}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                onSelectRow(device.id);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Box sx={{ color: deviceType.color, display: "flex", alignItems: "center" }}>
                                                {deviceType.icon}
                                            </Box>
                                            <Typography variant="body2" fontWeight={500} sx={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif", fontSize: 13 }}>
                                                {device.device_name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif", fontSize: 13 }}>
                                            {device.ip_address || "-"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {device.type.charAt(0) + device.type.slice(1).toLowerCase().replace("_", " ")}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {device.vendor || "-"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {device.localSite ? device.localSite.site_name || device.localSite.site_code : "-"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={status.label}
                                            color={status.color}
                                            size="small"
                                            variant="filled"
                                            sx={{ fontWeight: 500 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenHistory(device);
                                        }}>
                                            <History fontSize="small" color="action" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
