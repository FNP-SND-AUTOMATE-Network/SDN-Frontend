"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Tabs,
    Tab,
    List,
    ListItemButton,
    ListItemText,
    Collapse,
    CircularProgress,
    Button,
    Chip,
    Stack,
    Divider,
} from "@mui/material";
import {
    Close,
    ExpandMore,
    ChevronRight,
    Save,
    LanOutlined,
} from "@mui/icons-material";
import { paths } from "@/lib/apiv2/schema";
import { fetchClient } from "@/lib/apiv2/fetch";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { SettingPanel } from "./config-panels/SettingPanel";
import { StaticRoutePanel } from "./config-panels/StaticRoutePanel";
import { OspfPanel } from "./config-panels/OspfPanel";
import { DefaultRoutePanel } from "./config-panels/DefaultRoutePanel";
import { VlanPanel } from "./config-panels/VlanPanel";
import { DhcpPanel } from "./config-panels/DhcpPanel";
import { ConfigurationTemplatePanel } from "./config-panels/ConfigurationTemplatePanel";
import { DeviceInterfaceForm } from "../device/device-detail/DeviceInterfaceForm";

// DeviceNetwork type derived from schema paths
type DeviceNetwork =
    paths["/device-networks/"]["get"]["responses"]["200"]["content"]["application/json"]["devices"][number];

// NetworkInterface type — schema response is `unknown`, so define locally
interface NetworkInterface {
    name: string;
    type: string;
    number: string;
    description: string | null;
    admin_status: string;
    ipv4: string | null;
    ipv4_address: string | null;
    subnet_mask: string | null;
    ipv6: string | null;
    mtu: number | null;
    has_ospf: boolean;
    ospf: any;
    oper_status: string;
    mac_address: string;
    speed: string;
    duplex: string;
    auto_negotiate: boolean;
    media_type: string;
    last_change: string;
}

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
            return ALL_SIDEBAR_ITEMS.filter((i) => i.key !== "vlan");
        case "SWITCH":
            return ALL_SIDEBAR_ITEMS.filter((i) => i.key !== "routing" && i.key !== "dhcp");
        default:
            return ALL_SIDEBAR_ITEMS;
    }
}

const SUB_ITEMS: Record<string, { key: string; label: string }[]> = {
    routing: [
        { key: "routing-static", label: "Static Route" },
        { key: "routing-ospf", label: "OSPF" },
        { key: "routing-default", label: "Default Route" },
    ],
};

