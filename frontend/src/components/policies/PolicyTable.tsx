import React from 'react';
import {
    Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Chip, Typography, CircularProgress, Tooltip, Stack,
    TablePagination, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Replay as RetryIcon,
    SettingsPower as ReactivateIcon,
    DeleteOutline as DeleteIcon,
    DeleteForever as HardDeleteIcon,
    MoreVert as MoreVertIcon,
    Circle as CircleIcon
} from '@mui/icons-material';
import { components } from "@/lib/apiv2/schema";

type FlowRule = components["schemas"]["FlowRuleItem"];

interface PolicyTableProps {
    data: FlowRule[];
    isLoading: boolean;
    onView: (rule: FlowRule) => void;
    onRetry: (ruleId: string) => void;
    onReactivate: (ruleId: string) => void;
    onDelete: (ruleId: string) => void;
    onHardDelete: (ruleId: string) => void;
    page: number;
    rowsPerPage: number;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newRowsPerPage: number) => void;
    totalCount: number;
}

const StatusChip = ({ status }: { status?: string }) => {
    let color: 'success' | 'warning' | 'error' | 'default' = 'default';

    switch (status?.toUpperCase()) {
        case 'ACTIVE': color = 'success'; break;
        case 'PENDING': color = 'warning'; break;
        case 'FAILED': color = 'error'; break;
        case 'DELETED': color = 'default'; break;
    }

    return (
        <Chip
            icon={<CircleIcon sx={{ fontSize: '10px !important', color: `${color} !important` }} />}
            label={status || 'UNKNOWN'}
            color={color}
            size="small"
            sx={{ fontWeight: 600, fontSize: '0.75rem', borderRadius: 1.5 }}
        />
    );
};

const RowActions = ({
    row, onView, onRetry, onReactivate, onDelete, onHardDelete
}: {
    row: FlowRule,
    onView: (rule: FlowRule) => void,
    onRetry: (ruleId: string) => void,
    onReactivate: (ruleId: string) => void,
    onDelete: (ruleId: string) => void,
    onHardDelete: (ruleId: string) => void
}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const buildAction = (label: string, icon: React.ReactNode, onClick: () => void, color?: string) => (
        <MenuItem onClick={() => { onClick(); handleClose(); }} sx={{ color: color || 'inherit' }}>
            <ListItemIcon sx={{ color: color || 'inherit' }}>{icon}</ListItemIcon>
            <ListItemText>{label}</ListItemText>
        </MenuItem>
    );

    return (
        <>
            <IconButton size="small" onClick={handleClick}>
                <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: { minWidth: 160, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                }}
            >
                {buildAction("View Details", <VisibilityIcon fontSize="small" />, () => onView(row))}

                {row.status === 'FAILED' && row.id &&
                    buildAction("Retry Deployment", <RetryIcon fontSize="small" />, () => onRetry(row.id as string), "warning.main")}

                {row.status === 'DELETED' && row.id &&
                    buildAction("Reactivate Rule", <ReactivateIcon fontSize="small" />, () => onReactivate(row.id as string), "info.main")}

                {row.status !== 'DELETED' && row.id &&
                    buildAction("Delete Rule", <DeleteIcon fontSize="small" />, () => onDelete(row.id as string), "error.main")}

                {(row.status === 'DELETED' || row.status === 'FAILED') && row.id &&
                    buildAction("Hard Delete", <HardDeleteIcon fontSize="small" />, () => onHardDelete(row.id as string), "error.main")}
            </Menu>
        </>
    );
};

export const PolicyTable: React.FC<PolicyTableProps> = ({
    data, isLoading, onView, onRetry, onReactivate, onDelete, onHardDelete,
    page, rowsPerPage, onPageChange, onRowsPerPageChange, totalCount
}) => {
    return (
        <>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
                <Table sx={{ minWidth: 750 }} size="medium">
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Flow ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Node ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Table ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Flow Type</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                    <CircularProgress size={32} />
                                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>Loading flow rules...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                    <Typography variant="body1" color="text.secondary">No flow policies found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>
                                        <Typography title={row.id} variant="caption" sx={{ bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>
                                            {row.id ? row.flow_id : '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500}>{row.node_id}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{row.table_id}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">{row.flow_type || '-'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip status={row.status} />
                                    </TableCell>
                                    <TableCell align="right">
                                        <RowActions
                                            row={row}
                                            onView={onView}
                                            onRetry={onRetry}
                                            onReactivate={onReactivate}
                                            onDelete={onDelete}
                                            onHardDelete={onHardDelete}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => onPageChange(newPage)}
                onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
                sx={{ borderTop: 1, borderColor: "divider" }}
            />
        </>
    );
};
