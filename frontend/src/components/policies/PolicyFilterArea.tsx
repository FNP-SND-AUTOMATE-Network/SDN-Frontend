import React from 'react';
import { Box, TextField, MenuItem, Select, FormControl, InputLabel, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

export interface FilterState {
    search: string;
    status: string;
    flowType: string;
}

interface PolicyFilterAreaProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
}

export const PolicyFilterArea: React.FC<PolicyFilterAreaProps> = ({ filters, onFilterChange }) => {
    const handleChange = (field: keyof FilterState, value: string) => {
        onFilterChange({ ...filters, [field]: value });
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
                placeholder="Search Node ID..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                size="small"
                sx={{ minWidth: 240, bgcolor: 'background.paper', '& fieldset': { borderRadius: 2 } }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" fontSize="small" />
                        </InputAdornment>
                    ),
                }}
            />

            <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="status-filter-label" sx={{ fontSize: '0.875rem' }}>Status</InputLabel>
                <Select
                    labelId="status-filter-label"
                    id="status-filter"
                    value={filters.status}
                    label="Status"
                    onChange={(e) => handleChange('status', e.target.value as string)}
                    sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                >
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="FAILED">Failed</MenuItem>
                    <MenuItem value="DELETED">Deleted</MenuItem>
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="flow-type-filter-label" sx={{ fontSize: '0.875rem' }}>Flow Type</InputLabel>
                <Select
                    labelId="flow-type-filter-label"
                    id="flow-type-filter"
                    value={filters.flowType}
                    label="Flow Type"
                    onChange={(e) => handleChange('flowType', e.target.value as string)}
                    sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                >
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="CONNECTIVITY">Connectivity</MenuItem>
                    <MenuItem value="STEERING">Steering</MenuItem>
                    <MenuItem value="ACL">ACL</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};
