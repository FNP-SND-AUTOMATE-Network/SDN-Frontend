"use client";

import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    IconButton,
    Paper,
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import { ConfigPanelProps } from "./types";

export function DhcpPanel({ nodeId, showData, onStageIntent }: ConfigPanelProps) {
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

    const [excludedAddresses, setExcludedAddresses] = useState<
        { low_address: string; high_address: string }[]
    >([{ low_address: "", high_address: "" }]);

    const handleStage = (intent: string, params: Record<string, any>, label: string) => {
        if (onStageIntent) {
            onStageIntent({ intent, node_id: nodeId, params, label });
        }
    };

    return (
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
                            variant="outlined"
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
                                handleStage("dhcp.create_pool", params, `Create DHCP pool "${pool.pool_name}"`);
                            }}
                            disabled={!pool.pool_name || !pool.gateway || !pool.mask}
                            startIcon={<Add />}
                            sx={{ textTransform: "none" }}
                        >
                            Queue Create
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

            {/* --- Excluded Addresses Section --- */}
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Global Excluded Addresses
                </Typography>
            </Box>

            {excludedAddresses.map((addr, idx) => (
                <Paper key={`ex-${idx}`} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            Excluded Range {idx + 1}
                        </Typography>
                        {excludedAddresses.length > 1 && (
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => setExcludedAddresses((prev) => prev.filter((_, i) => i !== idx))}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        )}
                    </Stack>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 1.5 }}>
                        <TextField
                            label="Low IP Address"
                            size="small"
                            value={addr.low_address}
                            onChange={(e) => {
                                const updated = [...excludedAddresses];
                                updated[idx].low_address = e.target.value;
                                setExcludedAddresses(updated);
                            }}
                            placeholder="e.g. 192.168.1.1"
                        />
                        <TextField
                            label="High IP Address"
                            size="small"
                            value={addr.high_address}
                            onChange={(e) => {
                                const updated = [...excludedAddresses];
                                updated[idx].high_address = e.target.value;
                                setExcludedAddresses(updated);
                            }}
                            placeholder="e.g. 192.168.1.10"
                        />
                    </Box>
                    <Stack direction="row" justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                handleStage(
                                    "dhcp.add_excluded_address",
                                    { low_address: addr.low_address, high_address: addr.high_address },
                                    `Exclude IP Range: ${addr.low_address} - ${addr.high_address}`
                                );
                            }}
                            disabled={!addr.low_address || !addr.high_address}
                            startIcon={<Add />}
                            sx={{ textTransform: "none" }}
                        >
                            Queue Excluded Range
                        </Button>
                    </Stack>
                </Paper>
            ))}

            <Button
                variant="outlined"
                fullWidth
                startIcon={<Add />}
                onClick={() =>
                    setExcludedAddresses((prev) => [
                        ...prev,
                        { low_address: "", high_address: "" },
                    ])
                }
                sx={{ textTransform: "none", borderStyle: "dashed", py: 1 }}
            >
                Add Another Excluded Range
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
    );
}
