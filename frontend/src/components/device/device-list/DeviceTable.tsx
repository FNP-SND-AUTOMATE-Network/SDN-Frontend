"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
  Divider,
  Box,
  Typography,
  TableSortLabel,
} from "@mui/material";
import {
  MoreVert,
  Visibility,
  Edit,
  Sync,
  Delete,
  Router as RouterIcon,
  Shield,
  Wifi,
  Inventory2,
  DnsRounded,
  DeviceHub,
} from "@mui/icons-material";
import { paths } from "@/lib/apiv2/schema";
import DeleteDeviceModal from "./DeleteDeviceModal";
import { useAuth } from "@/contexts/AuthContext";

type DeviceNetwork =
  paths["/device-networks/"]["get"]["responses"]["200"]["content"]["application/json"]["devices"][number];

interface DeviceTableProps {
  devices: DeviceNetwork[];
  onEdit?: (device: DeviceNetwork) => void;
  onSync?: (device: DeviceNetwork) => void;
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

export default function DeviceTable({ devices, onEdit, onSync }: DeviceTableProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof DeviceNetwork>("device_name");

  const handleSort = (property: keyof DeviceNetwork) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const createSortHandler = (property: keyof DeviceNetwork) => () => {
    handleSort(property);
  };

  const sortedDevices = [...devices].sort((a, b) => {
    let aVal: any = a[orderBy] || "";
    let bVal: any = b[orderBy] || "";

    // For nested properties like localSite.site_name
    if (orderBy === "localSite" as keyof DeviceNetwork) {
      aVal = a.localSite ? a.localSite.site_name || a.localSite.site_code : "";
      bVal = b.localSite ? b.localSite.site_name || b.localSite.site_code : "";
    }

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });

  // Dropdown menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuDeviceId, setMenuDeviceId] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeviceNetwork | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, deviceId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuDeviceId(deviceId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuDeviceId(null);
  };

  const getMenuDevice = () => devices.find((d) => d.id === menuDeviceId);

  const handleViewDetail = () => {
    const device = getMenuDevice();
    if (device) router.push(`/device/device-list/${device.id}`);
    handleMenuClose();
  };

  const handleEdit = () => {
    const device = getMenuDevice();
    if (device) {
      if (onEdit) onEdit(device);
      else router.push(`/device/device-list/${device.id}?edit=true`);
    }
    handleMenuClose();
  };

  const handleSync = () => {
    const device = getMenuDevice();
    if (device && onSync) onSync(device);
    handleMenuClose();
  };

  const handleDelete = () => {
    const device = getMenuDevice();
    if (device) {
      setDeleteTarget(device);
      setDeleteModalOpen(true);
    }
    handleMenuClose();
  };

  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="device table">
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>
                <TableSortLabel active={orderBy === 'device_name'} direction={orderBy === 'device_name' ? order : 'asc'} onClick={createSortHandler('device_name')}>Device Name</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>
                <TableSortLabel active={orderBy === 'serial_number'} direction={orderBy === 'serial_number' ? order : 'asc'} onClick={createSortHandler('serial_number')}>Serial Number</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>
                <TableSortLabel active={orderBy === 'type'} direction={orderBy === 'type' ? order : 'asc'} onClick={createSortHandler('type')}>Type</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>
                <TableSortLabel active={orderBy === 'device_model'} direction={orderBy === 'device_model' ? order : 'asc'} onClick={createSortHandler('device_model')}>Model</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>
                <TableSortLabel active={orderBy === 'ip_address'} direction={orderBy === 'ip_address' ? order : 'asc'} onClick={createSortHandler('ip_address')}>IP MGMT</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>
                <TableSortLabel active={orderBy === 'vendor'} direction={orderBy === 'vendor' ? order : 'asc'} onClick={createSortHandler('vendor')}>Vendor</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>
                <TableSortLabel active={orderBy === 'localSite' as unknown} direction={orderBy === 'localSite' as unknown ? order : 'asc'} onClick={createSortHandler('localSite' as unknown as keyof DeviceNetwork)}>Site</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>
                <TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={createSortHandler('status')}>Status</TableSortLabel>
              </TableCell>
              {user?.role?.toLowerCase() !== "viewer" && <TableCell align="right" />}
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                  <DeviceHub sx={{ fontSize: 48, color: "grey.300", mb: 1 }} />
                  <Typography color="text.secondary">No devices found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedDevices.map((device) => {
                const status = statusConfig[device.status] || statusConfig.OTHER;
                const deviceType = typeConfig[device.type] || typeConfig.OTHER;

                return (
                  <TableRow key={device.id} hover>
                    {/* Device Name */}
                    <TableCell>
                      <Link
                        href={`/device/device-list/${device.id}`}
                        style={{ color: "#2563EB", textDecoration: "none", fontWeight: 500 }}
                      >
                        {device.device_name}
                      </Link>
                    </TableCell>

                    {/* Serial Number */}
                    <TableCell sx={{ color: "text.secondary" }}>
                      {device.serial_number || "-"}
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: deviceType.color,
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {deviceType.icon}
                        {device.type.replace("_", " ")}
                      </Box>
                    </TableCell>

                    {/* Model */}
                    <TableCell>{device.device_model || "-"}</TableCell>

                    {/* IP MGMT */}
                    <TableCell>
                      <Typography variant="body2" >
                        {device.ip_address || "-"}
                      </Typography>
                    </TableCell>

                    {/* Vendor */}
                    <TableCell>{device.vendor || "-"}</TableCell>

                    {/* Site */}
                    <TableCell>
                      {device.localSite
                        ? device.localSite.site_name || device.localSite.site_code
                        : "-"}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                        variant="filled"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>

                    {/* Actions */}
                    {user?.role?.toLowerCase() !== "viewer" && (
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, device.id)}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MUI Menu — replaces custom portal dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleViewDetail}>
          <ListItemIcon><Visibility fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon><Edit fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Edit Device</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSync}>
          <ListItemIcon><Sync fontSize="small" color="secondary" /></ListItemIcon>
          <ListItemText>Sync Config</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteDeviceModal
          open={deleteModalOpen}
          device={deleteTarget}
          onClose={() => {
            setDeleteModalOpen(false);
            setDeleteTarget(null);
          }}
          onConfirm={() => {
            setDeleteModalOpen(false);
            setDeleteTarget(null);
          }}
        />
      )}
    </>
  );
}
