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
    CircularProgress,
} from "@mui/material";
import {
    Search,
    Close,
    PlayArrow,
    Monitor,
    TaskAlt,
    AccessTime,
    HighlightOff
} from "@mui/icons-material";

interface StatusCounts {
    total: number;
    online: number;
    lastSuccess: number;
    lastFailed: number;
}

interface BackupHeaderProps {
    onSearch: (searchTerm: string) => void;
    onFilterChange: (filters: { type: string; site: string }) => void;
    onRunBackup: () => void;
    searchTerm: string;
    selectedType: string;
    selectedSite: string;
    statusCounts?: StatusCounts;
    selectedCount: number;
    isTriggering: boolean;
    sites: { id: string; name: string }[];
}

// Status Card Component
function StatusCard({
    label,
    count,
    color,
    icon,
}: {
    label: string;
    count: number;
    color: string;
    icon?: React.ReactNode;
}) {
    return (
        <Paper variant="outlined" sx={{ flex: 1, minWidth: 140, p: 2, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Box sx={{ color, display: "flex", alignItems: "center" }}>
                    {icon}
                </Box>
                <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ letterSpacing: 0.5 }}
                >
                    {label}
                </Typography>
            </Stack>
            <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography variant="h5" fontWeight={700}>
                    {count.toLocaleString()}
                </Typography>
            </Stack>
        </Paper>
    );
}

export default function BackupHeader({
    onSearch,
    onFilterChange,
    onRunBackup,
    searchTerm,
    selectedType,
    selectedSite,
    statusCounts,
    selectedCount,
    isTriggering,
    sites,
}: BackupHeaderProps) {
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
            <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Device Backups
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage configuration backups across network devices
                    </Typography>
                </Box>
            </Box>

            {/* Status Cards */}
            {/* Search + Filters + Action */}
            <Stack direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ sm: "center" }} sx={{ mb: 2 }}>
                {/* Search */}
                <TextField
                    size="small"
                    placeholder="Search hostname or IP..."
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

                {/* Type Filter */}
                <Select
                    size="small"
                    value={selectedType}
                    onChange={(e) =>
                        onFilterChange({ type: e.target.value, site: selectedSite })
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

                {/* Site Filter */}
                <Select
                    size="small"
                    value={selectedSite}
                    onChange={(e) =>
                        onFilterChange({ type: selectedType, site: e.target.value })
                    }
                    displayEmpty
                    sx={{ minWidth: 140, bgcolor: "white", borderRadius: 2 }}
                >
                    <MenuItem value="">All Sites</MenuItem>
                    {sites.map(s => (
                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                </Select>

                {/* Spacer */}
                <Box flex={1} />

                {/* Selection Area */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {selectedCount > 0 && (
                        <Typography variant="body2" color="text.secondary">
                            {selectedCount} selected
                        </Typography>
                    )}
                    <Button
                        variant="contained"
                        disabled={selectedCount === 0 || isTriggering}
                        startIcon={isTriggering ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                        onClick={onRunBackup}
                        sx={{ whiteSpace: "nowrap", borderRadius: 2 }}
                    >
                        {isTriggering ? "Triggering..." : "Run Backup"}
                    </Button>
                </Box>
            </Stack>
            {statusCounts && (
                <Stack direction="row" spacing={2} sx={{ overflowX: "auto", mb: 3 }}>
                    <StatusCard label="Total Devices" count={statusCounts.total} color="#3B82F6" icon={<Monitor />} />
                    <StatusCard label="Online" count={statusCounts.online} color="#22C55E" icon={<TaskAlt />} />
                    <StatusCard label="Last Success" count={statusCounts.lastSuccess} color="#22C55E" icon={<AccessTime />} />
                    <StatusCard label="Last Failed" count={statusCounts.lastFailed} color="#EF4444" icon={<HighlightOff />} />
                </Stack>
            )}

        </Box>
    );
}
