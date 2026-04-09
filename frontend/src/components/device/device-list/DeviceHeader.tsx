"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import {
  Search,
  Close,
  Add,
  FiberManualRecord,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";

interface StatusCounts {
  online: number;
  offline: number;
  other: number;
  maintenance: number;
}

interface DeviceHeaderProps {
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: { type: string; status: string }) => void;
  onAddDevice: () => void;
  searchTerm: string;
  selectedType: string;
  selectedStatus: string;
  totalDevices: number;
  statusCounts?: StatusCounts;
}

// Status Card Component
function StatusCard({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <Paper variant="outlined" sx={{ flex: 1, minWidth: 140, p: 2, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Box sx={{ color, display: "flex", alignItems: "center" }}>
          <FiberManualRecord sx={{ fontSize: 10 }} />
        </Box>
        <Typography
          variant="caption"
          fontWeight={600}
          color="text.secondary"
          sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          {label}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="baseline" spacing={1}>
        <Typography variant="h5" fontWeight={700}>
          {count.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {percentage}%
        </Typography>
      </Stack>
    </Paper>
  );
}

export default function DeviceHeader({
  onSearch,
  onFilterChange,
  onAddDevice,
  searchTerm,
  selectedType,
  selectedStatus,
  totalDevices,
  statusCounts,
}: DeviceHeaderProps) {
  const { user } = useAuth();
  const [localSearch, setLocalSearch] = useState(searchTerm);

  const canCreateOrEdit =
    user?.role === "ENGINEER" || user?.role === "ADMIN" || user?.role === "OWNER";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    onSearch("");
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Page Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Devices
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage and monitor your network devices
        </Typography>
      </Box>

      {/* Search + Filters + Add Button */}
      <Stack direction={{ xs: "column", sm: "row" }} 
      spacing={2} 
      alignItems={{ sm: "center" }} sx={{ mb: 3 }}>
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search devices..."
          value={localSearch}
          onChange={handleSearchChange}
          sx={{ flex: 1, maxWidth: 360, "& .MuiOutlinedInput-root": { bgcolor: "white", borderRadius: 2 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: localSearch ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />

        {/* Status Filter */}
        <Select
          size="small"
          value={selectedStatus}
          onChange={(e) =>
            onFilterChange({ type: selectedType, status: e.target.value })
          }
          displayEmpty
          sx={{ minWidth: 140, bgcolor: "white", borderRadius: 2 }}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="ONLINE">Online</MenuItem>
          <MenuItem value="OFFLINE">Offline</MenuItem>
          <MenuItem value="OTHER">Other</MenuItem>
          <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
        </Select>

        {/* Type Filter */}
        <Select
          size="small"
          value={selectedType}
          onChange={(e) =>
            onFilterChange({ type: e.target.value, status: selectedStatus })
          }
          displayEmpty
          sx={{ minWidth: 140, bgcolor: "white", borderRadius: 2 }}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="SWITCH">Switch</MenuItem>
          <MenuItem value="ROUTER">Router</MenuItem>
          <MenuItem value="FIREWALL">Firewall</MenuItem>
          <MenuItem value="ACCESS_POINT">Access Point</MenuItem>
          <MenuItem value="OTHER">Other</MenuItem>
        </Select>

        {/* Spacer */}
        <Box flex={1} />

        {/* Add Device Button */}
        {canCreateOrEdit && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAddDevice}
            sx={{ whiteSpace: "nowrap", borderRadius: 2 }}
          >
            Add Device
          </Button>
        )}
      </Stack>

      {/* Status Cards */}
      {statusCounts && (
        <Stack direction="row" spacing={2} sx={{ overflowX: "auto", pb: 1 }}>
          <StatusCard label="Online" count={statusCounts.online} total={totalDevices} color="#22C55E" />
          <StatusCard label="Offline" count={statusCounts.offline} total={totalDevices} color="#EF4444" />
          <StatusCard label="Other" count={statusCounts.other} total={totalDevices} color="#EAB308" />
          <StatusCard label="Maintenance" count={statusCounts.maintenance} total={totalDevices} color="#3B82F6" />
        </Stack>
      )}
    </Box>
  );
}
