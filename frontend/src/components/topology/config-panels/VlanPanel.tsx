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
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import { ConfigPanelProps } from "./types";

export function VlanPanel({ nodeId, showData, onStageIntent }: ConfigPanelProps) {
    interface VlanItem {
        id?: string | number;
        vlan_id?: string | number;
        name?: string;
        status?: string;
    }
    const defaultFormState = { vlanId: "", name: "", intf: "", mode: "access" as "access" | "trunk" };
    const [vlans, setVlans] = useState<typeof defaultFormState[]>([defaultFormState]);

    const existingVlans = (showData?.vlans as VlanItem[]) || [];

    const handleStage = (intent: string, params: Record<string, unknown>, label: string) => {
        if (onStageIntent) {
            onStageIntent({ intent, node_id: nodeId, params, label });
        }
    };

    return (
        <Stack spacing={2}>
            {/* Existing VLANs */}
            {existingVlans.length > 0 && (
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <Box sx={{ px: 2.5, py: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={600}>Current VLANs</Typography>
                    </Box>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "grey.50" }}>
                                <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>Status</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {existingVlans.map((vlan: VlanItem, idx: number) => (
                                <TableRow key={idx}>
                                    <TableCell sx={{ fontWeight: 600 }}>{vlan.vlan_id || vlan.id}</TableCell>
                                    <TableCell>{vlan.name || "-"}</TableCell>
                                    <TableCell>{vlan.status || "-"}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleStage("vlan.delete", { vlan_id: vlan.vlan_id || vlan.id }, `Delete VLAN ${vlan.vlan_id || vlan.id}`)}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}

            {vlans.map((vlan, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            VLAN Configuration {idx + 1}
                        </Typography>
                        {vlans.length > 1 && (
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => setVlans((prev) => prev.filter((_, i) => i !== idx))}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        )}
                    </Stack>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 1.5 }}>
                        <TextField
                            label="VLAN ID"
                            size="small"
                            type="number"
                            value={vlan.vlanId}
                            onChange={(e) => {
                                const updated = [...vlans];
                                updated[idx].vlanId = e.target.value;
                                setVlans(updated);
                            }}
                            placeholder="e.g. 10"
                            slotProps={{ htmlInput: { min: 1, max: 4094 } }}
                        />
                        <TextField
                            label="VLAN Name"
                            size="small"
                            value={vlan.name}
                            onChange={(e) => {
                                const updated = [...vlans];
                                updated[idx].name = e.target.value;
                                setVlans(updated);
                            }}
                            placeholder="Optional naming"
                        />
                    </Box>
                    <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mb: 2 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleStage("vlan.delete", { vlan_id: parseInt(vlan.vlanId) }, `Delete VLAN ${vlan.vlanId}`)}
                            disabled={!vlan.vlanId}
                            sx={{ textTransform: "none" }}
                        >
                            Queue Delete
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleStage("vlan.create", { vlan_id: parseInt(vlan.vlanId), ...(vlan.name && { name: vlan.name }) }, `Create VLAN ${vlan.vlanId}${vlan.name ? ` (${vlan.name})` : ""}`)}
                            disabled={!vlan.vlanId}
                            startIcon={<Add />}
                            sx={{ textTransform: "none" }}
                        >
                            Queue Create
                        </Button>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Assign to Interface
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 1.5 }}>
                        <TextField
                            label="Interface"
                            size="small"
                            value={vlan.intf}
                            onChange={(e) => {
                                const updated = [...vlans];
                                updated[idx].intf = e.target.value;
                                setVlans(updated);
                            }}
                            placeholder="e.g. GigabitEthernet1/0/1"
                        />
                        <FormControl size="small">
                            <InputLabel>Mode</InputLabel>
                            <Select
                                label="Mode"
                                value={vlan.mode}
                                onChange={(e) => {
                                    const updated = [...vlans];
                                    updated[idx].mode = e.target.value as "access" | "trunk";
                                    setVlans(updated);
                                }}
                            >
                                <MenuItem value="access">Access</MenuItem>
                                <MenuItem value="trunk">Trunk</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Stack direction="row" justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            onClick={() => handleStage("vlan.assign_port", { interface: vlan.intf, vlan_id: parseInt(vlan.vlanId), mode: vlan.mode }, `Assign VLAN ${vlan.vlanId} → ${vlan.intf} (${vlan.mode})`)}
                            disabled={!vlan.vlanId || !vlan.intf}
                            startIcon={<Add />}
                            sx={{ textTransform: "none" }}
                        >
                            Queue Assign
                        </Button>
                    </Stack>
                </Paper>
            ))}

            <Button
                variant="outlined"
                fullWidth
                startIcon={<Add />}
                onClick={() => setVlans((prev) => [...prev, { vlanId: "", name: "", intf: "", mode: "access" }])}
                sx={{ textTransform: "none", borderStyle: "dashed", py: 1 }}
            >
                Add Another VLAN Configuration
            </Button>

            {/* Show Data */}
            {showData && (
                <Paper sx={{ p: 2, bgcolor: "grey.900", borderRadius: 2, mt: 1 }}>
                    <Typography variant="caption" color="grey.500" fontWeight={600} textTransform="uppercase" gutterBottom display="block">
                        VLAN Database
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
