"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Box,
    Typography,
    Button,
    Card,
    CircularProgress,
    Alert,
    Breadcrumbs,
    Link,
    Paper,
    Divider
} from "@mui/material";
import {
    DescriptionOutlined,
    CompareArrowsOutlined,
    NavigateNext as NavigateNextIcon
} from "@mui/icons-material";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { $api } from "@/lib/apiv2/fetch";
import { BackupHistoryTable } from "@/components/device/backup";
import { components } from "@/lib/apiv2/schema";

export default function DeviceBackupHistoryPage() {
    const params = useParams();
    const router = useRouter();
    const deviceId = params.id as string;

    const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

    const { data: device, isLoading: deviceLoading } = $api.useQuery(
        "get",
        "/device-networks/{device_id}",
        {
            params: {
                path: {
                    device_id: deviceId || "",
                },
            }
        },
        {
            enabled: !!deviceId,
        }
    );

    const { data: records, isLoading: recordsLoading, error } = $api.useQuery(
        "get",
        "/api/v1/devices/backups/device/{device_id}",
        {
            params: {
                path: {
                    device_id: deviceId || "",
                },
                query: {
                    limit: 50,
                    page: 1,
                }
            }
        },
        {
            enabled: !!deviceId,
        }
    );

    const handleViewDetail = (record: components["schemas"]["DeviceBackupRecordResponse"]) => {
        console.log("View detail for", record.id);
        // TODO: Implement Detail View / Compare
    };

    if (deviceLoading || recordsLoading) {
        return (
            <ProtectedRoute>
                <PageLayout>
                    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                </PageLayout>
            </ProtectedRoute>
        );
    }

    if (!device) {
        return (
            <ProtectedRoute>
                <PageLayout>
                    <Box sx={{ p: 4 }}>
                        <Alert severity="error">Device target not found.</Alert>
                    </Box>
                </PageLayout>
            </ProtectedRoute>
        );
    }

    // Format subtitle: IP - Vendor Type
    const vendorLabel = device.vendor ? device.vendor : "Unknown";
    const typeLabel = device.type ? device.type.charAt(0) + device.type.slice(1).toLowerCase().replace("_", " ") : "";
    const subtitle = `${device.ip_address || "-"} - ${vendorLabel} ${typeLabel}`;

    const isCompareDisabled = selectedRecords.length !== 2;

    return (
        <ProtectedRoute>
            <PageLayout>
                <Box sx={{ maxWidth: 1600, mx: "auto", display: "flex", flexDirection: "column", gap: 3 }}>

                    {/* Breadcrumbs */}
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                        <Link
                            underline="hover"
                            color="inherit"
                            href="/device/backup-config"
                            sx={{ cursor: 'pointer', fontFamily: "SF Pro Text, -apple-system, sans-serif" }}
                        >
                            Device
                        </Link>
                        <Typography color="text.primary" sx={{ fontFamily: "SF Pro Text, -apple-system, sans-serif", fontWeight: 500 }}>
                            {device.device_name}
                        </Typography>
                    </Breadcrumbs>

                    <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 2 }}>
                        {/* Header Area */}
                        <Box sx={{
                            p: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 48,
                                    height: 48,
                                    bgcolor: '#EBF5FF',
                                    color: '#2563EB',
                                    borderRadius: 1.5
                                }}>
                                    <DescriptionOutlined />
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight={600} sx={{ fontFamily: "Inter, -apple-system, sans-serif", color: "#111827", lineHeight: 1.2 }}>
                                        {device.device_name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: "Inter, -apple-system, sans-serif", color: "#6B7280", mt: 0.5 }}>
                                        {subtitle}
                                    </Typography>
                                </Box>
                            </Box>

                            <Button
                                variant="outlined"
                                startIcon={<CompareArrowsOutlined />}
                                disabled={isCompareDisabled}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    color: isCompareDisabled ? 'text.disabled' : '#374151',
                                    borderColor: isCompareDisabled ? 'divider' : '#D1D5DB',
                                    '&:hover': {
                                        borderColor: '#9CA3AF',
                                        bgcolor: '#F9FAFB'
                                    }
                                }}
                            >
                                Compare
                            </Button>
                        </Box>

                        <Divider />

                        {/* History Table */}
                        <Box sx={{ p: 0 }}>
                            {error ? (
                                <Alert severity="error" sx={{ m: 3 }}>Failed to load backup records. Please try again later.</Alert>
                            ) : (
                                <BackupHistoryTable
                                    records={records || []}
                                    onViewDetail={handleViewDetail}
                                    key={deviceId}
                                    onSelectRecord={(id) => {
                                        setSelectedRecords(prev =>
                                            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
                                        );
                                    }}
                                />
                            )}
                        </Box>
                    </Card>
                </Box>
            </PageLayout>
        </ProtectedRoute>
    );
}
