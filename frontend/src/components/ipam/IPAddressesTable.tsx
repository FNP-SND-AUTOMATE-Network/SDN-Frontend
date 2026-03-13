"use client";

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
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Storage as ServerIcon,
    Circle as CircleIcon,
    Star as StarIcon,
} from "@mui/icons-material";

type IpAddressResponse = components["schemas"]["IpAddressResponse"];

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
    const getStatusChip = (address: IpAddressResponse) => {
        // Check if is_gateway
        const isGateway = (address as any).is_gateway === "1" || (address as any).is_gateway === 1;
        if (isGateway) {
            return (
                <Chip
                    icon={<CircleIcon sx={{ fontSize: 10 }} />}
                    label="Gateway"
                    size="small"
                    color="secondary"
                    variant="outlined"
                    sx={{ bgcolor: "secondary.50", fontWeight: "medium" }}
                />
            );
        }

        const isUsed = address.hostname || address.description;

        if (isUsed) {
            return (
                <Chip
                    icon={<CircleIcon sx={{ fontSize: 10 }} />}
                    label="Used"
                    size="small"
                    color="warning"
                    variant="outlined"
                    sx={{ bgcolor: "warning.50", fontWeight: "medium" }}
                />
            );
        }

        return (
            <Chip
                icon={<CircleIcon sx={{ fontSize: 10 }} />}
                label="Free"
                size="small"
                color="success"
                variant="outlined"
                sx={{ bgcolor: "success.50", fontWeight: "medium" }}
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
                                const isGateway = (address as any).is_gateway === "1" || (address as any).is_gateway === 1;
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
                                            {getStatusChip(address)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                                {onEdit && (
                                                    <Tooltip title="Edit IP Address">
                                                        <IconButton size="small" onClick={() => onEdit(address)} color="primary">
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {onDelete && (
                                                    <Tooltip title="Delete IP Address">
                                                        <IconButton size="small" onClick={() => onDelete(address)} color="error">
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {!onEdit && !onDelete && (
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

