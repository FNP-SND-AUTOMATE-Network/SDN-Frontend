"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    useNodesState,
    useEdgesState,
    MarkerType,
    Handle,
    Position,
    NodeProps,
    BackgroundVariant,
    getSmoothStepPath,
    EdgeLabelRenderer,
    BaseEdge,
    type EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSpinner,
    faSync,
    faNetworkWired,
} from "@fortawesome/free-solid-svg-icons";
import {
    Server,
    Router as RouterIcon,
    Shield,
    Wifi,
    Box as BoxIcon,
} from "lucide-react";
import { $api, fetchClient } from "@/lib/apiv2/fetch";
import { useAuth } from "@/contexts/AuthContext";
import { Box, Typography, Button, CircularProgress } from "@mui/material";

export interface TopologyNode {
    id: string;
    label: string;
    type: string;
    parent: string | null;
}

export interface TopologyLink {
    id: string;
    source: string;
    target: string;
    sourceHandle: string;
    targetHandle: string;
    type: string;
    raw_source: string;
    raw_target: string;
}

// --- Device type config ---
const DEVICE_CONFIG: Record<
    string,
    { color: string; bgColor: string; borderColor: string; label: string }
> = {
    router: {
        color: "#7c3aed",
        bgColor: "#f5f3ff",
        borderColor: "#c4b5fd",
        label: "Router",
    },
    switch: {
        color: "#2563eb",
        bgColor: "#eff6ff",
        borderColor: "#93c5fd",
        label: "Switch",
    },
    firewall: {
        color: "#dc2626",
        bgColor: "#fef2f2",
        borderColor: "#fca5a5",
        label: "Firewall",
    },
    access_point: {
        color: "#4f46e5",
        bgColor: "#eef2ff",
        borderColor: "#a5b4fc",
        label: "Access Point",
    },
    other: {
        color: "#6b7280",
        bgColor: "#f9fafb",
        borderColor: "#d1d5db",
        label: "Device",
    },
};

const getDeviceConfig = (type: string) =>
    DEVICE_CONFIG[type.toLowerCase()] || DEVICE_CONFIG.other;

const getDeviceIcon = (type: string, size: number = 20) => {
    const className = `w-[${size}px] h-[${size}px]`;
    switch (type.toLowerCase()) {
        case "router":
            return <RouterIcon style={{ width: size, height: size }} />;
        case "switch":
            return <Server style={{ width: size, height: size }} />;
        case "firewall":
            return <Shield style={{ width: size, height: size }} />;
        case "access_point":
            return <Wifi style={{ width: size, height: size }} />;
        default:
            return <BoxIcon style={{ width: size, height: size }} />;
    }
};

// --- Custom Device Node Component ---
function DeviceNodeComponent({ data }: NodeProps) {
    const config = getDeviceConfig(data.deviceType as string);

    return (
        <div
            className="rounded-lg shadow-md border-2 bg-white min-w-[160px] transition-shadow hover:shadow-lg"
            style={{ borderColor: config.borderColor }}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!bg-gray-400 !w-2.5 !h-2.5 !border-2 !border-white"
            />

            {/* Color stripe */}
            <div
                className="h-1.5 rounded-t-md"
                style={{ backgroundColor: config.color }}
            />

            {/* Content */}
            <div className="px-4 py-3 flex flex-col items-center gap-2">
                {/* Icon */}
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                        backgroundColor: config.bgColor,
                        color: config.color,
                    }}
                >
                    {getDeviceIcon(data.deviceType as string, 20)}
                </div>

                {/* Device Name */}
                <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900 leading-tight">
                        {data.label as string}
                    </div>
                    <div
                        className="text-[10px] font-medium mt-1 px-2 py-0.5 rounded-full inline-block"
                        style={{
                            backgroundColor: config.bgColor,
                            color: config.color,
                        }}
                    >
                        {config.label}
                    </div>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!bg-gray-400 !w-2.5 !h-2.5 !border-2 !border-white"
            />
        </div>
    );
}

