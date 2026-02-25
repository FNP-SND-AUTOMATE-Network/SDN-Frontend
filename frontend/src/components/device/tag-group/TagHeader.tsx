"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faTimes,
  faTags,
  faDesktop,
  faServer,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  IconButton,
  Stack,
  Paper,
  Select,
} from "@mui/material";

interface StatusCardProps {
  label: string;
  count: number;
  icon: any;
  color: "blue" | "green" | "purple" | "orange";
}

function StatusCard({ label, count, icon, color }: StatusCardProps) {
  const colorMap = {
    blue: "primary.main",
    green: "success.main",
    purple: "secondary.main",
    orange: "warning.main",
  };

  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 140,
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Box sx={{ display: "flex", color: colorMap[color] || "inherit" }}>
          <FontAwesomeIcon icon={icon} style={{ width: 16 }} />
        </Box>
        <Typography variant="overline" color="text.secondary" fontWeight="medium" sx={{ lineHeight: 1 }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="h5" fontWeight="bold" color="text.primary">
        {count.toLocaleString()}
      </Typography>
    </Paper>
  );
}

interface TagHeaderProps {
  onAddTag: () => void;
  onSearch: (searchTerm: string) => void;
  onFilterChange: (type: string) => void;
  searchTerm: string;
  selectedType: string;
  totalTags: number;
  osTags: number;
  deviceTags: number;
  totalUsage: number;
}

export default function TagHeader({
  onAddTag,
  onSearch,
  onFilterChange,
  searchTerm,
  selectedType,
  totalTags,
  osTags,
  deviceTags,
  totalUsage,
}: TagHeaderProps) {
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange(e.target.value);
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
          Tags
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Organize your resources with tags for better management
        </Typography>
      </Box>

      {/* Search, Filter, and Add Button */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ mb: 3 }}
      >
        {/* Search Input */}
        <TextField
          placeholder="Search tags..."
          value={localSearch}
          onChange={handleSearchChange}
          size="small"
          sx={{ flex: 1, maxWidth: 360, "& .MuiOutlinedInput-root": { bgcolor: "white", borderRadius: 2 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <FontAwesomeIcon icon={faSearch} style={{ width: 14, color: "var(--mui-palette-text-secondary)" }} />
                </InputAdornment>
              ),
              endAdornment: localSearch ? (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} edge="end" size="small">
                    <FontAwesomeIcon icon={faTimes} style={{ width: 12 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />

        {/* Type Filter */}
        <Select
          value={selectedType}
          onChange={(e) => onFilterChange(e.target.value)}
          size="small"
          displayEmpty
          sx={{ minWidth: 140, bgcolor: "white", borderRadius: 2 }}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="tag">Tag</MenuItem>
          <MenuItem value="group">Group</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>

        <Box sx={{ flexGrow: 1 }} />

        {/* Add Tag Button */}
        <Button
          variant="contained"
          onClick={onAddTag}
          startIcon={<FontAwesomeIcon icon={faPlus} style={{ width: 14 }} />}
          sx={{ whiteSpace: "nowrap", boxShadow: "none" }}
        >
          Add Tag
        </Button>
      </Stack>

      {/* Status Cards */}
      <Stack direction="row" spacing={2} sx={{ overflowX: "auto", pb: 1 }}>
        <StatusCard
          label="Total Tags"
          count={totalTags}
          icon={faTags}
          color="blue"
        />
        <StatusCard
          label="OS Tags"
          count={osTags}
          icon={faDesktop}
          color="green"
        />
        <StatusCard
          label="Device Tags"
          count={deviceTags}
          icon={faServer}
          color="purple"
        />
        <StatusCard
          label="Total Usage"
          count={totalUsage}
          icon={faChartBar}
          color="orange"
        />
      </Stack>
    </Box>
  );
}

