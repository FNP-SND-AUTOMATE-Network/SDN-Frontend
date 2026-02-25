"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faTimes,
  faBuilding,
  faServer,
  faCodeBranch,
  faNetworkWired,
} from "@fortawesome/free-solid-svg-icons";
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Select,
  MenuItem,
} from "@mui/material";

interface StatusCardProps {
  label: string;
  count: number;
  icon: any;
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
          <FontAwesomeIcon icon={icon} className="w-4 h-4" />
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

interface SiteHeaderProps {
  onAddSite: () => void;
  onSearch: (searchTerm: string) => void;
  onFilterChange: (siteType: string) => void;
  searchTerm: string;
  selectedSiteType: string;
  totalSites: number;
  dataCenters: number;
  branches: number;
  totalDevices: number;
}

export default function SiteHeader({
  onAddSite,
  onSearch,
  onFilterChange,
  searchTerm,
  selectedSiteType,
  totalSites,
  dataCenters,
  branches,
  totalDevices,
}: SiteHeaderProps) {
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

  const handleFilterChange = (e: any) => {
    onFilterChange(e.target.value);
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Sites
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage site locations and infrastructure for your network
        </Typography>
      </Box>

      {/* Search, Filter, and Add Button - All in one row */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
        sx={{ mb: 3 }}
      >
        {/* Search Input */}
        <TextField
          size="small"
          placeholder="Search sites..."
          value={localSearch}
          onChange={handleSearchChange}
          sx={{
            flex: 1,
            maxWidth: 360,
            "& .MuiOutlinedInput-root": {
              bgcolor: "white",
              borderRadius: 2,
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <FontAwesomeIcon icon={faSearch} className="w-4 h-4 text-gray-400" />
                </InputAdornment>
              ),
              endAdornment: localSearch ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch} edge="end">
                    <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />

        {/* Type Filter */}
        <Select
          size="small"
          value={selectedSiteType}
          onChange={handleFilterChange}
          displayEmpty
          sx={{ minWidth: 140, bgcolor: "white", borderRadius: 2 }}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="DataCenter">Data Center</MenuItem>
          <MenuItem value="BRANCH">Branch</MenuItem>
          <MenuItem value="OTHER">Other</MenuItem>
        </Select>

        {/* Spacer */}
        <Box flex={1} />

        {/* Add Site Button */}
        <Button
          variant="contained"
          onClick={onAddSite}
          startIcon={<FontAwesomeIcon icon={faPlus} className="w-4 h-4" />}
          sx={{ whiteSpace: "nowrap", borderRadius: 2 }}
        >
          Add Site
        </Button>
      </Stack>

      {/* Status Cards */}
      <Stack direction="row" spacing={2} sx={{ overflowX: "auto", pb: 1 }}>
        <StatusCard
          label="Total Sites"
          count={totalSites}
          icon={faBuilding}
          color="blue"
        />
        <StatusCard
          label="Data Centers"
          count={dataCenters}
          icon={faServer}
          color="green"
        />
        <StatusCard
          label="Branches"
          count={branches}
          icon={faCodeBranch}
          color="purple"
        />
        <StatusCard
          label="Total Devices"
          count={totalDevices}
          icon={faNetworkWired}
          color="orange"
        />
      </Stack>
    </Box>
  );
}
