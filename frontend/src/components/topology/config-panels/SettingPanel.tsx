"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    CircularProgress,
    Paper,
} from "@mui/material";
import { Send, Save } from "@mui/icons-material";
import { $api } from "@/lib/apiv2/fetch";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { ConfigPanelProps } from "./types";

export function SettingPanel({ device, nodeId }: ConfigPanelProps) {
    const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
    const [hostname, setHostname] = useState("");
    const [dnsServer, setDnsServer] = useState("");
    const [dnsDomain, setDnsDomain] = useState("");
    const [ntpServer, setNtpServer] = useState("");

    const { mutate: executeIntent, isPending } = $api.useMutation(
        "post",
        "/api/v1/nbi/intents",
        {
            onSuccess: (data) => {
                if (data.success) {
                    showSuccess(`Intent executed successfully`);
                } else {
                    showError(data.error ? JSON.stringify(data.error) : "Intent execution failed");
                }
            },
            onError: (err: any) => showError(err.message || "Failed to execute intent"),
        }
    );

    useEffect(() => {
        if (device) {
            setHostname(device.device_name || "");
        }
    }, [device]);

    const handlePush = (intent: string, params: Record<string, any>) => {
        executeIntent({ body: { intent, node_id: nodeId, params } });
    };

    return (
        <>
            <Stack spacing={2.5}>
                {/* Hostname */}
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Hostname
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <TextField
                            size="small"
                            fullWidth
                            value={hostname}
                            onChange={(e) => setHostname(e.target.value)}
                            placeholder="Enter hostname"
                        />
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => handlePush("system.set_hostname", { hostname })}
                            disabled={isPending || !hostname}
                            startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <Send />}
                            sx={{ textTransform: "none", whiteSpace: "nowrap" }}
                        >
                            Push
                        </Button>
                    </Stack>
                </Paper>

                {/* DNS */}
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        DNS Server
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 1.5 }}>
                        <TextField
                            size="small"
                            fullWidth
                            value={dnsServer}
                            onChange={(e) => setDnsServer(e.target.value)}
                            placeholder="DNS Server (e.g. 8.8.8.8)"
                        />
                        <TextField
                            size="small"
                            fullWidth
                            value={dnsDomain}
                            onChange={(e) => setDnsDomain(e.target.value)}
                            placeholder="Domain (optional)"
                        />
                    </Box>
                    <Stack direction="row" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => handlePush("system.set_dns", { server: dnsServer, ...(dnsDomain && { domain: dnsDomain }) })}
                            disabled={isPending || !dnsServer}
                            startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <Send />}
                            sx={{ textTransform: "none" }}
                        >
                            Push
                        </Button>
                    </Stack>
                </Paper>

                {/* NTP */}
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        NTP Server
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <TextField
                            size="small"
                            fullWidth
                            value={ntpServer}
                            onChange={(e) => setNtpServer(e.target.value)}
                            placeholder="NTP Server (e.g. pool.ntp.org)"
                        />
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => handlePush("system.set_ntp", { server: ntpServer })}
                            disabled={isPending || !ntpServer}
                            startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <Send />}
                            sx={{ textTransform: "none", whiteSpace: "nowrap" }}
                        >
                            Push
                        </Button>
                    </Stack>
                </Paper>

                {/* Save Config */}
                <Stack direction="row" justifyContent="flex-end">
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => handlePush("system.save_config", {})}
                        disabled={isPending}
                        startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : <Save />}
                        sx={{ textTransform: "none" }}
                    >
                        Save Configuration
                    </Button>
                </Stack>
            </Stack>

            <MuiSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                title={snackbar.title}
                onClose={hideSnackbar}
            />
        </>
    );
}
