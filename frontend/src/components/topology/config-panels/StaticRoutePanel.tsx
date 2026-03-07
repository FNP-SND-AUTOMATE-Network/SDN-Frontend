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

export function StaticRoutePanel({ nodeId, showData }: ConfigPanelProps) {
    const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
    const [staticRoutes, setStaticRoutes] = useState<
        { prefix: string; next_hop: string; mask: string }[]
    >([{ prefix: "", next_hop: "", mask: "" }]);

    const { mutate: executeIntent, isPending } = $api.useMutation(
        "post",
        "/api/v1/nbi/intents",
        {
            onSuccess: (data) => {
                if (data.success) {
                    showSuccess("Route operation successful");
                } else {
                    showError(data.error ? JSON.stringify(data.error) : "Operation failed");
                }
            },
            onError: (err: any) => showError(err.message || "Failed to execute intent"),
        }
    );

    const handlePush = (intent: string, params: Record<string, any>) => {
        executeIntent({ body: { intent, node_id: nodeId, params } });
    };

    return (
        <>
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
                                onClick={() => handlePush("routing.static.delete", { prefix: route.prefix, next_hop: route.next_hop })}
                                disabled={isPending || !route.prefix || !route.next_hop}
                                sx={{ textTransform: "none" }}
                            >
                                Delete Route
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handlePush("routing.static.add", { prefix: route.prefix, next_hop: route.next_hop, ...(route.mask && { mask: route.mask }) })}
                                disabled={isPending || !route.prefix || !route.next_hop}
                                startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <Send />}
                                sx={{ textTransform: "none" }}
                            >
                                Push
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

                {/* Show Data */}
                {showData && (
                    <Paper sx={{ p: 2, bgcolor: "grey.900", borderRadius: 2, mt: 1 }}>
                        <Typography variant="caption" color="grey.500" fontWeight={600} textTransform="uppercase" gutterBottom display="block">
                            IP Route Table
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