// --- Layout helper: place connected nodes near each other using BFS ---
function layoutNodes(topoNodes: TopologyNode[], links: TopologyLink[]): Node[] {
    if (topoNodes.length === 0) return [];

    // Build adjacency list for device nodes only
    const adj: Record<string, Set<string>> = {};
    topoNodes.forEach((n) => (adj[n.id] = new Set()));

    // Deduplicate links for adjacency
    const seen = new Set<string>();
    links.forEach((link) => {
        const key = [link.source, link.target].sort().join(":::");
        if (seen.has(key)) return;
        seen.add(key);
        if (adj[link.source] && adj[link.target]) {
            adj[link.source].add(link.target);
            adj[link.target].add(link.source);
        }
    });

    // Find the node with the most connections as the root
    const sorted = [...topoNodes].sort(
        (a, b) => (adj[b.id]?.size || 0) - (adj[a.id]?.size || 0)
    );

    const X_GAP = 300;
    const Y_GAP = 260;
    const positions: Record<string, { x: number; y: number }> = {};
    const placed = new Set<string>();

    // BFS to place connected nodes near each other
    const queue: string[] = [sorted[0].id];
    positions[sorted[0].id] = { x: 400, y: 300 };
    placed.add(sorted[0].id);

    while (queue.length > 0) {
        const current = queue.shift()!;
        const neighbors = Array.from(adj[current] || []).filter(
            (n) => !placed.has(n)
        );
        const cx = positions[current].x;
        const cy = positions[current].y;

        neighbors.forEach((neighbor, i) => {
            // Spread neighbors evenly around the current node
            const total = neighbors.length;
            const angle = (2 * Math.PI * i) / total - Math.PI / 2;
            positions[neighbor] = {
                x: cx + Math.cos(angle) * X_GAP,
                y: cy + Math.sin(angle) * Y_GAP,
            };
            placed.add(neighbor);
            queue.push(neighbor);
        });
    }

    // Place any disconnected nodes in remaining grid positions
    let disconnectedIndex = 0;
    topoNodes.forEach((node) => {
        if (!placed.has(node.id)) {
            positions[node.id] = {
                x: 80 + disconnectedIndex * X_GAP,
                y: 80,
            };
            disconnectedIndex++;
        }
    });

    return topoNodes.map((node) => ({
        id: node.id,
        type: "deviceNode",
        position: positions[node.id],
        data: {
            label: node.label || node.id,
            deviceType: node.type || "other",
        },
    }));
}

// --- Custom Edge: shows interface labels near source and target ---
function InterfaceLabelEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
    data,
}: EdgeProps) {
    const pathOptions = (data?.pathOptions as { offset?: number }) || {};
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        offset: pathOptions.offset as number || 0,
    });

    const srcPort = (data?.srcPort as string) || "";
    const tgtPort = (data?.tgtPort as string) || "";

    // Place labels at the handle connection points, offset horizontally for parallel edges
    const edgeOffset = (pathOptions.offset as number) || 0;
    // Source handle is at the bottom of the node → label goes just below
    const srcLabelX = sourceX + edgeOffset;
    const srcLabelY = sourceY + 20;
    // Target handle is at the top of the node → label goes just above
    const tgtLabelX = targetX + edgeOffset;
    const tgtLabelY = targetY - 20;

    const labelClass =
        "text-[10px] font-medium px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-300 shadow-sm pointer-events-none whitespace-nowrap";

    return (
        <>
            <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
            <EdgeLabelRenderer>
                {srcPort && (
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${srcLabelX}px, ${srcLabelY}px)`,
                            pointerEvents: "none",
                        }}
                        className="nodrag nopan"
                    >
                        <span className={labelClass}>{srcPort}</span>
                    </div>
                )}
                {tgtPort && (
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${tgtLabelX}px, ${tgtLabelY}px)`,
                            pointerEvents: "none",
                        }}
                        className="nodrag nopan"
                    >
                        <span className={labelClass}>{tgtPort}</span>
                    </div>
                )}
            </EdgeLabelRenderer>
        </>
    );
}

// --- Build edges from topology links ---
function buildEdges(links: TopologyLink[]): Edge[] {
    // Deduplicate bidirectional links using raw_source/raw_target (interface-level)
    // This way different interface pairs between the same devices are kept as separate edges
    const seen = new Set<string>();
    const uniqueLinks = links.filter((link) => {
        const dedupKey = [link.raw_source, link.raw_target].sort().join(":::");
        if (seen.has(dedupKey)) return false;
        seen.add(dedupKey);
        return true;
    });

    // Detect parallel edges (same device pair) and assign offsets
    const pairCount: Record<string, number> = {};
    const pairIndex: Record<string, number> = {};

    uniqueLinks.forEach((link) => {
        const pairKey = [link.source, link.target].sort().join(":::");
        pairCount[pairKey] = (pairCount[pairKey] || 0) + 1;
    });

    return uniqueLinks.map((link) => {
        const pairKey = [link.source, link.target].sort().join(":::");
        const totalInPair = pairCount[pairKey] || 1;
        const currentIndex = pairIndex[pairKey] || 0;
        pairIndex[pairKey] = currentIndex + 1;

        // Fan out parallel edges so they don't overlap
        let offset = 0;
        if (totalInPair > 1) {
            const spread = 50; // px between parallel edges
            offset = (currentIndex - (totalInPair - 1) / 2) * spread;
        }

        return {
            id: link.id,
            source: link.source,
            target: link.target,
            type: "interfaceLabel",
            animated: false,
            data: {
                srcPort: link.sourceHandle || "",
                tgtPort: link.targetHandle || "",
                pathOptions: { offset },
            },
            style: { stroke: "#94a3b8", strokeWidth: 2 },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#94a3b8",
                width: 16,
                height: 16,
            },
        };
    });
}

// --- Type registrations ---
const nodeTypes = {
    deviceNode: DeviceNodeComponent,
};
const edgeTypes = {
    interfaceLabel: InterfaceLabelEdge,
};

