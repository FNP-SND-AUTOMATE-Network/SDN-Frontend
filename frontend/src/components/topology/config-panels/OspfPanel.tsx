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

export function OspfPanel({ nodeId, onStageIntent }: ConfigPanelProps) {
    const [ospfProcessId, setOspfProcessId] = useState("1");
    const [ospfRouterId, setOspfRouterId] = useState("");
    const [ospfNetworks, setOspfNetworks] = useState<
        { network: string; wildcard: string; area: string }[]
    >([{ network: "", wildcard: "", area: "0" }]);

    const handleStage = (intent: string, params: Record<string, any>, label: string) => {
        if (onStageIntent) {
            onStageIntent({ intent, node_id: nodeId, params, label });
        }
    };

    // Get all valid networks (both network and wildcard filled)
    const validNetworks = ospfNetworks.filter(n => n.network && n.wildcard);

    const handleQueueAllAddNetworks = () => {
        if (!onStageIntent || validNetworks.length === 0) return;
        const intents: StagedIntent[] = validNetworks.map(net => ({
            intent: "routing.ospf.add_network",
            node_id: nodeId,
            params: { process_id: parseInt(ospfProcessId), network: net.network, wildcard_mask: net.wildcard, area: parseInt(net.area) },
            label: `Add OSPF net ${net.network} area ${net.area}`,
        }));
        onStageIntent(intents);
    };

    const handleQueueAllRemoveNetworks = () => {
        if (!onStageIntent || validNetworks.length === 0) return;
        const intents: StagedIntent[] = validNetworks.map(net => ({
            intent: "routing.ospf.remove_network",
            node_id: nodeId,
            params: { process_id: parseInt(ospfProcessId), network: net.network, wildcard_mask: net.wildcard, area: parseInt(net.area) },
            label: `Remove OSPF net ${net.network}`,
        }));
        onStageIntent(intents);
    };

    return (
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
                        variant="outlined"
                        color="success"
                        size="small"
                        onClick={() => handleStage("routing.ospf.enable", { process_id: parseInt(ospfProcessId) }, `Enable OSPF (PID ${ospfProcessId})`)}
                        disabled={!ospfProcessId}
                        sx={{ textTransform: "none" }}
                    >
                        Queue Enable
                    </Button>
                    {ospfRouterId && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleStage("routing.ospf.set_router_id", { process_id: parseInt(ospfProcessId), router_id: ospfRouterId }, `Set Router ID → ${ospfRouterId}`)}
                            sx={{ textTransform: "none" }}
                        >
                            Queue Router ID
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleStage("routing.ospf.disable", { process_id: parseInt(ospfProcessId) }, `Disable OSPF (PID ${ospfProcessId})`)}
                        disabled={!ospfProcessId}
                        sx={{ textTransform: "none" }}
                    >
                        Queue Disable
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
                            onClick={() => handleStage("routing.ospf.remove_network", { process_id: parseInt(ospfProcessId), network: net.network, wildcard_mask: net.wildcard, area: parseInt(net.area) }, `Remove OSPF net ${net.network}`)}
                            disabled={!net.network || !net.wildcard}
                            sx={{ textTransform: "none" }}
                        >
                            Queue Remove
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleStage("routing.ospf.add_network", { process_id: parseInt(ospfProcessId), network: net.network, wildcard_mask: net.wildcard, area: parseInt(net.area) }, `Add OSPF net ${net.network} area ${net.area}`)}
                            disabled={!net.network || !net.wildcard}
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
                onClick={() => setOspfNetworks((prev) => [...prev, { network: "", wildcard: "", area: "0" }])}
                sx={{ textTransform: "none", borderStyle: "dashed", py: 1 }}
            >
                Add OSPF Network
            </Button>

            {/* Queue All buttons for networks */}
            {validNetworks.length > 1 && (
                <>
                    <Divider />
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<PlaylistRemove />}
                            onClick={handleQueueAllRemoveNetworks}
                            sx={{ textTransform: "none" }}
                        >
                            Queue All Remove ({validNetworks.length})
                        </Button>
                        <Button
                            variant="contained"
                            color="warning"
                            size="small"
                            startIcon={<PlaylistAdd />}
                            onClick={handleQueueAllAddNetworks}
                            sx={{ textTransform: "none" }}
                        >
                            Queue All Add ({validNetworks.length})
                        </Button>
                    </Stack>
                </>
            )}
        </Stack>
    );
}
