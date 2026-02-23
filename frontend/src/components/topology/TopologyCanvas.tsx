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
    Box,
} from "lucide-react";
import {
    topologyService,
    TopologyNode,
    TopologyLink,
} from "@/services/topologyService";
import { useAuth } from "@/contexts/AuthContext";

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
            return <Box style={{ width: size, height: size }} />;
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

// --- Layout helper: arrange nodes in a grid ---
function layoutNodes(topoNodes: TopologyNode[]): Node[] {
    const COLS = Math.max(3, Math.ceil(Math.sqrt(topoNodes.length)));
    const X_GAP = 240;
    const Y_GAP = 200;
    const X_OFFSET = 80;
    const Y_OFFSET = 80;

    return topoNodes.map((node, index) => {
        const col = index % COLS;
        const row = Math.floor(index / COLS);
        return {
            id: node.id,
            type: "deviceNode",
            position: {
                x: X_OFFSET + col * X_GAP,
                y: Y_OFFSET + row * Y_GAP,
            },
            data: {
                label: node.label || node.id,
                deviceType: node.type || "other",
            },
        };
    });
}

// --- Build edges from topology links ---
function buildEdges(links: TopologyLink[]): Edge[] {
    return links.map((link) => {
        // Build label showing interface names
        const sourceTp = link.source_tp || "";
        const targetTp = link.target_tp || "";
        let label = "";
        if (sourceTp && targetTp) {
            label = `${sourceTp} ↔ ${targetTp}`;
        } else if (sourceTp) {
            label = sourceTp;
        } else if (targetTp) {
            label = targetTp;
        }

        return {
            id: link.id,
            source: link.source,
            target: link.target,
            label: label || undefined,
            type: "default",
            animated: false,
            style: { stroke: "#94a3b8", strokeWidth: 2 },
            labelStyle: {
                fontSize: 10,
                fontWeight: 500,
                fill: "#475569",
            },
            labelBgStyle: {
                fill: "#f1f5f9",
                fillOpacity: 0.9,
            },
            labelBgPadding: [6, 4] as [number, number],
            labelBgBorderRadius: 4,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#94a3b8",
                width: 16,
                height: 16,
            },
        };
    });
}

// --- Node types registration ---
const nodeTypes = {
    deviceNode: DeviceNodeComponent,
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
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch topology when site is selected
    const fetchTopology = useCallback(async () => {
        if (!token || !selectedSiteId) {
            setNodes([]);
            setEdges([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await topologyService.getTopology(
                token,
                selectedSiteId
            );
            const flowNodes = layoutNodes(data.nodes || []);
            const flowEdges = buildEdges(data.links || []);
            setNodes(flowNodes);
            setEdges(flowEdges);
        } catch (err: any) {
            console.error("Failed to load topology:", err);
            setError(err.message || "Failed to load topology");
            setNodes([]);
            setEdges([]);
        } finally {
            setIsLoading(false);
        }
    }, [token, selectedSiteId, setNodes, setEdges]);

    useEffect(() => {
        fetchTopology();
    }, [fetchTopology]);

    // Sync topology from ODL
    const handleSync = async () => {
        if (!token) return;
        setIsSyncing(true);
        try {
            await topologyService.syncTopology(token);
            // Re-fetch after sync
            await fetchTopology();
        } catch (err: any) {
            console.error("Topology sync failed:", err);
            setError(err.message || "Sync failed");
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
            <div className="relative h-full bg-gray-50 flex items-center justify-center overflow-hidden">
                <div className="text-center">
                    <div className="mb-4">
                        <FontAwesomeIcon
                            icon={faNetworkWired}
                            className="w-16 h-16 text-gray-300"
                        />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Topology Diagram
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md">
                        Select a site from the sidebar to view its network
                        topology
                    </p>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="relative h-full bg-gray-50 flex items-center justify-center overflow-hidden">
                <div className="text-center">
                    <FontAwesomeIcon
                        icon={faSpinner}
                        className="w-8 h-8 text-blue-500 animate-spin mb-3"
                    />
                    <p className="text-sm text-gray-500">
                        Loading topology...
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="relative h-full bg-gray-50 flex items-center justify-center overflow-hidden">
                <div className="text-center">
                    <p className="text-sm text-red-500 mb-3">{error}</p>
                    <button
                        onClick={fetchTopology}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Empty topology for this site
    if (nodes.length === 0) {
        return (
            <div className="relative h-full bg-gray-50 flex items-center justify-center overflow-hidden">
                <div className="text-center">
                    <FontAwesomeIcon
                        icon={faNetworkWired}
                        className="w-12 h-12 text-gray-300 mb-3"
                    />
                    <h3 className="text-base font-medium text-gray-900 mb-1">
                        No Devices Found
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        No devices are assigned to this site yet.
                    </p>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                    >
                        <FontAwesomeIcon
                            icon={isSyncing ? faSpinner : faSync}
                            className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
                        />
                        {isSyncing ? "Syncing..." : "Sync from ODL"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            {/* Toolbar */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
                    title="Sync topology from ODL"
                >
                    <FontAwesomeIcon
                        icon={isSyncing ? faSpinner : faSync}
                        className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
                    />
                    {isSyncing ? "Syncing..." : "Sync"}
                </button>
                <div className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                    {nodes.length} device{nodes.length !== 1 ? "s" : ""}
                    {edges.length > 0 &&
                        ` · ${edges.length} link${edges.length !== 1 ? "s" : ""}`}
                </div>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.2}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
                className="bg-gray-50"
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
