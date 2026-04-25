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
    Divider,
} from "@mui/material";
import { Delete, Add, PlaylistAdd, PlaylistRemove } from "@mui/icons-material";
import { ConfigPanelProps, StagedIntent } from "./types";

export function StaticRoutePanel({ nodeId, onStageIntent }: ConfigPanelProps) {
    const [staticRoutes, setStaticRoutes] = useState<
        { prefix: string; next_hop: string; mask: string }[]
    >([{ prefix: "", next_hop: "", mask: "" }]);

    const handleStage = (intent: string, params: Record<string, unknown>, label: string) => {
        if (onStageIntent) {
            onStageIntent({ intent, node_id: nodeId, params, label });
        }
    };

    // Get all valid routes (both prefix and next_hop filled)
    const validRoutes = staticRoutes.filter(r => r.prefix && r.next_hop);

    const handleQueueAllAdd = () => {
        if (!onStageIntent || validRoutes.length === 0) return;
        const intents: StagedIntent[] = validRoutes.map(route => ({
            intent: "routing.static.add",
            node_id: nodeId,
            params: { prefix: route.prefix, next_hop: route.next_hop, ...(route.mask && { mask: route.mask }) },
            label: `Add route ${route.prefix} → ${route.next_hop}`,
        }));
        onStageIntent(intents);
    };

    const handleQueueAllDelete = () => {
        if (!onStageIntent || validRoutes.length === 0) return;
        const intents: StagedIntent[] = validRoutes.map(route => ({
            intent: "routing.static.delete",
            node_id: nodeId,
            params: { prefix: route.prefix, next_hop: route.next_hop },
            label: `Delete route ${route.prefix}`,
        }));
        onStageIntent(intents);
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

            {/* Queue All buttons */}
            {validRoutes.length > 1 && (
                <>
                    <Divider />
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<PlaylistRemove />}
                            onClick={handleQueueAllDelete}
                            sx={{ textTransform: "none" }}
                        >
                            Queue All Delete ({validRoutes.length})
                        </Button>
                        <Button
                            variant="contained"
                            color="warning"
                            size="small"
                            startIcon={<PlaylistAdd />}
                            onClick={handleQueueAllAdd}
                            sx={{ textTransform: "none" }}
                        >
                            Queue All Add ({validRoutes.length})
                        </Button>
                    </Stack>
                </>
            )}
        </Stack>
    );
}
