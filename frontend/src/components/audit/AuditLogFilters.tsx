"use client";

import { Stack, Select, MenuItem, TextField, Button, Box } from "@mui/material";

interface AuditLogFiltersProps {
  filters: {
    action: string;
    startDate: string;
    endDate: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export default function AuditLogFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: AuditLogFiltersProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems={{ sm: "center" }}
      sx={{ width: "100%" }}
    >
      <Select
        size="small"
        value={filters.action}
        onChange={(e) => onFilterChange("action", e.target.value as string)}
        displayEmpty
        sx={{ minWidth: 200, bgcolor: "white", borderRadius: 2 }}
      >
        <MenuItem value="">All Actions</MenuItem>
        <MenuItem value="USER_LOGIN">Login</MenuItem>
        <MenuItem value="USER_LOGOUT">Logout</MenuItem>
        <MenuItem value="USER_CREATE">Create User</MenuItem>
        <MenuItem value="USER_UPDATE">Update User</MenuItem>
        <MenuItem value="USER_DELETE">Delete User</MenuItem>
        <MenuItem value="PASSWORD_CHANGE">Password Change</MenuItem>
        <MenuItem value="PASSWORD_RESET">Password Reset</MenuItem>
        <MenuItem value="PROMOTE_ROLE">Promote Role</MenuItem>
        <MenuItem value="DEMOTE_ROLE">Demote Role</MenuItem>
        <MenuItem value="ENABLE_TOTP">Enable TOTP</MenuItem>
        <MenuItem value="DISABLE_TOTP">Disable TOTP</MenuItem>
        <MenuItem value="REGISTER_PASSKEY">Register Passkey</MenuItem>
        <MenuItem value="REMOVE_PASSKEY">Remove Passkey</MenuItem>
      </Select>

      <TextField
        size="small"
        type="datetime-local"
        label="Start Date"
        InputLabelProps={{ shrink: true }}
        value={filters.startDate}
        onChange={(e) => onFilterChange("startDate", e.target.value)}
        sx={{ bgcolor: "white", borderRadius: 2 }}
      />

      <TextField
        size="small"
        type="datetime-local"
        label="End Date"
        InputLabelProps={{ shrink: true }}
        value={filters.endDate}
        onChange={(e) => onFilterChange("endDate", e.target.value)}
        sx={{ bgcolor: "white", borderRadius: 2 }}
      />

      <Box flex={1} />

      {(filters.action || filters.startDate || filters.endDate) && (
        <Button variant="text" color="secondary" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </Stack>
  );
}