"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  MenuItem,
  Select,
} from "@mui/material";
import {
  Add,
  Search,
  Close,
  Layers,
} from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faServer, faDesktop } from "@fortawesome/free-solid-svg-icons";

interface StatusCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange";
}

function StatusCard({ label, count, icon, color }: StatusCardProps) {
  const iconColorClasses = {
    blue: "#3b82f6",
    green: "#22c55e",
    purple: "#a855f7",
    orange: "#f97316",
  };

  return (
    <Paper variant="outlined" sx={{ flex: 1, minWidth: 140, p: 2, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Box sx={{ color: iconColorClasses[color], display: "flex", alignItems: "center" }}>
          {icon}
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
      <Typography variant="h5" fontWeight={700}>
        {count.toLocaleString()}
      </Typography>
    </Paper>
  );
}

interface OperationHeaderProps {
  onAddOs: () => void;
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: { os_type: string }) => void;
  searchTerm: string;
  selectedOsType: string;
  totalOs: number;
  totalDevices: number;
  totalBackups: number;
  totalUsage: number;
}

export default function OperationHeader({
  onAddOs,
  onSearch,
  onFilterChange,
  searchTerm,
  selectedOsType,
  totalOs,
  totalDevices,
  totalBackups,
  totalUsage,
}: OperationHeaderProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

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
      {/* Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Operating Systems
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage OS images and configurations for your infrastructure
        </Typography>
      </Box>

      {/* Search, Filter, Add - one row */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
        sx={{ mb: 3 }}
      >
        <TextField
          size="small"
          placeholder="Search operating systems..."
          value={localSearch}
          onChange={handleSearchChange}
          sx={{
            flex: 1,
            maxWidth: 360,
            "& .MuiOutlinedInput-root": {
              bgcolor: "white",
              borderRadius: 2
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: localSearch ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch} edge="end">
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />

        <Select
          size="small"
          value={selectedOsType}
          onChange={(e) => onFilterChange({ os_type: e.target.value })
          }
          displayEmpty
          sx={{ minWidth: 140, bgcolor: "white", borderRadius: 2 }}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="CISCO_IOS_XE">Cisco IOS-XE</MenuItem>
          <MenuItem value="HUAWEI_VRP">Huawei VRP</MenuItem>
        </Select>

        <Box flex={1} />

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAddOs}
          sx={{ whiteSpace: "nowrap", borderRadius: 2 }}
        >
          Add OS
        </Button>
      </Stack>

      {/* Status Cards */}
      <Stack direction="row" spacing={2} sx={{ overflowX: "auto", pb: 0.5 }}>
        <StatusCard
          label="Total OS"
          count={totalOs}
          icon={<FontAwesomeIcon icon={faDesktop} fontSize="16px" />}
          color="blue"
        />
        <StatusCard
          label="Devices"
          count={totalDevices}
          icon={<FontAwesomeIcon icon={faServer} fontSize="16px" />}
          color="green"
        />
        <StatusCard
          label="Backups"
          count={totalBackups}
          icon={<FontAwesomeIcon icon={faDatabase} fontSize="16px" />}
          color="purple"
        />
        <StatusCard
          label="Total Usage"
          count={totalUsage}
          icon={<Layers fontSize="small" />}
          color="orange"
        />
      </Stack>
    </Box>
  );
}
