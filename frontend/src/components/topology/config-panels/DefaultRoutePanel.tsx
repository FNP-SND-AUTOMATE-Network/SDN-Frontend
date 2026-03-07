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

export function DefaultRoutePanel({ nodeId, showData }: ConfigPanelProps) {
    const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
    const [defaultRoutes, setDefaultRoutes] = useState([{ next_hop: "" }]);

    const { mutate: executeIntent, isPending } = $api.useMutation(
        "post",
        "/api/v1/nbi/intents",
        {
            onSuccess: (data) => {
                if (data.success) {
                    showSuccess("Default route operation successful");
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
                {defaultRoutes.map((route, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                Default Route {idx + 1}
                            </Typography>
                            {defaultRoutes.length > 1 && (
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => setDefaultRoutes((prev) => prev.filter((_, i) => i !== idx))}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            )}
                        </Stack>
                        <TextField
                            size="small"
                            fullWidth
                            value={route.next_hop}
                            onChange={(e) => {
                                const updated = [...defaultRoutes];
                                updated[idx].next_hop = e.target.value;
                                setDefaultRoutes(updated);
                            }}
                            placeholder="Next Hop IP"
                            sx={{ mb: 1.5 }}
                        />
                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handlePush("routing.default.delete", { next_hop: route.next_hop })}
                                disabled={isPending || !route.next_hop}
                                sx={{ textTransform: "none" }}
                            >
                                Delete Route
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handlePush("routing.default.add", { next_hop: route.next_hop })}
                                disabled={isPending || !route.next_hop}
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
                    onClick={() => setDefaultRoutes((prev) => [...prev, { next_hop: "" }])}
                    sx={{ textTransform: "none", borderStyle: "dashed", py: 1 }}
                >
                    Add Default Route
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
