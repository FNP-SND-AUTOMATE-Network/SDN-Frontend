import React from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, FormHelperText, CircularProgress } from '@mui/material';
import { $api } from "@/lib/apiv2/fetch";


interface StepTargetDeviceProps {
    nodeId: string;
    setNodeId: (id: string) => void;
}

export const StepTargetDevice: React.FC<StepTargetDeviceProps> = ({ nodeId, setNodeId }) => {
    // Fetch available devices
    const { data, isLoading, error } = $api.useQuery("get", "/api/v1/nbi/devices");
    const devices = ((data as Record<string, unknown>)?.devices as { node_id: string; device_type?: string; name?: string }[]) || [];
    const switchDevices = devices.filter((d) =>
        String(d.node_id).toLowerCase().includes('openflow') ||
        String(d.device_type).toUpperCase() === 'SWITCH'
    );

    return (
        <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
                Select Target Device
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Choose the network node where this flow policy will be deployed.
            </Typography>

            <FormControl fullWidth error={!!error}>
                <InputLabel id="target-device-label">Target Node ID</InputLabel>
                <Select
                    labelId="target-device-label"
                    id="target-device-select"
                    value={nodeId}
                    label="Target Node ID"
                    onChange={(e) => setNodeId(e.target.value)}
                    sx={{ borderRadius: 2 }}
                >
                    {isLoading ? (
                        <MenuItem disabled value="">
                            <CircularProgress size={20} sx={{ mr: 2 }} /> Loading devices...
                        </MenuItem>
                    ) : switchDevices.length === 0 ? (
                        <MenuItem disabled value="">
                            No switch devices available
                        </MenuItem>
                    ) : (
                        switchDevices.map((device) => (
                            <MenuItem key={device.node_id} value={device.node_id}>
                                {device.name} ({device.node_id})
                            </MenuItem>
                        ))
                    )}
                </Select>
                {error && <FormHelperText>Failed to load devices</FormHelperText>}
            </FormControl>
        </Box>
    );
};
