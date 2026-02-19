"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faChevronRight,
    faPlusCircle,
    faSpinner,
    faCheck,
    faExclamationTriangle,
    faTrash,
    faSave,
} from "@fortawesome/free-solid-svg-icons";
import { DeviceNetwork } from "@/services/deviceNetworkService";
import { intentService, IntentExecuteResponse } from "@/services/intentService";
import { useAuth } from "@/contexts/AuthContext";

interface TopologyConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    device: DeviceNetwork | null;
    onDeviceUpdated?: (device: DeviceNetwork) => void;
}

type MainTab = "config" | "template";

// Sidebar menu items — filtered per device type
type SidebarItem = { key: string; label: string; expandable: boolean };

const ALL_SIDEBAR_ITEMS: SidebarItem[] = [
    { key: "setting", label: "SETTING", expandable: false },
    { key: "routing", label: "ROUTING", expandable: true },
    { key: "interface", label: "INTERFACE", expandable: false },
    { key: "vlan", label: "VLAN", expandable: false },
    { key: "dhcp", label: "DHCP", expandable: false },
];

function getSidebarItems(deviceType?: string): SidebarItem[] {
    switch (deviceType) {
        case "ROUTER":
            // Router: Setting, Routing, Interface, DHCP (ไม่มี VLAN)
            return ALL_SIDEBAR_ITEMS.filter((i) => i.key !== "vlan");
        case "SWITCH":
            // Switch: Setting, Interface, VLAN (ไม่มี Routing, DHCP)
            return ALL_SIDEBAR_ITEMS.filter((i) => i.key !== "routing" && i.key !== "dhcp");
        default:
            // Other types: show all
            return ALL_SIDEBAR_ITEMS;
    }
}

// Sub-items for expandable sections
const SUB_ITEMS: Record<string, { key: string; label: string }[]> = {
    routing: [
        { key: "routing-static", label: "Static Route" },
        { key: "routing-ospf", label: "OSPF" },
        { key: "routing-default", label: "Default Route" },
    ],
};

