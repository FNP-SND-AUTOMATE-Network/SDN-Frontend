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
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Device Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Serial Number</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Type</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Model</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>IP MGMT</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Vendor</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Site</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Status</TableCell>
              <TableCell align="right" />
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
              devices.map((device) => {
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
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, device.id)}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
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
