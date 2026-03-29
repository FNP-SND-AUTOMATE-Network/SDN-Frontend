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

export function StaticRoutePanel({ nodeId, showData, onStageIntent }: ConfigPanelProps) {
    const [staticRoutes, setStaticRoutes] = useState<
        { prefix: string; next_hop: string; mask: string }[]
    >([{ prefix: "", next_hop: "", mask: "" }]);

    const handleStage = (intent: string, params: Record<string, any>, label: string) => {
        if (onStageIntent) {
            onStageIntent({ intent, node_id: nodeId, params, label });
        }
    };

    return (
        <Stack spacing={2}>
            {staticRoutes.map((route, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            Static Route {idx + 1}
                        </Typography>
                        {staticRoutes.length > 1 && (
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => setStaticRoutes((prev) => prev.filter((_, i) => i !== idx))}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        )}
                    </Stack>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5, mb: 1.5 }}>
                        <TextField
                            size="small"
                            value={route.prefix}
                            onChange={(e) => {
                                const updated = [...staticRoutes];
                                updated[idx].prefix = e.target.value;
                                setStaticRoutes(updated);
                            }}
                            placeholder="Network (e.g. 10.0.0.0/24)"
                        />
                        <TextField
                            size="small"
                            value={route.next_hop}
                            onChange={(e) => {
                                const updated = [...staticRoutes];
                                updated[idx].next_hop = e.target.value;
                                setStaticRoutes(updated);
                            }}
                            placeholder="Next Hop"
                        />
                        <TextField
                            size="small"
                            value={route.mask}
                            onChange={(e) => {
                                const updated = [...staticRoutes];
                                updated[idx].mask = e.target.value;
                                setStaticRoutes(updated);
                            }}
                            placeholder="Mask (optional)"
                        />
                    </Box>
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleStage("routing.static.delete", { prefix: route.prefix, next_hop: route.next_hop }, `Delete route ${route.prefix}`)}
                            disabled={!route.prefix || !route.next_hop}
                            sx={{ textTransform: "none" }}
                        >
                            Queue Delete
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleStage("routing.static.add", { prefix: route.prefix, next_hop: route.next_hop, ...(route.mask && { mask: route.mask }) }, `Add route ${route.prefix} → ${route.next_hop}`)}
                            disabled={!route.prefix || !route.next_hop}
                            startIcon={<Add />}
                            sx={{ textTransform: "none" }}
                        >
                            Queue Add
                        </Button>
                    </Stack>
                </Paper>
            ))}

            <Button
                variant="outlined"
                fullWidth
                startIcon={<Add />}
                onClick={() => setStaticRoutes((prev) => [...prev, { prefix: "", next_hop: "", mask: "" }])}
                sx={{ textTransform: "none", borderStyle: "dashed", py: 1 }}
            >
                Add Static Route
            </Button>
        </Stack>
    );
}
