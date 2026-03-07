import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    Chip,
    Paper,
    IconButton,
} from "@mui/material";
import { CheckCircleOutline, ErrorOutline, Visibility, AccessTime } from "@mui/icons-material";
import { components } from "@/lib/apiv2/schema";
import { UserNameResolver } from "./UserNameResolver";

type BackupRecord = components["schemas"]["DeviceBackupRecordResponse"];

interface BackupHistoryTableProps {
    records: BackupRecord[];
    onViewDetail: (record: BackupRecord) => void;
    selectedRecords?: string[];
    onSelectRecord?: (recordId: string) => void;
}

const formatSize = (bytes: number | null | undefined) => {
    if (bytes == null || isNaN(bytes)) return "-";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { datePart: "-", timePart: "-" };

    // MMM D, YYYY
    const datePart = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    // HH:mm:ss
    const timePart = date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return { datePart, timePart };
};

import { Checkbox } from "@mui/material";

export default function BackupHistoryTable({ records, onViewDetail, selectedRecords = [], onSelectRecord }: BackupHistoryTableProps) {
    return (
        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
                <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                        {onSelectRecord && (
                            <TableCell padding="checkbox">
                                {/* Compare max 2 */}
                            </TableCell>
                        )}
                        <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Config</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                        <TableCell align="right" />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {records.map((record) => {
                        const { datePart, timePart } = formatDate(record.created_at);
                        return (
                            <TableRow
                                key={record.id}
                                hover
                                onClick={() => onSelectRecord && onSelectRecord(record.id)}
                                sx={{ cursor: onSelectRecord ? 'pointer' : 'default' }}
                                selected={selectedRecords.includes(record.id)}
                            >
                                {onSelectRecord && (
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            checked={selectedRecords.includes(record.id)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                onSelectRecord(record.id);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </TableCell>
                                )}
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                            {datePart}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
                                            {timePart}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={record.config_type}
                                        size="small"
                                        sx={{
                                            borderRadius: 1,
                                            bgcolor: 'grey.100',
                                            color: 'text.secondary',
                                            fontWeight: 600,
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    {record.status === "SUCCESS" ? (
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#dcfce7', color: '#166534', px: 1, py: 0.5, borderRadius: 1.5, border: '1px solid #bbf7d0' }}>
                                            <CheckCircleOutline sx={{ fontSize: 16 }} />
                                            <Typography variant="caption" fontWeight={600}>Success</Typography>
                                        </Box>
                                    ) : record.status === "FAILED" ? (
                                        <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#fee2e2', color: '#991b1b', px: 1, py: 0.5, borderRadius: 1.5, border: '1px solid #fecaca', mb: 0.5 }}>
                                                <ErrorOutline sx={{ fontSize: 16 }} />
                                                <Typography variant="caption" fontWeight={600}>Failed</Typography>
                                            </Box>
                                            {record.error_message && (
                                                <Typography variant="caption" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <ErrorOutline sx={{ fontSize: 12 }} />
                                                    {record.error_message}
                                                </Typography>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#ffedd5', color: '#9a3412', px: 1, py: 0.5, borderRadius: 1.5, border: '1px solid #fed7aa' }}>
                                            <AccessTime sx={{ fontSize: 16 }} />
                                            <Typography variant="caption" fontWeight={600}>In Progress</Typography>
                                        </Box>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatSize(record.file_size)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <UserNameResolver userId={record.triggered_by_user} fallback="System" />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => onViewDetail(record)}>
                                        <Visibility fontSize="small" sx={{ color: 'action.active' }} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {records.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    No backup history found for this device.
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
