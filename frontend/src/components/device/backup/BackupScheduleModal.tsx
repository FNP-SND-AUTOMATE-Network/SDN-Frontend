import React, { useState, useMemo } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Box,
    Typography,
    CircularProgress,
    Stack,
    Chip,
    Checkbox,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    InputAdornment,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { $api, fetchClient } from "@/lib/apiv2/fetch";
import { useSnackbar } from "@/hooks/useSnackbar";
import { useAuth } from "@/contexts/AuthContext";

interface DeviceNetwork {
    id: string;
    device_name: string;
}

interface BackupScheduleModalProps {
    open: boolean;
    onClose: () => void;
    selectedDevices: DeviceNetwork[];
    onSuccess: () => void;
}

export function BackupScheduleModal({ open, onClose, selectedDevices, onSuccess }: BackupScheduleModalProps) {
    const { showSuccess, showError } = useSnackbar();
    const { user } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [backupName, setBackupName] = useState("");
    const [description, setDescription] = useState("");
    const [autoBackup, setAutoBackup] = useState(true);
    const [scheduleType, setScheduleType] = useState<"DAILY" | "WEEKLY" | "CUSTOM_CRON" | "NONE">("DAILY");

    // Time states
    const [time, setTime] = useState("02:00"); // HH:mm
    const [dayOfWeek, setDayOfWeek] = useState("0"); // 0=Sunday
    const [customCron, setCustomCron] = useState("0 2 * * *");

    // Device picker states (used when no pre-selected devices)
    const [pickedDeviceIds, setPickedDeviceIds] = useState<string[]>([]);
    const [deviceSearch, setDeviceSearch] = useState("");

    // Whether we should show the device picker (no pre-selected devices from parent)
    const showDevicePicker = selectedDevices.length === 0;

    // Fetch all devices for the picker
    const { data: allDevicesResponse } = $api.useQuery("get", "/device-networks/", {
        params: { query: { page: 1, page_size: 100 } },
    }, {
        enabled: open && showDevicePicker,
    });
    const allDevices = allDevicesResponse?.devices ?? [];

    const filteredDevices = useMemo(() => {
        if (!deviceSearch.trim()) return allDevices;
        const q = deviceSearch.toLowerCase();
        return allDevices.filter(d =>
            (d.device_name?.toLowerCase().includes(q)) ||
            (d.ip_address?.toLowerCase().includes(q))
        );
    }, [allDevices, deviceSearch]);

    const toggleDevice = (id: string) => {
        setPickedDeviceIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (pickedDeviceIds.length === filteredDevices.length) {
            setPickedDeviceIds([]);
        } else {
            setPickedDeviceIds(filteredDevices.map(d => d.id));
        }
    };

    // The final list of devices to associate
    const finalDevices: DeviceNetwork[] = showDevicePicker
        ? allDevices.filter(d => pickedDeviceIds.includes(d.id)).map(d => ({ id: d.id, device_name: d.device_name || d.id }))
        : selectedDevices;

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
            // Reset form after modal close animation
            setTimeout(() => {
                setBackupName("");
                setDescription("");
                setAutoBackup(true);
                setScheduleType("DAILY");
                setTime("02:00");
                setDayOfWeek("0");
                setCustomCron("0 2 * * *");
                setPickedDeviceIds([]);
                setDeviceSearch("");
            }, 300);
        }
    };

    const getCronExpression = () => {
        if (!autoBackup || scheduleType === "NONE") return null;

        if (scheduleType === "CUSTOM_CRON") return customCron;

        const [hours, minutes] = time.split(":");
        if (!hours || !minutes) return "0 0 * * *";

        if (scheduleType === "DAILY") {
            return `${parseInt(minutes)} ${parseInt(hours)} * * *`;
        } else if (scheduleType === "WEEKLY") {
            return `${parseInt(minutes)} ${parseInt(hours)} * * ${dayOfWeek}`;
        }
        return null;
    };

    const handleSubmit = async () => {
        if (!backupName.trim()) {
            showError("Backup Name is required");
            return;
        }

        if (finalDevices.length === 0) {
            showError("Please select at least one device");
            return;
        }

        const cronStr = getCronExpression();

        setIsSubmitting(true);
        try {
            const { data: backupData, error: backupError } = await fetchClient.POST("/backups/", {
                body: {
                    backup_name: backupName,
                    description: description || null,
                    policy_id: null,
                    os_id: null,
                    auto_backup: autoBackup,
                    schedule_type: autoBackup ? scheduleType : "NONE",
                    cron_expression: cronStr,
                    status: "ONLINE",
                    retention_days: 30,
                } as any
            });

            if (backupError) {
                throw new Error((backupError as any)?.detail || "Failed to create Backup Profile");
            }

            const newBackupId = (backupData as any)?.backup?.id || (backupData as any)?.id;

            if (!newBackupId) {
                throw new Error("Did not receive a valid Backup ID from server");
            }

            // 2. Associate selected devices to this new Backup Profile
            if (finalDevices.length > 0) {
                const updatePromises = finalDevices.map(async (device) => {
                    const { data: existingDevice, error: fetchErr } = await fetchClient.GET("/device-networks/{device_id}", {
                        params: { path: { device_id: device.id } }
                    });

                    if (fetchErr || !existingDevice) {
                        console.warn(`Could not fetch details for device ${device.id}`);
                        return;
                    }

                    await fetchClient.PUT("/device-networks/{device_id}", {
                        params: { path: { device_id: device.id } },
                        body: {
                            ...existingDevice,
                            backup_id: newBackupId
                        } as any
                    });
                });

                await Promise.allSettled(updatePromises);
            }

            showSuccess(`Successfully created schedule '${backupName}' for ${finalDevices.length} device(s).`);
            onSuccess();
            handleClose();

        } catch (err: any) {
            console.error("Schedule Error:", err);
            showError(err.message || "Failed to schedule backup");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Create Backup Schedule
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>

                    {/* Device selection area */}
                    {showDevicePicker ? (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Select Target Devices ({pickedDeviceIds.length} selected)
                            </Typography>
                            <TextField
                                placeholder="Search devices..."
                                size="small"
                                fullWidth
                                value={deviceSearch}
                                onChange={(e) => setDeviceSearch(e.target.value)}
                                disabled={isSubmitting}
                                sx={{ mb: 1 }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" color="action" />
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                            />
                            <Box sx={{
                                border: '1px solid',
                                borderColor: 'grey.300',
                                borderRadius: 1,
                                maxHeight: 220,
                                overflowY: 'auto',
                                bgcolor: 'grey.50',
                            }}>
                                {/* Select All */}
                                <ListItem disablePadding sx={{ borderBottom: '1px solid', borderColor: 'grey.200' }}>
                                    <ListItemButton dense onClick={toggleAll} disabled={isSubmitting}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <Checkbox
                                                edge="start"
                                                checked={filteredDevices.length > 0 && pickedDeviceIds.length === filteredDevices.length}
                                                indeterminate={pickedDeviceIds.length > 0 && pickedDeviceIds.length < filteredDevices.length}
                                                disableRipple
                                                size="small"
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={<Typography variant="body2" fontWeight={600}>Select All</Typography>}
                                        />
                                    </ListItemButton>
                                </ListItem>
                                {filteredDevices.length === 0 ? (
                                    <Box sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">No devices found.</Typography>
                                    </Box>
                                ) : (
                                    <List disablePadding>
                                        {filteredDevices.map(d => (
                                            <ListItem key={d.id} disablePadding>
                                                <ListItemButton dense onClick={() => toggleDevice(d.id)} disabled={isSubmitting}>
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        <Checkbox
                                                            edge="start"
                                                            checked={pickedDeviceIds.includes(d.id)}
                                                            disableRipple
                                                            size="small"
                                                        />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={d.device_name || d.id}
                                                        secondary={d.ip_address || undefined}
                                                        primaryTypographyProps={{ variant: 'body2' }}
                                                        secondaryTypographyProps={{ variant: 'caption' }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Box>
                        </Box>
                    ) : (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Target Devices ({selectedDevices.length})
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 80, overflowY: 'auto', p: 1, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                                {selectedDevices.map(d => (
                                    <Chip key={d.id} label={d.device_name} size="small" />
                                ))}
                            </Box>
                        </Box>
                    )}

                    <TextField
                        label="Profile Name"
                        value={backupName}
                        onChange={(e) => setBackupName(e.target.value)}
                        fullWidth
                        size="small"
                        required
                        disabled={isSubmitting}
                        placeholder="e.g. Core Switch Nightly Backup"
                    />

                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        disabled={isSubmitting}
                    />

                    <FormControlLabel
                        control={<Switch checked={autoBackup} onChange={(e) => setAutoBackup(e.target.checked)} disabled={isSubmitting} />}
                        label="Enable Automatic Schedule"
                    />

                    {autoBackup && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <FormControl size="small" fullWidth disabled={isSubmitting}>
                                <InputLabel>Schedule Type</InputLabel>
                                <Select
                                    label="Schedule Type"
                                    value={scheduleType}
                                    onChange={(e) => setScheduleType(e.target.value as any)}
                                >
                                    <MenuItem value="DAILY">Daily</MenuItem>
                                    <MenuItem value="WEEKLY">Weekly</MenuItem>
                                    <MenuItem value="CUSTOM_CRON">Custom Cron Expression</MenuItem>
                                </Select>
                            </FormControl>

                            {scheduleType === "DAILY" && (
                                <TextField
                                    label="Backup Time"
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    fullWidth
                                    size="small"
                                    disabled={isSubmitting}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    helperText="Backups will run every day at this time."
                                />
                            )}

                            {scheduleType === "WEEKLY" && (
                                <Stack direction="row" spacing={2}>
                                    <FormControl size="small" fullWidth disabled={isSubmitting}>
                                        <InputLabel>Day of Week</InputLabel>
                                        <Select
                                            label="Day of Week"
                                            value={dayOfWeek}
                                            onChange={(e) => setDayOfWeek(e.target.value)}
                                        >
                                            <MenuItem value="0">Sunday</MenuItem>
                                            <MenuItem value="1">Monday</MenuItem>
                                            <MenuItem value="2">Tuesday</MenuItem>
                                            <MenuItem value="3">Wednesday</MenuItem>
                                            <MenuItem value="4">Thursday</MenuItem>
                                            <MenuItem value="5">Friday</MenuItem>
                                            <MenuItem value="6">Saturday</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="Time"
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        fullWidth
                                        size="small"
                                        disabled={isSubmitting}
                                        slotProps={{ inputLabel: { shrink: true } }}
                                    />
                                </Stack>
                            )}

                            {scheduleType === "CUSTOM_CRON" && (
                                <TextField
                                    label="Cron Expression"
                                    value={customCron}
                                    onChange={(e) => setCustomCron(e.target.value)}
                                    fullWidth
                                    size="small"
                                    disabled={isSubmitting}
                                    helperText="Standard CRON string (e.g. 0 2 * * *)"
                                />
                            )}
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} disabled={isSubmitting} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting || !backupName.trim() || finalDevices.length === 0}
                    startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
                >
                    {isSubmitting ? "Saving..." : `Create Schedule (${finalDevices.length})`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