// --- Main Component ---
interface TopologyCanvasProps {
    selectedSiteId?: string | null;
}

export default function TopologyCanvas({
    selectedSiteId,
}: TopologyCanvasProps) {
    const { token } = useAuth();
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);

    // Fetch topology using React Query
    const {
        data: topologyData,
        isLoading,
        error: queryError,
        refetch,
    } = $api.useQuery(
        "get",
        "/api/v1/nbi/topology",
        {
            params: {
                query: {
                    local_site_id: selectedSiteId as string,
                },
            },
        },
        {
            enabled: !!selectedSiteId,
        }
    );

    const error = queryError ? (queryError as any).message || "Failed to load topology" : syncError;

    // Update nodes and edges when data changes
    useEffect(() => {
        if (topologyData) {
            const dataNodes = (topologyData.nodes as unknown as TopologyNode[]) || [];
            const dataLinks = (topologyData.links as unknown as TopologyLink[]) || [];
            const deviceNodes = dataNodes.filter((n) => n.parent === null);
            setNodes(layoutNodes(deviceNodes, dataLinks));
            setEdges(buildEdges(dataLinks));
        } else {
            setNodes([]);
            setEdges([]);
        }
    }, [topologyData, setNodes, setEdges]);

    // Sync topology from ODL
    const handleSync = async () => {
        setIsSyncing(true);
        setSyncError(null);
        try {
            await fetchClient.POST("/api/v1/nbi/topology/sync");
            await refetch();
        } catch (err: any) {
            console.error("Topology sync failed:", err);
            setSyncError(err.message || "Sync failed");
        } finally {
            setIsSyncing(false);
        }
    };

    // MiniMap node color
    const miniMapNodeColor = useCallback((node: Node) => {
        const config = getDeviceConfig(
            (node.data?.deviceType as string) || "other"
        );
        return config.color;
    }, []);

    // Empty / no site selected state
    if (!selectedSiteId) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%" bgcolor="background.paper" position="relative" overflow="hidden">
                <Box textAlign="center">
                    <Box mb={2}>
                        <FontAwesomeIcon icon={faNetworkWired} className="w-16 h-16 text-gray-300" />
                    </Box>
                    <Typography variant="h6" color="text.primary" gutterBottom>
                        Topology Diagram
                    </Typography>
                    <Typography variant="body2" color="text.secondary" maxWidth={300} mx="auto">
                        Select a site from the sidebar to view its network topology
                    </Typography>
                </Box>
            </Box>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%" bgcolor="background.paper" position="relative" overflow="hidden">
                <Box textAlign="center">
                    <CircularProgress size={32} sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                        Loading topology...
                    </Typography>
                </Box>
            </Box>
        );
    }

    // Error state
    if (error) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%" bgcolor="background.paper" position="relative" overflow="hidden">
                <Box textAlign="center">
                    <Typography variant="body2" color="error.main" mb={2}>{error}</Typography>
                    <Button variant="contained" onClick={() => refetch()}>
                        Retry
                    </Button>
                </Box>
            </Box>
        );
    }

    // Empty topology for this site
    if (nodes.length === 0) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%" bgcolor="background.paper" position="relative" overflow="hidden">
                <Box textAlign="center">
                    <FontAwesomeIcon icon={faNetworkWired} className="w-12 h-12 text-gray-300 mb-3" />
                    <Typography variant="subtitle1" color="text.primary" fontWeight={500} gutterBottom>
                        No Devices Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        No devices are assigned to this site yet.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleSync}
                        disabled={isSyncing}
                        startIcon={
                            <FontAwesomeIcon
                                icon={isSyncing ? faSpinner : faSync}
                                className={isSyncing ? "animate-spin" : ""}
                            />
                        }
                    >
                        {isSyncing ? "Syncing..." : "Sync from ODL"}
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <div className="relative h-full w-full">
            {/* Toolbar */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    onClick={handleSync}
                    disabled={isSyncing}
                    startIcon={
                        <FontAwesomeIcon
                            icon={isSyncing ? faSpinner : faSync}
                            className={isSyncing ? "animate-spin" : ""}
                        />
                    }
                    sx={{ bgcolor: "white", "&:hover": { bgcolor: "grey.50" }, textTransform: "none" }}
                >
                    {isSyncing ? "Syncing..." : "Sync"}
                </Button>
                <Box bgcolor="rgba(255,255,255,0.8)" px={1} py={0.5} borderRadius={1}>
                    <Typography variant="caption" color="text.secondary">
                        {nodes.length} device{nodes.length !== 1 ? "s" : ""}
                    </Typography>
                </Box>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.2}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
                className="bg-white"
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color="#d1d5db"
                />
                <Controls
                    showInteractive={false}
                    className="!bg-white !border-gray-300 !shadow-sm"
                />
                <MiniMap
                    nodeColor={miniMapNodeColor}
                    maskColor="rgba(0,0,0,0.1)"
                    className="!bg-white !border-gray-300 !shadow-sm"
                    pannable
                    zoomable
                />
            </ReactFlow>
        </div>
    );
}
