"use client";

import { useState } from "react";
import {
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
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Memory,
} from "@mui/icons-material";
import { components } from "@/lib/apiv2/schema";

type OperatingSystem = components["schemas"]["OperatingSystemResponse"];
type OsType = components["schemas"]["OsType"];

interface OperationTableProps {
  operatingSystems: OperatingSystem[];
  onEditOs: (os: OperatingSystem) => void;
  onDeleteOs: (osId: string, osName: string) => void;
  onViewOs?: (os: OperatingSystem) => void;
}

const getOsTypeChip = (osType: OsType): { label: string; color: string; bg: string } => {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    CISCO_IOS_XE: { label: "Cisco IOS-XE", color: "#4B5563", bg: "#F3F4F6" },
    HUAWEI_VRP: { label: "Huawei VRP", color: "#DC2626", bg: "#FEE2E2" },
    OTHER: { label: "Other", color: "#6B7280", bg: "#F3F4F6" },
  };
  return map[osType] || map.OTHER;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const headerCellSx = {
  fontWeight: 600,
  fontSize: 11,
  textTransform: "uppercase" as const,
  letterSpacing: 0.5,
  color: "text.secondary",
};

export default function OperationTable({
  operatingSystems,
  onEditOs,
  onDeleteOs,
  onViewOs,
}: OperationTableProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuOs, setMenuOs] = useState<OperatingSystem | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, os: OperatingSystem) => {
    setAnchorEl(event.currentTarget);
    setMenuOs(os);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuOs(null);
  };

  const handleView = () => {
    if (menuOs && onViewOs) onViewOs(menuOs);
    handleMenuClose();
  };

  const handleEdit = () => {
    if (menuOs) onEditOs(menuOs);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (menuOs) onDeleteOs(menuOs.id, menuOs.os_type);
    handleMenuClose();
  };

  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="device table">
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Type</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Tags</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Devices</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Backups</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.secondary", textTransform: "uppercase", fontSize: "0.75rem" }}>Updated</TableCell>
              <TableCell align="right" sx={{ width: 48 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {operatingSystems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ py: 8, textAlign: "center" }}>
                  <Memory sx={{ fontSize: 48, color: "grey.300", mb: 1.5, display: "block", mx: "auto" }} />
                  <Typography variant="subtitle1" fontWeight={500}>
                    No operating systems found
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Add a new OS to get started
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              operatingSystems.map((os) => {
                const chip = getOsTypeChip(os.os_type);
                return (
                  <TableRow
                    key={os.id}
                    hover
                    sx={{ "&:last-child td": { borderBottom: 0 } }}
                  >
                    {/* Name */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {os.os_type}
                      </Typography>
                      {os.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            maxWidth: 240,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {os.description}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Type Badge */}
                    <TableCell>
                      <Chip
                        label={chip.label}
                        size="small"
                        sx={{
                          bgcolor: chip.bg,
                          color: chip.color,
                          fontWeight: 500,
                          fontSize: 11,
                        }}
                      />
                    </TableCell>

                    {/* Tags */}
                    <TableCell>
                      {os.tags && os.tags.length > 0 ? (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ maxWidth: 240 }}>
                          {os.tags.slice(0, 3).map((tag) => (
                            <Chip
                              key={tag.tag_id}
                              label={tag.tag_name}
                              size="small"
                              sx={{
                                bgcolor: `${tag.color}20`,
                                borderColor: tag.color,
                                color: tag.color,
                                fontSize: 11,
                                fontWeight: 500,
                                height: 22,
                              }}
                              variant="outlined"
                            />
                          ))}
                          {os.tags.length > 3 && (
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                              +{os.tags.length - 3}
                            </Typography>
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.disabled">-</Typography>
                      )}
                    </TableCell>

                    {/* Devices Count */}
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={500}>
                        {os.device_count || 0}
                      </Typography>
                    </TableCell>

                    {/* Backups Count */}
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={500}>
                        {os.backup_count || 0}
                      </Typography>
                    </TableCell>

                    {/* Updated */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(os.updated_at)}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, os)}
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

      {/* MUI Menu — replaces portal dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {onViewOs && (
          <MenuItem onClick={handleView}>
            <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleEdit}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