// ==================== Result Banner ====================
function ResultBanner({
    result,
    onDismiss,
}: {
    result: { success: boolean; message: string } | null;
    onDismiss: () => void;
}) {
    if (!result) return null;
    return (
        <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm mb-4 ${result.success
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
                }`}
        >
            <FontAwesomeIcon
                icon={result.success ? faCheck : faExclamationTriangle}
                className="w-4 h-4 shrink-0"
            />
            <span className="flex-1">{result.message}</span>
            <button onClick={onDismiss} className="text-current opacity-60 hover:opacity-100">
                <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
            </button>
        </div>
    );
}

// ==================== Main Component ====================
export default function TopologyConfigModal({
    isOpen,
    onClose,
    device,
    onDeviceUpdated,
}: TopologyConfigModalProps) {
    const { token } = useAuth();
    const [mainTab, setMainTab] = useState<MainTab>("config");
    const [activeSection, setActiveSection] = useState<string>("setting");
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // Global state
    const [isPushing, setIsPushing] = useState(false);
    const [pushResult, setPushResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // ===== SETTING state =====
    const [hostname, setHostname] = useState("");
    const [dnsServer, setDnsServer] = useState("");
    const [dnsDomain, setDnsDomain] = useState("");
    const [ntpServer, setNtpServer] = useState("");

    // ===== ROUTING - STATIC state =====
    const [staticRoutes, setStaticRoutes] = useState<
        { prefix: string; next_hop: string; mask: string }[]
    >([{ prefix: "", next_hop: "", mask: "" }]);

    // ===== ROUTING - OSPF state =====
    const [ospfProcessId, setOspfProcessId] = useState("1");
    const [ospfRouterId, setOspfRouterId] = useState("");
    const [ospfNetworks, setOspfNetworks] = useState<
        { network: string; wildcard: string; area: string }[]
    >([{ network: "", wildcard: "", area: "0" }]);

    // ===== ROUTING - DEFAULT ROUTE state =====
    const [defaultNextHop, setDefaultNextHop] = useState("");

    // ===== INTERFACE state =====
    const [interfaces, setInterfaces] = useState<any[]>([]);
    const [selectedInterface, setSelectedInterface] = useState("");
    const [ifIp, setIfIp] = useState("");
    const [ifPrefix, setIfPrefix] = useState("");
    const [ifDescription, setIfDescription] = useState("");
    const [ifMtu, setIfMtu] = useState("");

    // ===== VLAN state =====
    const [vlans, setVlans] = useState<any[]>([]);
    const [newVlanId, setNewVlanId] = useState("");
    const [newVlanName, setNewVlanName] = useState("");

    // ===== DHCP state =====
    const [dhcpPoolName, setDhcpPoolName] = useState("");
    const [dhcpGateway, setDhcpGateway] = useState("");
    const [dhcpMask, setDhcpMask] = useState("");
    const [dhcpStartIp, setDhcpStartIp] = useState("");
    const [dhcpEndIp, setDhcpEndIp] = useState("");

    // ===== Show data state =====
    const [showData, setShowData] = useState<Record<string, any> | null>(null);

    const nodeId = device?.node_id || "";

    // Initialize when device changes
    useEffect(() => {
        if (device) {
            setHostname(device.device_name || "");
            setPushResult(null);
            setShowData(null);
            setActiveSection("setting");
            setMainTab("config");
        }
    }, [device]);

    // Load show data when section changes
    const loadSectionData = useCallback(
        async (section: string) => {
            if (!token || !nodeId) return;
            setIsLoading(true);
            setShowData(null);
            try {
                let response: IntentExecuteResponse;
                switch (section) {
                    case "setting":
                        response = await intentService.showRunningConfig(token, nodeId);
                        break;
                    case "interface":
                        response = await intentService.showIpInterfaceBrief(token, nodeId);
                        if (response.success && response.result) {
                            setInterfaces(
                                Array.isArray(response.result.interfaces)
                                    ? response.result.interfaces
                                    : []
                            );
                        }
                        break;
                    case "routing-static":
                    case "routing-ospf":
                    case "routing-default":
                        response = await intentService.showIpRoute(token, nodeId);
                        break;
                    case "vlan":
                        response = await intentService.showVlans(token, nodeId);
                        if (response.success && response.result) {
                            setVlans(
                                Array.isArray(response.result.vlans) ? response.result.vlans : []
                            );
                        }
                        break;
                    case "dhcp":
                        response = await intentService.showDhcpPools(token, nodeId);
                        break;
                    default:
                        response = { success: true, intent: "", node_id: nodeId, strategy_used: "", driver_used: "", result: null, error: null };
                }
                if (response.success) {
                    setShowData(response.result);
                }
            } catch (err: any) {
                console.error("Failed to load section data:", err);
            } finally {
                setIsLoading(false);
            }
        },
        [token, nodeId]
    );

    useEffect(() => {
        if (isOpen && device && nodeId) {
            loadSectionData(activeSection);
        }
    }, [activeSection, isOpen, device, nodeId, loadSectionData]);

    if (!isOpen || !device) return null;

    // ==================== Sidebar Navigation ====================
    const toggleSection = (key: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedSections(newExpanded);
        setActiveSection(key);
    };

    const handleSidebarClick = (key: string, expandable: boolean) => {
        if (expandable) {
            toggleSection(key);
        } else {
            setActiveSection(key);
        }
    };

    const getContentTitle = () => {
        if (activeSection === "setting") return "System Settings";
        if (activeSection === "interface") return "Interfaces";
        if (activeSection === "vlan") return "VLANs";
        if (activeSection === "dhcp") return "DHCP Pools";
        for (const [, items] of Object.entries(SUB_ITEMS)) {
            const found = items.find((item) => item.key === activeSection);
            if (found) return found.label;
        }
        return "Settings";
    };

    // ==================== Push Handlers ====================
    const handlePush = async (intent: string, params: Record<string, any>) => {
        if (!token || !nodeId) return;
        setIsPushing(true);
        setPushResult(null);
        try {
            const response = await intentService.executeIntent(token, {
                intent,
                node_id: nodeId,
                params,
            });
            if (response.success) {
                setPushResult({
                    success: true,
                    message: `✓ Intent "${intent}" pushed successfully`,
                });
                // Reload section data
                loadSectionData(activeSection);
            } else {
                setPushResult({
                    success: false,
                    message: response.error
                        ? JSON.stringify(response.error)
                        : `Failed to execute "${intent}"`,
                });
            }
        } catch (err: any) {
            setPushResult({
                success: false,
                message: err.message || `Failed to execute "${intent}"`,
            });
        } finally {
            setIsPushing(false);
        }
    };

    // ==================== Section Renderers ====================

    const renderSettingContent = () => (
        <div className="space-y-5">
            {/* Hostname */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Hostname</h4>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={hostname}
                        onChange={(e) => setHostname(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Enter hostname"
                    />
                    <button
                        onClick={() => handlePush("system.set_hostname", { hostname })}
                        disabled={isPushing || !hostname}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                        Push
                    </button>
                </div>
            </div>

            {/* DNS */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">DNS Server</h4>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={dnsServer}
                        onChange={(e) => setDnsServer(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="DNS Server (e.g. 8.8.8.8)"
                    />
                    <input
                        type="text"
                        value={dnsDomain}
                        onChange={(e) => setDnsDomain(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Domain (optional)"
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={() => handlePush("system.set_dns", { server: dnsServer, ...(dnsDomain && { domain: dnsDomain }) })}
                        disabled={isPushing || !dnsServer}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                        Push
                    </button>
                </div>
            </div>

            {/* NTP */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">NTP Server</h4>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={ntpServer}
                        onChange={(e) => setNtpServer(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="NTP Server (e.g. pool.ntp.org)"
                    />
                    <button
                        onClick={() => handlePush("system.set_ntp", { server: ntpServer })}
                        disabled={isPushing || !ntpServer}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                        Push
                    </button>
                </div>
            </div>

            {/* Save Config */}
            <div className="flex justify-end pt-2">
                <button
                    onClick={() => handlePush("system.save_config", {})}
                    disabled={isPushing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    <FontAwesomeIcon icon={isPushing ? faSpinner : faSave} className={`w-4 h-4 ${isPushing ? "animate-spin" : ""}`} />
                    Save Configuration
                </button>
            </div>
        </div>
    );

    const renderStaticRouteContent = () => (
        <div className="space-y-4">
            {staticRoutes.map((route, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-800">
                            Static Route {idx + 1}
                        </h4>
                        <div className="flex gap-2">
                            {staticRoutes.length > 1 && (
                                <button
                                    onClick={() =>
                                        setStaticRoutes((prev) => prev.filter((_, i) => i !== idx))
                                    }
                                    className="text-red-500 hover:text-red-700 text-xs"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <input
                            type="text"
                            value={route.prefix}
                            onChange={(e) => {
                                const updated = [...staticRoutes];
                                updated[idx].prefix = e.target.value;
                                setStaticRoutes(updated);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Network (e.g. 10.0.0.0/24)"
                        />
                        <input
                            type="text"
                            value={route.next_hop}
                            onChange={(e) => {
                                const updated = [...staticRoutes];
                                updated[idx].next_hop = e.target.value;
                                setStaticRoutes(updated);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Next Hop"
                        />
                        <input
                            type="text"
                            value={route.mask}
                            onChange={(e) => {
                                const updated = [...staticRoutes];
                                updated[idx].mask = e.target.value;
                                setStaticRoutes(updated);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Mask (optional)"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() =>
                                handlePush("routing.static.delete", {
                                    prefix: route.prefix,
                                    next_hop: route.next_hop,
                                })
                            }
                            disabled={isPushing || !route.prefix || !route.next_hop}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Delete Route
                        </button>
                        <button
                            onClick={() =>
                                handlePush("routing.static.add", {
                                    prefix: route.prefix,
                                    next_hop: route.next_hop,
                                    ...(route.mask && { mask: route.mask }),
                                })
                            }
                            disabled={isPushing || !route.prefix || !route.next_hop}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                            Push
                        </button>
                    </div>
                </div>
            ))}

            <button
                onClick={() =>
                    setStaticRoutes((prev) => [...prev, { prefix: "", next_hop: "", mask: "" }])
                }
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 text-sm rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
                + Add Static Route
            </button>

            {/* Show Data */}
            {showData && (
                <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase">IP Route Table</h4>
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                        {typeof showData === "string" ? showData : JSON.stringify(showData, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );

    const renderOspfContent = () => (
        <div className="space-y-4">
            {/* OSPF Process */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">OSPF Process</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Process ID</label>
                        <input
                            type="number"
                            value={ospfProcessId}
                            onChange={(e) => setOspfProcessId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Router ID</label>
                        <input
                            type="text"
                            value={ospfRouterId}
                            onChange={(e) => setOspfRouterId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="e.g. 1.1.1.1"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => handlePush("routing.ospf.enable", { process_id: parseInt(ospfProcessId) })}
                        disabled={isPushing || !ospfProcessId}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Enable OSPF
                    </button>
                    {ospfRouterId && (
                        <button
                            onClick={() => handlePush("routing.ospf.set_router_id", { process_id: parseInt(ospfProcessId), router_id: ospfRouterId })}
                            disabled={isPushing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Set Router ID
                        </button>
                    )}
                    <button
                        onClick={() => handlePush("routing.ospf.disable", { process_id: parseInt(ospfProcessId) })}
                        disabled={isPushing || !ospfProcessId}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Disable OSPF
                    </button>
                </div>
            </div>

            {/* OSPF Networks */}
            {ospfNetworks.map((net, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-800">Network {idx + 1}</h4>
                        {ospfNetworks.length > 1 && (
                            <button onClick={() => setOspfNetworks((prev) => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                                <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <input
                            type="text"
                            value={net.network}
                            onChange={(e) => { const u = [...ospfNetworks]; u[idx].network = e.target.value; setOspfNetworks(u); }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Network"
                        />
                        <input
                            type="text"
                            value={net.wildcard}
                            onChange={(e) => { const u = [...ospfNetworks]; u[idx].wildcard = e.target.value; setOspfNetworks(u); }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Wildcard"
                        />
                        <input
                            type="text"
                            value={net.area}
                            onChange={(e) => { const u = [...ospfNetworks]; u[idx].area = e.target.value; setOspfNetworks(u); }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Area"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => handlePush("routing.ospf.remove_network", { process_id: parseInt(ospfProcessId), network: net.network, wildcard: net.wildcard, area: parseInt(net.area) })}
                            disabled={isPushing || !net.network || !net.wildcard}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Remove
                        </button>
                        <button
                            onClick={() => handlePush("routing.ospf.add_network", { process_id: parseInt(ospfProcessId), network: net.network, wildcard: net.wildcard, area: parseInt(net.area) })}
                            disabled={isPushing || !net.network || !net.wildcard}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                            Add Network
                        </button>
                    </div>
                </div>
            ))}

            <button
                onClick={() => setOspfNetworks((prev) => [...prev, { network: "", wildcard: "", area: "0" }])}
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 text-sm rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
                + Add OSPF Network
            </button>
        </div>
    );

    const renderDefaultRouteContent = () => (
        <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Default Route</h4>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={defaultNextHop}
                        onChange={(e) => setDefaultNextHop(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Next Hop (e.g. 192.168.1.1)"
                    />
                    <button
                        onClick={() => handlePush("routing.default.delete", { next_hop: defaultNextHop })}
                        disabled={isPushing || !defaultNextHop}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => handlePush("routing.default.add", { next_hop: defaultNextHop })}
                        disabled={isPushing || !defaultNextHop}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                        Push
                    </button>
                </div>
            </div>

            {showData && (
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase">IP Route Table</h4>
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                        {typeof showData === "string" ? showData : JSON.stringify(showData, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );

    const renderInterfaceContent = () => (
        <div className="space-y-4">
            {/* Interface List */}
            {interfaces.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Interface List</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                        {interfaces.map((iface: any, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setSelectedInterface(iface.interface || iface.name || "");
                                    setIfIp(iface.ip || "");
                                    setIfDescription(iface.description || "");
                                }}
                                className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${selectedInterface === (iface.interface || iface.name)
                                    ? "bg-blue-100 text-blue-700"
                                    : "hover:bg-gray-100 text-gray-700"
                                    }`}
                            >
                                <span className="font-medium">{iface.interface || iface.name}</span>
                                {iface.ip && <span className="ml-2 text-gray-500">{iface.ip}</span>}
                                {iface.status && (
                                    <span className={`ml-2 text-xs ${iface.status === "up" ? "text-green-600" : "text-red-500"}`}>
                                        {iface.status}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Configure Interface */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Configure Interface</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Interface Name</label>
                        <input
                            type="text"
                            value={selectedInterface}
                            onChange={(e) => setSelectedInterface(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="e.g. GigabitEthernet1"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Description</label>
                        <input
                            type="text"
                            value={ifDescription}
                            onChange={(e) => setIfDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Interface description"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">IPv4 Address</label>
                        <input
                            type="text"
                            value={ifIp}
                            onChange={(e) => setIfIp(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="e.g. 192.168.1.1"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Prefix Length</label>
                        <input
                            type="text"
                            value={ifPrefix}
                            onChange={(e) => setIfPrefix(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="e.g. 24"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">MTU</label>
                    <input
                        type="text"
                        value={ifMtu}
                        onChange={(e) => setIfMtu(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="e.g. 1500"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={() => handlePush("interface.disable", { interface: selectedInterface })}
                        disabled={isPushing || !selectedInterface}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Disable
                    </button>
                    <button
                        onClick={() => handlePush("interface.enable", { interface: selectedInterface })}
                        disabled={isPushing || !selectedInterface}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Enable
                    </button>
                    {ifDescription && (
                        <button
                            onClick={() => handlePush("interface.set_description", { interface: selectedInterface, description: ifDescription })}
                            disabled={isPushing || !selectedInterface}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Set Description
                        </button>
                    )}
                    {ifIp && ifPrefix && (
                        <button
                            onClick={() => handlePush("interface.set_ipv4", { interface: selectedInterface, ip: ifIp, prefix: ifPrefix })}
                            disabled={isPushing || !selectedInterface}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Set IPv4
                        </button>
                    )}
                    {ifMtu && (
                        <button
                            onClick={() => handlePush("interface.set_mtu", { interface: selectedInterface, mtu: parseInt(ifMtu) })}
                            disabled={isPushing || !selectedInterface}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Set MTU
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const renderVlanContent = () => (
        <div className="space-y-4">
            {/* Existing VLANs */}
            {vlans.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Current VLANs</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="text-gray-500 uppercase">
                                <tr>
                                    <th className="text-left py-1 px-2">ID</th>
                                    <th className="text-left py-1 px-2">Name</th>
                                    <th className="text-left py-1 px-2">Status</th>
                                    <th className="text-right py-1 px-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vlans.map((vlan: any, idx: number) => (
                                    <tr key={idx} className="border-t border-gray-200">
                                        <td className="py-1.5 px-2 font-medium">{vlan.vlan_id || vlan.id}</td>
                                        <td className="py-1.5 px-2">{vlan.name || "-"}</td>
                                        <td className="py-1.5 px-2">{vlan.status || "-"}</td>
                                        <td className="py-1.5 px-2 text-right">
                                            <button
                                                onClick={() => handlePush("vlan.delete", { vlan_id: vlan.vlan_id || vlan.id })}
                                                disabled={isPushing}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create VLAN */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Create VLAN</h4>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="number"
                        value={newVlanId}
                        onChange={(e) => setNewVlanId(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="VLAN ID"
                    />
                    <input
                        type="text"
                        value={newVlanName}
                        onChange={(e) => setNewVlanName(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="VLAN Name (optional)"
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={() => handlePush("vlan.create", { vlan_id: parseInt(newVlanId), ...(newVlanName && { name: newVlanName }) })}
                        disabled={isPushing || !newVlanId}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                        Create VLAN
                    </button>
                </div>
            </div>
        </div>
    );

    const renderDhcpContent = () => (
        <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Create DHCP Pool</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Pool Name</label>
                        <input type="text" value={dhcpPoolName} onChange={(e) => setDhcpPoolName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="e.g. OFFICE_POOL" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Gateway</label>
                        <input type="text" value={dhcpGateway} onChange={(e) => setDhcpGateway(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="e.g. 192.168.1.1" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Subnet Mask</label>
                        <input type="text" value={dhcpMask} onChange={(e) => setDhcpMask(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="e.g. 255.255.255.0" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Start IP</label>
                        <input type="text" value={dhcpStartIp} onChange={(e) => setDhcpStartIp(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="e.g. 192.168.1.100" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">End IP</label>
                        <input type="text" value={dhcpEndIp} onChange={(e) => setDhcpEndIp(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="e.g. 192.168.1.200" />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => handlePush("dhcp.create_pool", {
                            pool_name: dhcpPoolName, gateway: dhcpGateway, mask: dhcpMask, start_ip: dhcpStartIp, end_ip: dhcpEndIp,
                        })}
                        disabled={isPushing || !dhcpPoolName || !dhcpGateway || !dhcpMask || !dhcpStartIp || !dhcpEndIp}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                        Create Pool
                    </button>
                </div>
            </div>

            {/* Show Data */}
            {showData && (
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase">DHCP Pools</h4>
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                        {typeof showData === "string" ? showData : JSON.stringify(showData, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );

    // ==================== Main Content Router ====================
    const renderContent = () => {
        switch (activeSection) {
            case "setting":
                return renderSettingContent();
            case "routing-static":
                return renderStaticRouteContent();
            case "routing-ospf":
                return renderOspfContent();
            case "routing-default":
                return renderDefaultRouteContent();
            case "routing":
                return renderStaticRouteContent(); // Default to static when clicking ROUTING
            case "interface":
                return renderInterfaceContent();
            case "vlan":
                return renderVlanContent();
            case "dhcp":
                return renderDhcpContent();
            default:
                return (
                    <div className="text-sm text-gray-500 italic p-8 text-center">
                        Select a section from the sidebar
                    </div>
                );
        }
    };

    const renderTemplateContent = () => {
        const template = device.configuration_template;
        if (!template) {
            return (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm p-8">
                    No configuration template assigned to this device
                </div>
            );
        }
        return (
            <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 w-32 shrink-0">Template Name</label>
                    <span className="text-sm text-gray-900">{template.template_name}</span>
                </div>
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 w-32 shrink-0">Template Type</label>
                    <span className="text-sm text-gray-900">{template.template_type}</span>
                </div>
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 w-32 shrink-0">Template ID</label>
                    <span className="text-sm text-gray-500 font-mono">{template.id}</span>
                </div>
            </div>
        );
    };

    // ==================== Render ====================
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-gray-900">{device.device_name}</h2>
                            {device.operatingSystem && (
                                <span className="text-sm text-blue-600 underline cursor-pointer">
                                    OS : {device.operatingSystem.os_type}
                                </span>
                            )}
                            {nodeId && (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                    {nodeId}
                                </span>
                            )}
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 shrink-0">
                        <div className="flex gap-1">
                            <button
                                onClick={() => setMainTab("config")}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mainTab === "config" ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
                            >
                                Config
                            </button>
                            <button
                                onClick={() => setMainTab("template")}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mainTab === "template" ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
                            >
                                Template
                            </button>
                        </div>
                        <button
                            onClick={() => handlePush("system.save_config", {})}
                            disabled={isPushing}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors shadow-sm"
                        >
                            <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-4 h-4 ${isPushing ? "animate-spin" : ""}`} />
                            Push
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-hidden">
                        {mainTab === "config" ? (
                            <div className="flex h-full" style={{ minHeight: "480px" }}>
                                {/* Sidebar */}
                                <div className="w-48 border-r border-gray-200 bg-gray-50 overflow-y-auto shrink-0 rounded-bl-xl">
                                    {getSidebarItems(device.type).map((item) => {
                                        const isActive = activeSection === item.key ||
                                            (item.key === "routing" && activeSection.startsWith("routing"));
                                        const isExpanded = expandedSections.has(item.key);
                                        const subItems = SUB_ITEMS[item.key];

                                        return (
                                            <div key={item.key}>
                                                <button
                                                    onClick={() => handleSidebarClick(item.key, item.expandable)}
                                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
                                                    style={{
                                                        borderLeftWidth: "3px",
                                                        borderLeftColor: isActive ? "#3b82f6" : "transparent",
                                                    }}
                                                >
                                                    <span>{item.label}</span>
                                                    {item.expandable && (
                                                        <FontAwesomeIcon
                                                            icon={faChevronRight}
                                                            className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                                        />
                                                    )}
                                                </button>
                                                {item.expandable && isExpanded && subItems && (
                                                    <div className="bg-white">
                                                        {subItems.map((sub) => (
                                                            <button
                                                                key={sub.key}
                                                                onClick={() => setActiveSection(sub.key)}
                                                                className={`w-full text-left pl-8 pr-4 py-2 text-xs font-medium transition-colors ${activeSection === sub.key
                                                                    ? "bg-blue-50 text-blue-700"
                                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                                    }`}
                                                            >
                                                                {sub.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto">
                                    <div className="border-b border-gray-200 px-6 py-3">
                                        <h3 className="text-base font-semibold text-gray-900 text-center">
                                            {getContentTitle()}
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <ResultBanner result={pushResult} onDismiss={() => setPushResult(null)} />
                                        {isLoading ? (
                                            <div className="flex items-center justify-center py-12">
                                                <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-blue-500 animate-spin" />
                                                <span className="ml-2 text-sm text-gray-500">Loading device data...</span>
                                            </div>
                                        ) : (
                                            renderContent()
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ minHeight: "480px" }}>{renderTemplateContent()}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
