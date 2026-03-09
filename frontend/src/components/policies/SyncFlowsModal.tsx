import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, CircularProgress, Box, Checkbox, List, ListItem,
    ListItemButton, ListItemIcon, ListItemText, Alert
} from '@mui/material';
import { Router as RouterIcon } from '@mui/icons-material';
import { $api, fetchClient } from "@/lib/apiv2/fetch";
import { useSnackbar } from "@/hooks/useSnackbar";

interface SyncFlowsModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const SyncFlowsModal: React.FC<SyncFlowsModalProps> = ({ open, onClose, onSuccess }) => {
    const { showSuccess, showError } = useSnackbar();
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    // Fetch all devices from NBI
    const { data, isLoading, error } = $api.useQuery("get", "/api/v1/nbi/devices", {}, { enabled: open });
    const allDevices = (data as any)?.devices || [];

    // L2 / OpenFlow devices filter (Assuming node_id contains openflow: or they are switches)
    const switchDevices = allDevices.filter((d: any) =>
        String(d.node_id).toLowerCase().includes('openflow') ||
        String(d.device_type).toUpperCase() === 'SWITCH'
    );

    const handleToggle = (nodeId: string) => () => {
        const currentIndex = selectedDevices.indexOf(nodeId);
        const newChecked = [...selectedDevices];

        if (currentIndex === -1) {
            newChecked.push(nodeId);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setSelectedDevices(newChecked);
    };

    const handleSelectAll = () => {
        if (selectedDevices.length === switchDevices.length) {
            setSelectedDevices([]);
        } else {
            setSelectedDevices(switchDevices.map((d: any) => d.node_id));
        }
    };

    const handleSync = async () => {
        if (selectedDevices.length === 0) return;
        setIsSyncing(true);

        try {
            // Run sync for each selected device
            const promises = selectedDevices.map(nodeId =>
                fetchClient.POST("/api/v1/nbi/devices/{node_id}/flows/sync", {
                    params: { path: { node_id: nodeId } }
                })
            );

            const results = await Promise.all(promises);
            const hasError = results.some(res => res.error);

            if (hasError) {
                showError("Some devices failed to sync. Please check the logs.");
            } else {
                showSuccess(`Successfully synced flows for ${selectedDevices.length} device(s)`);
            }
            onSuccess();
        } catch (err: any) {
            showError(err?.message || "Failed to trigger flow sync");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleClose = () => {
        if (!isSyncing) {
            setSelectedDevices([]);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Sync Flows</DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Select the L2 Switch (OpenFlow) devices you want to synchronize flows with.
                    This process will update the database state to match the controllers.
                </Typography>

                {isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">Failed to load devices</Alert>
                ) : switchDevices.length === 0 ? (
                    <Alert severity="info">No OpenFlow switch devices found</Alert>
                ) : (
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
                            <ListItem
                                disablePadding
                                sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}
                            >
                                <ListItemButton onClick={handleSelectAll} dense>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={switchDevices.length > 0 && selectedDevices.length === switchDevices.length}
                                            indeterminate={selectedDevices.length > 0 && selectedDevices.length < switchDevices.length}
                                            tabIndex={-1}
                                            disableRipple
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary="Select All" primaryTypographyProps={{ fontWeight: 600 }} />
                                </ListItemButton>
                            </ListItem>
                            {switchDevices.map((device: any) => {
                                const labelId = `checkbox-list-label-${device.node_id}`;
                                return (
                                    <ListItem
                                        key={device.node_id}
                                        disablePadding
                                    >
                                        <ListItemButton role={undefined} onClick={handleToggle(device.node_id)} dense>
                                            <ListItemIcon>
                                                <Checkbox
                                                    edge="start"
                                                    checked={selectedDevices.indexOf(device.node_id) !== -1}
                                                    tabIndex={-1}
                                                    disableRipple
                                                    inputProps={{ 'aria-labelledby': labelId }}
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                id={labelId}
                                                primary={device.name || device.node_id}
                                                secondary={device.node_id}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} disabled={isSyncing} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleSync}
                    variant="contained"
                    color="primary"
                    disabled={isSyncing || selectedDevices.length === 0}
                    startIcon={isSyncing ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isSyncing ? "Syncing..." : `Sync (${selectedDevices.length})`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
