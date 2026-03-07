import React, { useState } from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import { $api } from "@/lib/apiv2/fetch";
import { paths, components } from "@/lib/apiv2/schema";
import { BackupHistoryTable } from "@/components/device/backup";
import { BackupConfigModal } from "@/components/device/backup/BackupConfigModal";

type DeviceNetwork = paths["/device-networks/{device_id}"]["get"]["responses"]["200"]["content"]["application/json"];

interface DeviceBackupTabProps {
    device: DeviceNetwork;
}

export default function DeviceBackupTab({ device }: DeviceBackupTabProps) {
    const { data: records, isLoading, error } = $api.useQuery(
        "get",
        "/api/v1/devices/backups/device/{device_id}",
        {
            params: {
                path: {
                    device_id: device.id || "",
                },
                query: {
                    limit: 50,
                    page: 1,
                }
            }
        },
        {
            enabled: !!device.id,
        }
    );

    const [previewRecordId, setPreviewRecordId] = useState<string | null>(null);

    const handleViewDetail = (record: components["schemas"]["DeviceBackupRecordResponse"]) => {
        setPreviewRecordId(record.id);
    };

    if (isLoading) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error">Failed to load backup records. Please try again later.</Alert>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
                    Backup History
                </Typography>
                <BackupHistoryTable
                    records={records || []}
                    onViewDetail={handleViewDetail}
                />
            </Box>

            <BackupConfigModal
                open={!!previewRecordId}
                onClose={() => setPreviewRecordId(null)}
                recordId={previewRecordId}
            />
        </Box>
    );
}