"use client";

import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    IconButton,
    CircularProgress,
    Paper,
} from "@mui/material";
import { Send, Delete, Add } from "@mui/icons-material";
import { $api } from "@/lib/apiv2/fetch";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { ConfigPanelProps } from "./types";

export function DhcpPanel({ nodeId, showData }: ConfigPanelProps) {
    const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
    const [dhcpPools, setDhcpPools] = useState<
        {
            pool_name: string;
            gateway: string;
            mask: string;
            start_ip?: string;
            end_ip?: string;
            network?: string;
            dns_servers: string;
        }[]
    >([{ pool_name: "", gateway: "", mask: "", network: "", dns_servers: "" }]);

    const { mutate: executeIntent, isPending } = $api.useMutation(
        "post",
        "/api/v1/nbi/intents",
        {
            onSuccess: (data) => {
                if (data.success) {
                    showSuccess("DHCP pool operation successful");
                } else {
                    showError(data.error ? JSON.stringify(data.error) : "Operation failed");
                }
            },
            onError: (err: any) => showError(err.message || "Failed to execute intent"),
        }
    );

    return (
        <>
            <Stack spacing={2}>
                {dhcpPools.map((pool, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                DHCP Pool {idx + 1}
                            </Typography>
                            {dhcpPools.length > 1 && (
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => setDhcpPools((prev) => prev.filter((_, i) => i !== idx))}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            )}
                        </Stack>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 1.5 }}>
                            <TextField
                                label="Pool Name"
                                size="small"
                                value={pool.pool_name}
                                onChange={(e) => {
                                    const updated = [...dhcpPools];
                                    updated[idx].pool_name = e.target.value;
                                    setDhcpPools(updated);
                                }}
                                placeholder="e.g. LAN_POOL_1"
                            />
                            <TextField
                                label="Default Gateway"
                                size="small"
                                value={pool.gateway}
                                onChange={(e) => {
                                    const updated = [...dhcpPools];
                                    updated[idx].gateway = e.target.value;
                                    setDhcpPools(updated);
                                }}
                                placeholder="e.g. 192.168.1.1"
                            />
                            <TextField
                                label="Network / Subnet"
                                size="small"
                                value={pool.network}
                                onChange={(e) => {
                                    const updated = [...dhcpPools];
                                    updated[idx].network = e.target.value;
                                    setDhcpPools(updated);
                                }}
                                placeholder="e.g. 192.168.1.0"
                            />
                            <TextField
                                label="Subnet Mask"
                                size="small"
                                value={pool.mask}
                                onChange={(e) => {
                                    const updated = [...dhcpPools];
                                    updated[idx].mask = e.target.value;
                                    setDhcpPools(updated);
                                }}
                                placeholder="e.g. 255.255.255.0"
                            />
                            <TextField
                                label="DNS Servers (comma separated)"
                                size="small"
                                fullWidth
                                value={pool.dns_servers}
                                onChange={(e) => {
                                    const updated = [...dhcpPools];
                                    updated[idx].dns_servers = e.target.value;
                                    setDhcpPools(updated);
                                }}
                                placeholder="e.g. 8.8.8.8, 8.8.4.4"
                                sx={{ gridColumn: "1 / -1" }}
                            />
                        </Box>
                        <Stack direction="row" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => {
                                    const params: any = {
                                        pool_name: pool.pool_name,
                                        gateway: pool.gateway,
                                        mask: pool.mask,
                                    };
                                    if (pool.network) params["network"] = pool.network;
                                    if (pool.dns_servers) {
                                        params["dns_servers"] = pool.dns_servers.split(",").map((s) => s.trim());
                                    }
                                    executeIntent({ body: { intent: "dhcp.create_pool", node_id: nodeId, params } });
                                }}
                                disabled={isPending || !pool.pool_name || !pool.gateway || !pool.mask}
                                startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <Send />}
                                sx={{ textTransform: "none" }}
                            >
                                Create DHCP Pool
                            </Button>
                        </Stack>
                    </Paper>
                ))}

                <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Add />}
                    onClick={() =>
                        setDhcpPools((prev) => [
                            ...prev,
                            { pool_name: "", gateway: "", mask: "", network: "", dns_servers: "" },
                        ])
                    }
                    sx={{ textTransform: "none", borderStyle: "dashed", py: 1 }}
                >
                    Add Another DHCP Pool
                </Button>

                {/* Show Data */}
                {showData && (
                    <Paper sx={{ p: 2, bgcolor: "grey.900", borderRadius: 2, mt: 1 }}>
                        <Typography variant="caption" color="grey.500" fontWeight={600} textTransform="uppercase" gutterBottom display="block">
                            DHCP Pools
                        </Typography>
                        <Typography
                            component="pre"
                            variant="caption"
                            sx={{ color: "success.light", fontFamily: "monospace", whiteSpace: "pre-wrap", m: 0 }}
                        >
                            {typeof showData === "string" ? showData : JSON.stringify(showData, null, 2)}
                        </Typography>
                    </Paper>
                )}
            </Stack>

            <MuiSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} title={snackbar.title} onClose={hideSnackbar} />
        </>
    );
}
