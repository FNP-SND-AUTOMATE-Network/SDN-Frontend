"use client";

import React, { useState } from "react";
import { components } from "@/lib/apiv2/schema";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Typography,
    Box,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Storage as ServerIcon,
    Circle as CircleIcon,
    Star as StarIcon,
    MoreVert as MoreVertIcon,
} from "@mui/icons-material";

type IpAddressResponse = components["schemas"]["IpAddressResponse"];

// phpIPAM address tag statuses
// tag_id: 1 = Offline, 2 = Used, 3 = Reserved, 4 = DHCP, is_gateway = Gateway
const STATUS_CHIP_CONFIG: Record<string, { color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"; label: string; bgAlpha: string }> = {
    offline:     { color: "default",   label: "Offline",     bgAlpha: "grey.100" },
    used:        { color: "warning",   label: "Used",        bgAlpha: "warning.50" },
    active:      { color: "warning",   label: "Active",      bgAlpha: "warning.50" },
    reserved:    { color: "info",      label: "Reserved",    bgAlpha: "info.50" },
    dhcp:        { color: "primary",   label: "DHCP",        bgAlpha: "primary.50" },
    gateway:     { color: "secondary", label: "Gateway",     bgAlpha: "secondary.50" },
    free:        { color: "success",   label: "Free",        bgAlpha: "success.50" },
    available:   { color: "success",   label: "Available",   bgAlpha: "success.50" },
    unreachable: { color: "error",     label: "Unreachable", bgAlpha: "error.50" },
};

function getAddressStatus(address: any): { statusKey: string; isGateway: boolean } {
    // 1. Prefer _status injected from space-map endpoint (most accurate)
    if (address._status) {
        const key = address._status.toLowerCase().trim();
        const isGw = key === "gateway" || address.is_gateway === "1" || address.is_gateway === 1;
        // Map common phpIPAM status strings
        if (STATUS_CHIP_CONFIG[key]) {
            return { statusKey: key, isGateway: isGw };
        }
        // Fallback for unknown status strings
        return { statusKey: key, isGateway: isGw };
    }

    // 2. Check is_gateway flag
    const isGateway = address.is_gateway === "1" || address.is_gateway === 1;
    if (isGateway) return { statusKey: "gateway", isGateway: true };

    // 3. phpIPAM tag_id based status
    const tagId = String(address.tag_id || address.tag || "");
    switch (tagId) {
        case "1": return { statusKey: "offline", isGateway: false };
        case "2": return { statusKey: "used", isGateway: false };
        case "3": return { statusKey: "reserved", isGateway: false };
        case "4": return { statusKey: "dhcp", isGateway: false };
    }

    // 4. Fallback: if there's a hostname/description, consider it "used"
    if (address.hostname || address.description) {
        return { statusKey: "used", isGateway: false };
    }

    return { statusKey: "free", isGateway: false };
}

interface IPAddressesTableProps {
    addresses: IpAddressResponse[];
    onRefresh: () => void;
    onEdit?: (address: IpAddressResponse) => void;
    onDelete?: (address: IpAddressResponse) => void;
}

export default function IPAddressesTable({
    addresses,
    onRefresh,
    onEdit,
    onDelete,
}: IPAddressesTableProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuAddress, setMenuAddress] = useState<IpAddressResponse | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, address: IpAddressResponse) => {
        setAnchorEl(event.currentTarget);
        setMenuAddress(address);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuAddress(null);
    };

    const handleEditItem = () => {
        if (onEdit && menuAddress) onEdit(menuAddress);
        handleMenuClose();
    };

    const handleDeleteItem = () => {
        if (onDelete && menuAddress) onDelete(menuAddress);
        handleMenuClose();
    };

    const renderStatusChip = (address: IpAddressResponse) => {
        const { statusKey, isGateway } = getAddressStatus(address);
        const cfg = STATUS_CHIP_CONFIG[statusKey] || STATUS_CHIP_CONFIG["free"];

        return (
            <Chip
                icon={<CircleIcon sx={{ fontSize: 10 }} />}
                label={cfg.label}
                size="small"
                color={cfg.color}
                variant="outlined"
                sx={{ bgcolor: cfg.bgAlpha, fontWeight: "medium" }}
            />
        );
    };

    return (
        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden", borderRadius: 2 }}>
            <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: "grey.50" }}>
                        <TableRow>
                            <TableCell>IP Address</TableCell>
                            <TableCell>Hostname</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>MAC Address</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {addresses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <ServerIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                                    <Typography color="text.secondary">No IP addresses found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            addresses.map((address) => {
                                const { statusKey, isGateway } = getAddressStatus(address);
                                return (
                                    <TableRow
                                        key={address.id}
                                        hover
                                        sx={{
                                            bgcolor: isGateway ? "secondary.50" : "inherit",
                                            "&:hover": { bgcolor: isGateway ? "secondary.100" : "action.hover" },
                                            "&:last-child td, &:last-child th": { border: 0 },
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: 1,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        bgcolor: isGateway ? "secondary.200" : "primary.50",
                                                    }}
                                                >
                                                    <ServerIcon sx={{ fontSize: 16, color: isGateway ? "secondary.700" : "primary.main" }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium" color={isGateway ? "secondary.900" : "text.primary"}>
                                                        {(address as any).ip}
                                                    </Typography>
                                                    {isGateway && (
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                                            <StarIcon sx={{ fontSize: 10, color: "secondary.main" }} />
                                                            <Typography variant="caption" fontWeight="bold" color="secondary.main">
                                                                GATEWAY
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{address.hostname || "-"}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, WebkitLineClamp: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {address.description || "-"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                                                {address.mac || "-"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {renderStatusChip(address)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {(onEdit || onDelete) ? (
                                                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, address)}>
                                                        <MoreVertIcon fontSize="small" />
                                                    </IconButton>
                                                ) : (
                                                    <Typography variant="body2" color="text.disabled">-</Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                {onEdit && (
                    <MenuItem onClick={handleEditItem}>
                        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                        Edit
                    </MenuItem>
                )}
                {onEdit && onDelete && <Box sx={{ my: 0.5, borderBottom: "1px solid", borderColor: "divider" }} />}
                {onDelete && (
                    <MenuItem onClick={handleDeleteItem} sx={{ color: "error.main" }}>
                        <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                        Delete
                    </MenuItem>
                )}
            </Menu>

            {addresses.length > 0 && (
                <Box sx={{ bgcolor: "grey.50", px: 3, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                    <Typography variant="body2" color="text.secondary">
                        Showing <Box component="span" fontWeight="medium">{addresses.length}</Box> IP
                        address{addresses.length !== 1 ? "es" : ""}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}
