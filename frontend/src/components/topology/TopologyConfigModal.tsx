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
    faNetworkWired,
} from "@fortawesome/free-solid-svg-icons";
import { DeviceNetwork, deviceNetworkService, InterfaceDiscoveryResponse } from "@/services/deviceNetworkService";
import { intentService, IntentExecuteResponse } from "@/services/intentService";
import { useAuth } from "@/contexts/AuthContext";
import { SettingPanel } from "./config-panels/SettingPanel";
import { StaticRoutePanel } from "./config-panels/StaticRoutePanel";
import { OspfPanel } from "./config-panels/OspfPanel";
import { DefaultRoutePanel } from "./config-panels/DefaultRoutePanel";
import { VlanPanel } from "./config-panels/VlanPanel";
import { DhcpPanel } from "./config-panels/DhcpPanel";
import { DeviceInterfaceForm } from "../device/device-detail/DeviceInterfaceForm";

type NetworkInterface = InterfaceDiscoveryResponse["interfaces"][0];

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
    { key: "interface", label: "INTERFACE", expandable: true },
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

    const interfaceSaveRef = React.useRef<(() => Promise<void>) | null>(null);
    const [isInterfaceSaving, setIsInterfaceSaving] = useState(false);



    // ===== Show data state =====
    const [showData, setShowData] = useState<Record<string, any> | null>(null);
    const [discoveredInterfaces, setDiscoveredInterfaces] = useState<NetworkInterface[]>([]);

    const nodeId = device?.node_id || "";

    // Initialize when device changes
    useEffect(() => {
        if (device) {
            setPushResult(null);
            setShowData(null);
            setDiscoveredInterfaces([]);
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
                        const uiInterfaces = await deviceNetworkService.discoverInterfaces(token, nodeId);
                        setDiscoveredInterfaces(uiInterfaces.interfaces || []);
                        response = { success: true, intent: "", node_id: nodeId, strategy_used: "", driver_used: "", result: null, error: null };
                        break;
                    case "routing-static":
                    case "routing-ospf":
                    case "routing-default":
                        response = await intentService.showIpRoute(token, nodeId);
                        break;
                    case "vlan":
                        response = await intentService.showVlans(token, nodeId);
                        // showData will be set below
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
        if (activeSection.startsWith("interface-")) return `Interface: ${activeSection.replace("interface-", "")}`;
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

    const handleGlobalPush = async () => {
        if (activeSection.startsWith("interface-") && interfaceSaveRef.current) {
            setIsInterfaceSaving(true);
            try {
                await interfaceSaveRef.current();
            } finally {
                setIsInterfaceSaving(false);
            }
        } else {
            handlePush("system.save_config", {});
        }
    };

    // ==================== Section Renderers ====================

    // ==================== Main Content Router ====================
    const renderContent = () => {
        const commonProps = { device, showData, isPushing, handlePush };

        if (activeSection.startsWith("interface-")) {
            const ifaceName = activeSection.replace("interface-", "");
            const ifaceData = discoveredInterfaces.find((i) => i.name === ifaceName);
            if (ifaceData) {
                return (
                    <div className="w-full">
                        <DeviceInterfaceForm
                            interfaceData={ifaceData}
                            mode="edit"
                            deviceId={nodeId}
                            token={token}
                            onSuccess={() => loadSectionData("interface")} // Refresh on success
                            onCancel={() => { }}
                            hideFooter={true}
                            onSaveRef={interfaceSaveRef}
                        />
                    </div>
                );
            }
        }

        switch (activeSection) {
            case "setting": return <SettingPanel {...commonProps} />;
            case "routing-static": return <StaticRoutePanel {...commonProps} />;
            case "routing-ospf": return <OspfPanel {...commonProps} />;
            case "routing-default": return <DefaultRoutePanel {...commonProps} />;
            case "routing": return <StaticRoutePanel {...commonProps} />;
            case "interface":
                return (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 font-sf-pro-text p-8 w-full border-2 border-dashed border-gray-200 mt-8 rounded-xl max-w-lg mx-auto">
                        <FontAwesomeIcon icon={faNetworkWired} className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Interface Configuration</h3>
                        <p className="text-sm text-center">
                            Please select an interface from the sidebar menu on the left to view and edit its configuration.
                        </p>
                        {isLoading && (
                            <div className="mt-4 text-blue-500 flex items-center gap-2">
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" />
                                <span className="text-sm">Discovering interfaces...</span>
                            </div>
                        )}
                    </div>
                );
            case "vlan": return <VlanPanel {...commonProps} />;
            case "dhcp": return <DhcpPanel {...commonProps} />;
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
                            onClick={handleGlobalPush}
                            disabled={isPushing || isInterfaceSaving}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors shadow-sm"
                        >
                            <FontAwesomeIcon icon={(isPushing || isInterfaceSaving) ? faSpinner : faPlusCircle} className={`w-4 h-4 ${(isPushing || isInterfaceSaving) ? "animate-spin" : ""}`} />
                            {activeSection.startsWith("interface-") ? "Save Interface" : "Push"}
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                        {mainTab === "config" ? (
                            <div className="flex flex-1 overflow-hidden" style={{ minHeight: "480px" }}>
                                {/* Sidebar */}
                                <div className="w-48 border-r border-gray-200 bg-gray-50 overflow-y-auto shrink-0 rounded-bl-xl">
                                    {getSidebarItems(device.type).map((item) => {
                                        const isActive = activeSection === item.key ||
                                            (item.key === "routing" && activeSection.startsWith("routing-")) ||
                                            (item.key === "interface" && activeSection.startsWith("interface-"));
                                        const isExpanded = expandedSections.has(item.key);

                                        let subItems = SUB_ITEMS[item.key];
                                        if (item.key === "interface") {
                                            subItems = discoveredInterfaces.map(iface => ({
                                                key: `interface-${iface.name}`,
                                                label: iface.name
                                            }));
                                        }

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
                                <div className="flex-1 overflow-hidden flex flex-col rounded-br-xl bg-white">
                                    <div className="border-b border-gray-200 px-6 py-3 shrink-0">
                                        <h3 className="text-base font-semibold text-gray-900 text-center">
                                            {getContentTitle()}
                                        </h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6">
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