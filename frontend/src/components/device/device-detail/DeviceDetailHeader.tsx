"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Avatar,
} from "@mui/material";
import {
  Edit,
  Delete,
  Download,
  MoreHoriz,
  Link as LinkIcon,
  LinkOff,
  DnsRounded,
  Router as RouterIcon,
  Shield,
  Wifi,
  Inventory2,
} from "@mui/icons-material";
import { paths } from "@/lib/apiv2/schema";
import { ExportConfigModal } from "./ExportConfigModal";

type DeviceNetwork =
  paths["/device-networks/{device_id}"]["get"]["responses"]["200"]["content"]["application/json"];

interface DeviceDetailHeaderProps {
  device: DeviceNetwork;
  onEdit: () => void;
  onDelete: () => void;
  onMount?: () => void;
  onUnmount?: () => void;
  isMounting?: boolean;
  isUnmounting?: boolean;
}

const typeIconMap: Record<string, React.ReactNode> = {
  SWITCH: <DnsRounded fontSize="small" sx={{ color: "#2563EB" }} />,
  ROUTER: <RouterIcon fontSize="small" sx={{ color: "#7C3AED" }} />,
  FIREWALL: <Shield fontSize="small" sx={{ color: "#DC2626" }} />,
  ACCESS_POINT: <Wifi fontSize="small" sx={{ color: "#0891B2" }} />,
  OTHER: <Inventory2 fontSize="small" sx={{ color: "#6B7280" }} />,
};

const statusConfig: Record<string, { color: "success" | "error" | "info" | "default" | "warning"; label: string }> = {
  ONLINE: { color: "success", label: "Online" },
  OFFLINE: { color: "error", label: "Offline" },
  MAINTENANCE: { color: "info", label: "Maintenance" },
  OTHER: { color: "default", label: "Other" },
};

export default function DeviceDetailHeader({
  device,
  onEdit,
  onDelete,
  onMount,
  onUnmount,
  isMounting = false,
  isUnmounting = false,
}: DeviceDetailHeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const tags = device.tags || [];
  let status = statusConfig[device.status] || statusConfig.OTHER;
  
  if (device.odl_connection_status === "connecting") {
    status = { color: "warning", label: "Connecting..." };
  } else if (device.odl_connection_status === "connected" && device.status !== "ONLINE") {
    status = { color: "success", label: "Online" };
  } else if (device.odl_connection_status === "unable-to-connect") {
    status = { color: "error", label: "Unable to Connect" };
  }
  console.log(device.odl_connection_status)

  const typeIcon = typeIconMap[device.type] || typeIconMap.OTHER;

  return (
    <Box
      sx={{
        bgcolor: "white",
        borderBottom: 1,
        borderColor: "divider",
        px: 3,
        py: 2,
        mb: 3,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        {/* Left — Device info */}
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            variant="rounded"
            sx={{ bgcolor: "grey.100", width: 44, height: 44 }}
          >
            {typeIcon}
          </Avatar>

          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h6" fontWeight={600}>
                {device.device_name}
              </Typography>
              <Chip
                label={status.label}
                color={status.color}
                size="small"
                variant="filled"
                sx={{ fontWeight: 500 }}
              />
            </Stack>

            <Typography variant="body2" color="text.secondary" mt={0.25}>
              {device.device_model} • {device.vendor || "Unknown Vendor"}
            </Typography>

            {/* Tags */}
            {tags.length > 0 && (
              <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
                {tags.map((tag: any) => (
                  <Chip
                    key={tag.tag_id}
                    label={tag.tag_name || "Tag"}
                    size="small"
                    sx={{
                      bgcolor: tag.color ? `${tag.color}20` : "grey.200",
                      color: tag.color || "text.primary",
                      fontWeight: 500,
                      fontSize: 11,
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>

        {/* Right — Actions */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<LinkOff fontSize="small" />}
            onClick={onUnmount}
            disabled={isUnmounting || isMounting}
            sx={{ borderRadius: 0.5, textTransform: "none" }}
          >
            {isUnmounting ? "Unmounting..." : "Unmount"}
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<LinkIcon fontSize="small" />}
            onClick={onMount}
            disabled={isMounting || isUnmounting || device.odl_connection_status === "CONNECTING" || device.odl_connection_status === "CONNECTED" || device.status === "ONLINE"}
            disableElevation
            sx={{ borderRadius: 0.5, textTransform: "none" }}
          >
            {isMounting || device.odl_connection_status === "CONNECTING" ? "Mounting..." : "Mount"}
          </Button>

          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ border: 1, borderColor: "divider", borderRadius: 0.5 }}
          >
            <MoreHoriz fontSize="small" />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={() => { onEdit(); setAnchorEl(null); }}>
              <ListItemIcon><Edit fontSize="small" color="primary" /></ListItemIcon>
              <ListItemText>Edit Device</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { setExportModalOpen(true); setAnchorEl(null); }}>
              <ListItemIcon><Download fontSize="small" /></ListItemIcon>
              <ListItemText>Export Config</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { onDelete(); setAnchorEl(null); }}>
              <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
              <ListItemText sx={{ color: "error.main" }}>Delete Device</ListItemText>
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>

      {/* Modals outside the layout flow */}
      <ExportConfigModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        deviceId={device.id}
        deviceName={device.device_name}
      />
    </Box>
  );
}