// ==================== Main Component ====================
export default function TopologyConfigModal({
    isOpen,
    onClose,
    device,
    onDeviceUpdated,
}: TopologyConfigModalProps) {
    const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
    const [mainTab, setMainTab] = useState<MainTab>("config");
    const [activeSection, setActiveSection] = useState<string>("setting");
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // Show data state
    const [showData, setShowData] = useState<Record<string, any> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [discoveredInterfaces, setDiscoveredInterfaces] = useState<NetworkInterface[]>([]);

    const interfaceSaveRef = React.useRef<(() => Promise<void>) | null>(null);
    const [isInterfaceSaving, setIsInterfaceSaving] = useState(false);

    const nodeId = device?.node_id || "";

    // Template states
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(device?.configuration_template?.id || null);
    const [editedConfigContent, setEditedConfigContent] = useState<string>("");
    const [isDeploying, setIsDeploying] = useState(false);

    // Initialize when device changes
    useEffect(() => {
        if (device) {
            setShowData(null);
            setDiscoveredInterfaces([]);
            setActiveSection("setting");
            setMainTab("config");
            setSelectedTemplateId(device.configuration_template?.id || null);
            setEditedConfigContent("");
        }
    }, [device]);

    // Load show data when section changes — uses fetchClient directly
    const loadSectionData = useCallback(
        async (section: string) => {
            if (!nodeId) return;
            setIsLoading(true);
            setShowData(null);
            try {
                let intentName: string | null = null;

                switch (section) {
                    case "setting":
                        intentName = "show.running_config";
                        break;
                    case "interface": {
                        const { data: discoverData } = await fetchClient.GET(
                            "/api/v1/nbi/devices/{node_id}/interfaces/discover",
                            { params: { path: { node_id: nodeId } } }
                        );
                        if (discoverData) {
                            const payload = discoverData as { interfaces?: NetworkInterface[] };
                            setDiscoveredInterfaces(payload.interfaces || []);
                        }
                        setIsLoading(false);
                        return;
                    }
                    case "routing-static":
                    case "routing-ospf":
                    case "routing-default":
                        intentName = "show.ip_route";
                        break;
                    case "vlan":
                        intentName = "show.vlans";
                        break;
                    case "dhcp":
                        intentName = "show.dhcp_pools";
                        break;
                    default:
                        setIsLoading(false);
                        return;
                }

                if (intentName) {
                    const { data, error } = await fetchClient.POST("/api/v1/nbi/intents", {
                        body: { intent: intentName, node_id: nodeId, params: {} },
                    });
                    if (error) {
                        const errDetail = (error as any)?.detail || (error as any)?.message || JSON.stringify(error);
                        console.warn(`[loadSectionData] Intent "${intentName}" error:`, errDetail);
                        // Still try to show partial data if available
                    } else if (data) {
                        if (data.success) {
                            setShowData(data.result ?? null);
                        } else {
                            // Intent returned success=false — show the error as data
                            console.warn(`[loadSectionData] Intent "${intentName}" returned success=false:`, data.error);
                            setShowData(data.result ?? data.error ?? null);
                        }
                    }
                }
            } catch (err: any) {
                console.error("Failed to load section data:", err);
            } finally {
                setIsLoading(false);
            }
        },
        [nodeId]
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
    const handleGlobalPush = async () => {
        if (mainTab === "template") {
            if (!selectedTemplateId) {
                showError("Please select a template to deploy.");
                return;
            }
            setIsDeploying(true);
            try {
                // Deploy Template via POST /deployments/ (correct path per schema)
                const { error, response } = await fetchClient.POST("/deployments/", {
                    body: {
                        template_id: selectedTemplateId,
                        device_ids: [device.id],
                        variables: {},
                        config_content: editedConfigContent || undefined,
                    } as any // Using 'as any' since config_content isn't explicitly defined in DeploymentRequest schema
                });

                if (error) {
                    showError((error as any)?.detail || "Failed to deploy template.");
                } else if (response.ok || response.status === 202 || response.status === 200) {
                    showSuccess("Template deployment job triggered successfully.");
                }
            } catch (err: any) {
                showError(err.message || "Failed to deploy template.");
            } finally {
                setIsDeploying(false);
            }
            return;
        }

        if (activeSection.startsWith("interface-") && interfaceSaveRef.current) {
            setIsInterfaceSaving(true);
            try {
                await interfaceSaveRef.current();
            } finally {
                setIsInterfaceSaving(false);
            }
        } else {
            try {
                const { data, error } = await fetchClient.POST("/api/v1/nbi/intents", {
                    body: { intent: "system.save_config", node_id: nodeId, params: {} },
                });
                if (error) {
                    showError("Failed to save config");
                } else if (data?.success) {
                    showSuccess("Configuration saved successfully");
                } else {
                    showError(data?.error ? JSON.stringify(data.error) : "Save config failed");
                }
            } catch (err: any) {
                showError(err.message || "Failed to save config");
            }
        }
    };

    // ==================== Section Renderers ====================
    const renderContent = () => {
        const commonProps = { device, nodeId, showData };

        if (activeSection.startsWith("interface-")) {
            const ifaceName = activeSection.replace("interface-", "");
            const ifaceData = discoveredInterfaces.find((i) => i.name === ifaceName);
            if (ifaceData) {
                return (
                    <Box sx={{ width: "100%" }}>
                        <DeviceInterfaceForm
                            interfaceData={ifaceData}
                            mode="edit"
                            deviceId={nodeId}
                            onSuccess={() => loadSectionData("interface")}
                            onCancel={() => { }}
                            hideFooter={true}
                            onSaveRef={interfaceSaveRef}
                        />
                    </Box>
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
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            p: 4,
                            border: "2px dashed",
                            borderColor: "divider",
                            borderRadius: 3,
                            mt: 4,
                            maxWidth: 480,
                            mx: "auto",
                        }}
                    >
                        <LanOutlined sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Interface Configuration
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            Please select an interface from the sidebar menu on the left to view and edit its configuration.
                        </Typography>
                        {isLoading && (
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
                                <CircularProgress size={16} />
                                <Typography variant="body2" color="primary">Discovering interfaces...</Typography>
                            </Stack>
                        )}
                    </Box>
                );
            case "vlan": return <VlanPanel {...commonProps} />;
            case "dhcp": return <DhcpPanel {...commonProps} />;
            default:
                return (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", p: 4, textAlign: "center" }}>
                        Select a section from the sidebar
                    </Typography>
                );
        }
    };


    // ==================== Render ====================
    return (
        <>
            <Dialog
                open={isOpen}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { maxHeight: "85vh", borderRadius: 3 } }}
            >
                {/* Header */}
                <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Typography variant="h6" fontWeight={700}>{device.device_name}</Typography>
                        {device.operatingSystem && (
                            <Chip label={`OS: ${device.operatingSystem.os_type}`} size="small" color="primary" variant="outlined" />
                        )}
                        {nodeId && (
                            <Chip label={nodeId} size="small" variant="outlined" sx={{ fontFamily: "monospace", fontSize: "0.7rem" }} />
                        )}
                    </Stack>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </DialogTitle>

                <Divider />

                {/* Tabs + Push Button */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 1 }}>
                    <Tabs
                        value={mainTab}
                        onChange={(_, v) => setMainTab(v)}
                        sx={{ minHeight: 40, "& .MuiTab-root": { minHeight: 40, textTransform: "none" } }}
                    >
                        <Tab label="Config" value="config" />
                        <Tab label="Template" value="template" />
                    </Tabs>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleGlobalPush}
                        disabled={mainTab === "config" ? isInterfaceSaving : isDeploying}
                        startIcon={
                            (mainTab === "config" && isInterfaceSaving) || (mainTab === "template" && isDeploying)
                                ? <CircularProgress size={16} color="inherit" />
                                : <Save />
                        }
                        color="primary"
                        sx={{ textTransform: "none"}}
                    >
                        {mainTab === "template"
                            ? "Deploy Template"
                            : activeSection.startsWith("interface-")
                                ? "Save Interface"
                                : "Save Config"
                        }
                    </Button>
                </Box>

                <Divider />

                {/* Body */}
                <DialogContent sx={{ p: 0, display: "flex", minHeight: 480 }}>
                    {mainTab === "config" ? (
                        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
                            {/* Sidebar */}
                            <Box
                                sx={{
                                    width: 200,
                                    borderRight: 1,
                                    borderColor: "divider",
                                    bgcolor: "grey.50",
                                    overflowY: "auto",
                                    flexShrink: 0,
                                }}
                            >
                                <List disablePadding dense>
                                    {getSidebarItems(device.type).map((item) => {
                                        const isActive = activeSection === item.key ||
                                            (item.key === "routing" && activeSection.startsWith("routing-")) ||
                                            (item.key === "interface" && activeSection.startsWith("interface-"));
                                        const isExpanded = expandedSections.has(item.key);

                                        let subItems = SUB_ITEMS[item.key];
                                        if (item.key === "interface") {
                                            subItems = discoveredInterfaces.map(iface => ({
                                                key: `interface-${iface.name}`,
                                                label: iface.name,
                                            }));
                                        }

                                        return (
                                            <React.Fragment key={item.key}>
                                                <ListItemButton
                                                    onClick={() => handleSidebarClick(item.key, item.expandable)}
                                                    selected={isActive}
                                                    sx={{
                                                        borderLeft: 3,
                                                        borderColor: isActive ? "primary.main" : "transparent",
                                                        py: 1,
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={item.label}
                                                        primaryTypographyProps={{
                                                            variant: "caption",
                                                            fontWeight: 700,
                                                            letterSpacing: "0.05em",
                                                        }}
                                                    />
                                                    {item.expandable && (isExpanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />)}
                                                </ListItemButton>
                                                {item.expandable && subItems && (
                                                    <Collapse in={isExpanded}>
                                                        <List disablePadding dense>
                                                            {subItems.map((sub) => (
                                                                <ListItemButton
                                                                    key={sub.key}
                                                                    onClick={() => setActiveSection(sub.key)}
                                                                    selected={activeSection === sub.key}
                                                                    sx={{ pl: 4, py: 0.75 }}
                                                                >
                                                                    <ListItemText
                                                                        primary={sub.label}
                                                                        primaryTypographyProps={{ variant: "body2", fontSize: "0.75rem" }}
                                                                    />
                                                                </ListItemButton>
                                                            ))}
                                                        </List>
                                                    </Collapse>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </List>
                            </Box>

                            {/* Content */}
                            <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                                <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3, py: 1.5 }}>
                                    <Typography variant="subtitle1" fontWeight={600} textAlign="center">
                                        {getContentTitle()}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
                                    {isLoading ? (
                                        <Box display="flex" alignItems="center" justifyContent="center" py={6}>
                                            <CircularProgress size={24} />
                                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1.5 }}>
                                                Loading device data...
                                            </Typography>
                                        </Box>
                                    ) : (
                                        renderContent()
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ minHeight: 480, width: "100%" }}>
                            <ConfigurationTemplatePanel
                                isOpen={isOpen}
                                mainTab={mainTab}
                                selectedTemplateId={selectedTemplateId}
                                setSelectedTemplateId={setSelectedTemplateId}
                                editedConfigContent={editedConfigContent}
                                setEditedConfigContent={setEditedConfigContent}
                            />
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            <MuiSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                title={snackbar.title}
                onClose={hideSnackbar}
            />
        </>
    );
}