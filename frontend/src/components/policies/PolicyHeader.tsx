import React, { useState } from 'react';
import { Box, Typography, Button, Stack, Paper, TextField, InputAdornment, IconButton, Select, MenuItem } from '@mui/material';
import { Add as AddIcon, Sync as SyncIcon, FiberManualRecord, Search, Close } from '@mui/icons-material';

interface PolicyHeaderProps {
    onSearch: (searchTerm: string) => void;
    onFilterChange: (filters: { flowType: string; status: string }) => void;
    onAddPolicy: () => void;
    onSyncFlows: () => void;
    searchTerm: string;
    selectedFlowType: string;
    selectedStatus: string;
    stats: {
        total: number;
        active: number;
        pending: number;
        failed: number;
    };
}

// Status Card Component from DeviceHeader
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

export const PolicyHeader: React.FC<PolicyHeaderProps> = ({
    onSearch,
    onFilterChange,
    onAddPolicy,
    onSyncFlows,
    searchTerm,
    selectedFlowType,
    selectedStatus,
    stats
}) => {
    const [localSearch, setLocalSearch] = useState(searchTerm);

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
                    Flow Policy
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Flow Policy Management
                </Typography>
            </Box>

            {/* Search + Filters + Actions */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} sx={{ mb: 3 }}>
                {/* Search */}
                <TextField
                    size="small"
                    placeholder="Search Node ID..."
                    value={localSearch}
                    onChange={handleSearchChange}
                    sx={{ flex: 1, maxWidth: 360, "& .MuiOutlinedInput-root": { bgcolor: "white", borderRadius: 2 } }}
                    InputProps={{
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
                    }}
                />

                {/* Status Filter */}
                <Select
                    size="small"
                    value={selectedStatus}
                    onChange={(e) => onFilterChange({ flowType: selectedFlowType, status: e.target.value })}
                    displayEmpty
                    sx={{ minWidth: 140, bgcolor: "white", borderRadius: 2 }}
                >
                    <MenuItem value="ALL">All Status</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="FAILED">Failed</MenuItem>
                    <MenuItem value="DELETED">Deleted</MenuItem>
                </Select>

                {/* Flow Type Filter */}
                <Select
                    size="small"
                    value={selectedFlowType}
                    onChange={(e) => onFilterChange({ flowType: e.target.value, status: selectedStatus })}
                    displayEmpty
                    sx={{ minWidth: 140, bgcolor: "white", borderRadius: 2 }}
                >
                    <MenuItem value="ALL">All Flow Types</MenuItem>
                    <MenuItem value="CONNECTIVITY">Connectivity</MenuItem>
                    <MenuItem value="STEERING">Steering</MenuItem>
                    <MenuItem value="ACL">ACL</MenuItem>
                </Select>

                {/* Spacer */}
                <Box flex={1} />

                {/* Actions */}
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<SyncIcon />}
                        onClick={onSyncFlows}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                    >
                        Sync Flows
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={onAddPolicy}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, boxShadow: 'none', whiteSpace: "nowrap" }}
                    >
                        Add Policy
                    </Button>
                </Stack>
            </Stack>

            {/* Summary Cards */}
            <Stack direction="row" spacing={2} sx={{ overflowX: "auto", pb: 1 }}>
                <StatusCard label="Total Flows" count={stats.total} total={stats.total} color="#3B82F6" />
                <StatusCard label="Active" count={stats.active} total={stats.total} color="#22C55E" />
                <StatusCard label="Pending" count={stats.pending} total={stats.total} color="#EAB308" />
                <StatusCard label="Failed" count={stats.failed} total={stats.total} color="#EF4444" />
            </Stack>
        </Box>
    );
};
