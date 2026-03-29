"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    Paper,
    Chip,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { ConfigPanelProps } from "./types";

export function SettingPanel({ device, nodeId, onStageIntent }: ConfigPanelProps) {
    const [hostname, setHostname] = useState("");
    const [dnsServer, setDnsServer] = useState("");
    const [dnsDomain, setDnsDomain] = useState("");
    const [ntpServer, setNtpServer] = useState("");

    useEffect(() => {
        if (device) {
            setHostname(device.device_name || "");
        }
    }, [device]);

    const handleStage = (intent: string, params: Record<string, any>, label: string) => {
        if (onStageIntent) {
            onStageIntent({ intent, node_id: nodeId, params, label });
        }
    };

    return (
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
                        variant="outlined"
                        size="small"
                        onClick={() => handleStage("system.set_hostname", { hostname }, `Set hostname → ${hostname}`)}
                        disabled={!hostname}
                        startIcon={<AddIcon />}
                        sx={{ textTransform: "none", whiteSpace: "nowrap" }}
                    >
                        Queue
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
                        variant="outlined"
                        size="small"
                        onClick={() => handleStage("system.set_dns", { server: dnsServer, ...(dnsDomain && { domain: dnsDomain }) }, `Set DNS → ${dnsServer}`)}
                        disabled={!dnsServer}
                        startIcon={<AddIcon />}
                        sx={{ textTransform: "none" }}
                    >
                        Queue
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
                        variant="outlined"
                        size="small"
                        onClick={() => handleStage("system.set_ntp", { server: ntpServer }, `Set NTP → ${ntpServer}`)}
                        disabled={!ntpServer}
                        startIcon={<AddIcon />}
                        sx={{ textTransform: "none", whiteSpace: "nowrap" }}
                    >
                        Queue
                    </Button>
                </Stack>
            </Paper>

            <Box sx={{ textAlign: "center", py: 1 }}>
                <Chip label="Queue to add to the queue, then click Save Config above to send all" size="small" variant="outlined" color="info" />
            </Box>
        </Stack>
    );
}
