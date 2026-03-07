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

export function OspfPanel({ nodeId }: ConfigPanelProps) {
    const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
    const [ospfProcessId, setOspfProcessId] = useState("1");
    const [ospfRouterId, setOspfRouterId] = useState("");
    const [ospfNetworks, setOspfNetworks] = useState<
        { network: string; wildcard: string; area: string }[]
    >([{ network: "", wildcard: "", area: "0" }]);

    const { mutate: executeIntent, isPending } = $api.useMutation(
        "post",
        "/api/v1/nbi/intents",
        {
            onSuccess: (data) => {
                if (data.success) {
                    showSuccess("OSPF operation successful");
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
                {/* OSPF Process */}
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        OSPF Process
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 1.5 }}>
                        <TextField
                            label="Process ID"
                            size="small"
                            type="number"
                            value={ospfProcessId}
                            onChange={(e) => setOspfProcessId(e.target.value)}
                        />
                        <TextField
                            label="Router ID"
                            size="small"
                            value={ospfRouterId}
                            onChange={(e) => setOspfRouterId(e.target.value)}
                            placeholder="e.g. 1.1.1.1"
                        />
                    </Box>
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handlePush("routing.ospf.enable", { process_id: parseInt(ospfProcessId) })}
                            disabled={isPending || !ospfProcessId}
                            sx={{ textTransform: "none" }}
                        >
                            Enable OSPF
                        </Button>
                        {ospfRouterId && (
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handlePush("routing.ospf.set_router_id", { process_id: parseInt(ospfProcessId), router_id: ospfRouterId })}
                                disabled={isPending}
                                sx={{ textTransform: "none" }}
                            >
                                Set Router ID
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handlePush("routing.ospf.disable", { process_id: parseInt(ospfProcessId) })}
                            disabled={isPending || !ospfProcessId}
                            sx={{ textTransform: "none" }}
                        >
                            Disable OSPF
                        </Button>
                    </Stack>
                </Paper>

                {/* OSPF Networks */}
                {ospfNetworks.map((net, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                Network {idx + 1}
                            </Typography>
                            {ospfNetworks.length > 1 && (
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => setOspfNetworks((prev) => prev.filter((_, i) => i !== idx))}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            )}
                        </Stack>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5, mb: 1.5 }}>
                            <TextField
                                size="small"
                                value={net.network}
                                onChange={(e) => { const u = [...ospfNetworks]; u[idx].network = e.target.value; setOspfNetworks(u); }}
                                placeholder="Network"
                            />
                            <TextField
                                size="small"
                                value={net.wildcard}
                                onChange={(e) => { const u = [...ospfNetworks]; u[idx].wildcard = e.target.value; setOspfNetworks(u); }}
                                placeholder="Wildcard"
                            />
                            <TextField
                                size="small"
                                value={net.area}
                                onChange={(e) => { const u = [...ospfNetworks]; u[idx].area = e.target.value; setOspfNetworks(u); }}
                                placeholder="Area"
                            />
                        </Box>
                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handlePush("routing.ospf.remove_network", { process_id: parseInt(ospfProcessId), network: net.network, wildcard: net.wildcard, area: parseInt(net.area) })}
                                disabled={isPending || !net.network || !net.wildcard}
                                sx={{ textTransform: "none" }}
                            >
                                Remove
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handlePush("routing.ospf.add_network", { process_id: parseInt(ospfProcessId), network: net.network, wildcard: net.wildcard, area: parseInt(net.area) })}
                                disabled={isPending || !net.network || !net.wildcard}
                                startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <Send />}
                                sx={{ textTransform: "none" }}
                            >
                                Add Network
                            </Button>
                        </Stack>
                    </Paper>
                ))}

                <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Add />}
                    onClick={() => setOspfNetworks((prev) => [...prev, { network: "", wildcard: "", area: "0" }])}
                    sx={{ textTransform: "none", borderStyle: "dashed", py: 1 }}
                >
                    Add OSPF Network
                </Button>
            </Stack>

            <MuiSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} title={snackbar.title} onClose={hideSnackbar} />
        </>
    );
}
