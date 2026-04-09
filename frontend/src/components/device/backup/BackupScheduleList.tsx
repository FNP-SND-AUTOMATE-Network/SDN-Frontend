import React, { useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActions,
    Grid,
    IconButton,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tooltip,
    Divider,
    CardActionArea,
    Menu,
    MenuItem,
} from "@mui/material";
import {
    Delete as DeleteIcon,
    EventAvailable,
    EventRepeat,
    CalendarMonth,
    AccessTime,
    PlayArrow,

    CheckCircleOutline,
    Close as CloseIcon,
    MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { $api, fetchClient } from "@/lib/apiv2/fetch";
import { components } from "@/lib/apiv2/schema";
import { useSnackbar } from "@/hooks/useSnackbar";
import { useAuth } from "@/contexts/AuthContext";

interface BackupScheduleListProps {
    onTriggerNew?: () => void;
}

export default function BackupScheduleList({ onTriggerNew }: BackupScheduleListProps) {
    const { showError, showSuccess } = useSnackbar();
    const { user } = useAuth();

    // Fetch schedules
    const { data: listResponse, isLoading, refetch } = $api.useQuery("get", "/backups/", {
        params: {
            query: {
                page: 1,
                page_size: 100,
            }
        }
    });

    const schedules = listResponse?.backups ?? [];

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Detail Modal State
    const [detailSchedule, setDetailSchedule] = useState<components["schemas"]["BackupResponse"] | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const handleOpenDetail = (schedule: components["schemas"]["BackupResponse"]) => {
        setDetailSchedule(schedule);
        setIsDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setTimeout(() => setDetailSchedule(null), 300);
    };

    // Status Menu State
    const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null);
    const [statusSchedule, setStatusSchedule] = useState<components["schemas"]["BackupResponse"] | null>(null);

    const handleStatusMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, schedule: components["schemas"]["BackupResponse"]) => {
        event.stopPropagation();
        setStatusAnchorEl(event.currentTarget);
        setStatusSchedule(schedule);
    };

    const handleStatusMenuClose = () => {
        setStatusAnchorEl(null);
        setStatusSchedule(null);
    };

    const handleAction = async (action: "pause" | "reactivate" | "offline", targetSchedule: components["schemas"]["BackupResponse"] | null) => {
        if (!targetSchedule) return;
        handleStatusMenuClose();
        
        try {
            if (action === "pause") {
                const { error } = await fetchClient.PUT("/backups/{backup_id}/pause", {
                    params: { path: { backup_id: targetSchedule.id } }
                });
                if (error) throw new Error((error as any)?.detail || "Failed to pause schedule");
                showSuccess("Schedule paused successfully");
            } else if (action === "reactivate") {
                const { error } = await fetchClient.PUT("/backups/{backup_id}/reactivate", {
                    params: { path: { backup_id: targetSchedule.id } }
                });
                if (error) throw new Error((error as any)?.detail || "Failed to reactivate schedule");
                showSuccess("Schedule reactivated successfully");
            } else if (action === "offline") {
                const { error } = await fetchClient.PUT("/backups/{backup_id}", {
                    params: { path: { backup_id: targetSchedule.id } },
                    body: { status: "OFFLINE" } as any
                });
                if (error) throw new Error((error as any)?.detail || "Failed to set to offline");
                showSuccess("Status updated to OFFLINE");
            }

            refetch();
            
            if (detailSchedule && detailSchedule.id === targetSchedule.id) {
                setDetailSchedule({
                    ...detailSchedule,
                    status: action === "pause" ? "PAUSED" : (action === "reactivate" ? "ONLINE" : "OFFLINE")
                });
            }
        } catch (err: any) {
             showError(err.message || "Failed to perform action");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const { error } = await fetchClient.DELETE("/backups/{backup_id}", {
                params: { path: { backup_id: deleteId } }
            });

            if (error) {
                throw new Error((error as any)?.detail || "Failed to delete schedule.");
            }

            showSuccess("Backup schedule deleted successfully.");
            setDeleteId(null);
            refetch();
        } catch (err: any) {
            console.error("Delete failed", err);
            showError(err.message || "An error occurred.");
        } finally {
            setIsDeleting(false);
        }
    };

    const ScheduleIcon = ({ type }: { type: string }) => {
        switch (type) {
            case "DAILY": return <AccessTime fontSize="small" />;
            case "WEEKLY": return <EventRepeat fontSize="small" />;
            case "CUSTOM_CRON": return <CalendarMonth fontSize="small" />;
            default: return <EventAvailable fontSize="small" />;
        }
    };

    const convertCronToText = (cron: string | null | undefined, type: string) => {
        if (!cron) return "No schedule defined";
        if (type === "CUSTOM_CRON") return `CRON: ${cron}`;
        
        const parts = cron.split(" ");
        if (parts.length < 5) return `CRON: ${cron}`;
        
        const minutes = parts[0].padStart(2, '0');
        const hours = parts[1].padStart(2, '0');
        const dow = parts[4];
        
        if (type === "DAILY" || dow === "*") {
            return `Every day at ${hours}:${minutes}`;
        } else if (type === "WEEKLY") {
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const dayName = days[parseInt(dow, 10)] || `Day ${dow}`;
            return `Every ${dayName} at ${hours}:${minutes}`;
        }
        
        return `CRON: ${cron}`;
    };

    if (isLoading) {
        return <Typography sx={{ mt: 4, mb: 4 }} align="center" color="text.secondary">Loading schedules...</Typography>;
    }

    return (
        <Box sx={{ mt: 2, mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>Scheduled Tasks ({schedules.length})</Typography>
                {onTriggerNew && (
                    <Button variant="contained" startIcon={<PlayArrow />} onClick={onTriggerNew} size="small">
                        New Schedule
                    </Button>
                )}
            </Box>

            {schedules.length === 0 ? (
                <Box sx={{ p: 6, textAlign: "center", bgcolor: "grey.50", borderRadius: 2, border: "1px dashed", borderColor: "grey.300" }}>
                    <EventRepeat sx={{ fontSize: 40, color: "grey.400", mb: 2 }} />
                    <Typography color="text.secondary">No scheduled tasks found.</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Create one by selecting devices in the Devices tab and clicking "Schedule Backup".
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {schedules.map((schedule) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={schedule.id}>
                            <Card variant="outlined" sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                borderRadius: 2,
                                transition: '0.2s',
                                '&:hover': {
                                    boxShadow: 2,
                                    borderColor: 'primary.main'
                                }
                            }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", p: 2, pb: 0 }}>
                                    <Typography variant="subtitle1" fontWeight={700} sx={{ wordBreak: 'break-word', pr: 1 }}>
                                        {schedule.backup_name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip 
                                            label={schedule.status} 
                                            size="small" 
                                            color={schedule.status === "ONLINE" ? "success" : schedule.status === "PAUSED" ? "warning" : "default"}
                                            sx={{ fontWeight: 600, fontSize: '0.7rem', height: 20 }}
                                        />
                                        <IconButton 
                                            size="small" 
                                            onClick={(e) => handleStatusMenuOpen(e, schedule)}
                                            sx={{ padding: 0.5 }}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <CardActionArea onClick={() => handleOpenDetail(schedule)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                                    <CardContent sx={{ flexGrow: 1, pt: 1, pb: 1 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                                            {schedule.description || "No description provided."}
                                        </Typography>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, bgcolor: 'grey.50', p: 1.5, borderRadius: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <ScheduleIcon type={schedule.schedule_type} />
                                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                                    {schedule.schedule_type === "NONE" ? "Manual Trigger" : schedule.schedule_type}
                                                </Typography>
                                            </Box>
                                            
                                            {schedule.auto_backup && schedule.schedule_type !== "NONE" && (
                                                <Typography variant="caption" sx={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif", color: 'primary.dark' }}>
                                                    {convertCronToText(schedule.cron_expression, schedule.schedule_type)}
                                                </Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                </CardActionArea>
                                <CardActions sx={{ borderTop: "1px solid", borderColor: "grey.100", p: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Created By: {schedule.created_by === user?.id ? "You" : schedule.created_by ? `${schedule.created_by.substring(0,8)}...` : "System"}
                                    </Typography>
                                    <Tooltip title="Delete Schedule">
                                        <IconButton size="small" color="error" onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteId(schedule.id);
                                        }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Delete Confirmation */}
            <Dialog open={!!deleteId} onClose={() => !isDeleting && setDeleteId(null)}>
                <DialogTitle>Delete Schedule</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this backup schedule? Devices associated with this profile will no longer be backed up automatically.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteId(null)} disabled={isDeleting}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Detail Modal */}
            <Dialog open={isDetailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div" fontWeight={600}>Schedule Details</Typography>
                    <IconButton onClick={handleCloseDetail} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {detailSchedule && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Profile Name</Typography>
                                <Typography variant="body1" fontWeight={500}>{detailSchedule.backup_name}</Typography>
                            </Box>
                            
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Description</Typography>
                                <Typography variant="body2">{detailSchedule.description || "-"}</Typography>
                            </Box>

                            <Divider />

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Status</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip 
                                            label={detailSchedule.status} 
                                            size="small" 
                                            color={detailSchedule.status === "ONLINE" ? "success" : detailSchedule.status === "PAUSED" ? "warning" : "default"}
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Auto Backup</Typography>
                                    <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {detailSchedule.auto_backup ? <CheckCircleOutline color="success" fontSize="small" /> : <EventAvailable color="action" fontSize="small" />}
                                        <Typography variant="body2">{detailSchedule.auto_backup ? "Enabled" : "Disabled"}</Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Schedule Mode</Typography>
                                    <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>{detailSchedule.schedule_type}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Retention Days</Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>{detailSchedule.retention_days} Days</Typography>
                                </Grid>
                            </Grid>

                            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Cron Expression / Runtime</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                    <ScheduleIcon type={detailSchedule.schedule_type} />
                                    <Typography variant="body1" color="primary.dark" fontWeight={600}>
                                        {convertCronToText(detailSchedule.cron_expression, detailSchedule.schedule_type)}
                                    </Typography>
                                </Box>
                                {detailSchedule.schedule_type === "CUSTOM_CRON" && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                        Raw Cron: <code>{detailSchedule.cron_expression}</code>
                                    </Typography>
                                )}
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                    Associated Devices
                                </Typography>
                                {(!detailSchedule.devices || detailSchedule.devices.length === 0) ? (
                                    <Typography variant="body2" color="text.secondary">No devices assigned to this schedule.</Typography>
                                ) : (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 120, overflowY: 'auto', p: 1, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                                        {detailSchedule.devices.map(d => (
                                            <Chip key={d.id} label={d.device_name} size="small" variant="outlined" sx={{ bgcolor: 'white' }} />
                                        ))}
                                    </Box>
                                )}
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="caption" color="text.disabled">Created: {new Date(detailSchedule.created_at).toLocaleString()}</Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                        {detailSchedule?.status === "ONLINE" && (
                            <Button color="warning" onClick={() => handleAction("pause", detailSchedule)}>
                                Pause Schedule
                            </Button>
                        )}
                        {detailSchedule?.status === "PAUSED" && (
                            <Button color="success" onClick={() => handleAction("reactivate", detailSchedule)}>
                                Reactivate
                            </Button>
                        )}
                        {detailSchedule?.status === "OFFLINE" && (
                            <Button color="success" onClick={() => handleAction("reactivate", detailSchedule)}>
                                Bring Online
                            </Button>
                        )}
                    </Box>
                    <Button onClick={handleCloseDetail} variant="outlined">Close</Button>
                </DialogActions>
            </Dialog>

            {/* Status Change Menu */}
            <Menu
                anchorEl={statusAnchorEl}
                open={Boolean(statusAnchorEl)}
                onClose={handleStatusMenuClose}
            >
                <MenuItem onClick={() => handleAction("reactivate", statusSchedule)}>
                    <CheckCircleOutline sx={{ mr: 1, fontSize: 20, color: 'success.main' }} /> ONLINE (Reactivate)
                </MenuItem>
                <MenuItem onClick={() => handleAction("pause", statusSchedule)}>
                    <EventRepeat sx={{ mr: 1, fontSize: 20, color: 'warning.main' }} /> PAUSED (Pause)
                </MenuItem>
                <MenuItem onClick={() => handleAction("offline", statusSchedule)}>
                    <CloseIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} /> OFFLINE
                </MenuItem>
            </Menu>
        </Box>
    );
}
