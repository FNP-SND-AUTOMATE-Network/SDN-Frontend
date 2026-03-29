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
    CircularProgress,
    Button,
    Chip,
    Stack,
    Divider,
    Badge,
    LinearProgress,
} from "@mui/material";
import {
    Close,
    Save,
    LanOutlined,
    DeleteSweep,
} from "@mui/icons-material";
import { paths } from "@/lib/apiv2/schema";
import { fetchClient } from "@/lib/apiv2/fetch";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { SettingPanel } from "./config-panels/SettingPanel";
import { StaticRoutePanel } from "./config-panels/StaticRoutePanel";
import { OspfPanel } from "./config-panels/OspfPanel";
import { VlanPanel } from "./config-panels/VlanPanel";
import { DhcpPanel } from "./config-panels/DhcpPanel";
import { ConfigurationTemplatePanel } from "./config-panels/ConfigurationTemplatePanel";
import { DeviceInterfaceForm, InterfaceDraft } from "../device/device-detail/DeviceInterfaceForm";
import { StagedIntent } from "./config-panels/types";
import { TopologyConfigSidebar, SUB_ITEMS } from "./TopologyConfigSidebar";
import { TopologyConfigConfirmModal } from "./TopologyConfigConfirmModal";
import { components } from "@/lib/apiv2/schema";

type BulkIntentItemResult = components["schemas"]["BulkIntentItemResult"];

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

// ==================== Main Component ====================
export default function TopologyConfigModal({
    isOpen,
    onClose,
    device,
    onDeviceUpdated,
}: TopologyConfigModalProps) {
    const { snackbar, showSuccess, showError, showWarning, hideSnackbar } = useSnackbar();
    const [mainTab, setMainTab] = useState<MainTab>("config");
    const [activeSection, setActiveSection] = useState<string>("setting");
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // Show data state
    const [showData, setShowData] = useState<Record<string, any> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [discoveredInterfaces, setDiscoveredInterfaces] = useState<NetworkInterface[]>([]);

    // Interface drafts: persist form state per interface name across sidebar switches
    const [interfaceDrafts, setInterfaceDrafts] = useState<Record<string, InterfaceDraft>>({});

    const nodeId = device?.node_id || "";

    // Template states
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(device?.configuration_template?.id || null);
    const [editedConfigContent, setEditedConfigContent] = useState<string>("");
    const [isDeploying, setIsDeploying] = useState(false);

    // ==================== Staged Intents (Bulk Queue) ====================
    const [stagedIntents, setStagedIntents] = useState<StagedIntent[]>([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    
    // Bulk execution states
    const [isBulkPushing, setIsBulkPushing] = useState(false);
    const [bulkResults, setBulkResults] = useState<BulkIntentItemResult[] | null>(null);

    /** Accept a single intent OR an array of intents (from DeviceInterfaceForm) and prevent duplicates */
    const handleStageIntent = useCallback((staged: StagedIntent | StagedIntent[]) => {
        const incomingIntents = Array.isArray(staged) ? staged : [staged];
        
        setStagedIntents((prev) => {
            const next = [...prev];
            
            incomingIntents.forEach(incoming => {
                // Determine a unique identifier for this intent type to prevent functional duplicates
                const getIdentity = (intent: StagedIntent) => {
                    const params = intent.params || {};
                    // Interfaces are uniquely identified by their interface name and intent type
                    if (intent.intent.startsWith('interface.')) {
                        return `${intent.intent}-${params.interface || ''}`;
                    }
                    // Static routes are uniquely identified by their destination network
                    if (intent.intent === 'routing.set_static_route') {
                        return `${intent.intent}-${params.dest || ''}-${params.dest_mask || ''}`;
                    }
                    if (intent.intent === 'routing.set_ospf') {
                        return `${intent.intent}-${params.process_id || ''}`;
                    }
                    // System-wide singletons (hostname, ntp, dns) are unique by intent name alone
                    return intent.intent;
                };

                const incomingIdentity = getIdentity(incoming);
                const existingIndex = next.findIndex(existing => getIdentity(existing) === incomingIdentity);

                if (existingIndex !== -1) {
                    // Replace the existing intent if it targets the same configuration scope
                    next[existingIndex] = incoming;
                } else {
                    // Append new intent
                    next.push(incoming);
                }
            });
            
            return next;
        });
    }, []);

    const handleClearStaged = () => {
        setStagedIntents([]);
    };

    const handleRemoveStaged = (index: number) => {
        setStagedIntents((prev) => prev.filter((_, i) => i !== index));
    };

    // Initialize when device changes
    useEffect(() => {
        if (device) {
            setShowData(null);
            setDiscoveredInterfaces([]);
            setActiveSection("setting");
            setMainTab("config");
            setSelectedTemplateId(device.configuration_template?.id || null);
            setEditedConfigContent("");
            setStagedIntents([]);
            setInterfaceDrafts({});
        }
    }, [device]);

    // Load show data when section changes — uses fetchClient directly
    const loadSectionData = useCallback(
        async (section: string) => {
            if (!nodeId) return;
            setIsLoading(true);
            setShowData(null);
            try {
                // We only fetch interface list from the DB (fast). 
                // We no longer fetch show commands via /api/v1/nbi/intents here to prevent slow loading and 502 Bad Gateway errors.
                if (section === "interface" || section.startsWith("interface-")) {
                    const { data: discoverData } = await fetchClient.GET(
                        "/interfaces/odl/{node_id}",
                        { params: { path: { node_id: nodeId } } }
                    );
                    if (discoverData) {
                        const payload = discoverData as { interfaces?: NetworkInterface[] };
                        setDiscoveredInterfaces(payload.interfaces || []);
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

    // ==================== Bulk Push Handler ====================
    const handleGlobalPush = async () => {
        // Template deploy (unchanged)
        if (mainTab === "template") {
            if (!selectedTemplateId) {
                showError("Please select a template to deploy.");
                return;
            }
            setIsDeploying(true);
            try {
                const { error, response } = await fetchClient.POST("/deployments/", {
                    body: {
                        template_id: selectedTemplateId,
                        device_ids: [device.id],
                        variables: {},
                        config_content: editedConfigContent || undefined,
                    } as any
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

        // ===== BULK PUSH: Send all stagedIntents via /intents/bulk =====
        if (stagedIntents.length === 0) {
            showWarning("No pending intent");
            return;
        }
        setBulkResults(null);
        setConfirmDialogOpen(true);
    };

    const executeBulkPush = async () => {
        setIsBulkPushing(true);
        try {
            const payload = {
                intents: stagedIntents.map(({ intent, node_id, params }) => ({
                    intent,
                    node_id,
                    params,
                })),
            };

            const { data, error, response } = await fetchClient.POST(
                "/api/v1/nbi/intents/bulk",
                { body: payload }
            );

            if (error) {
                const detail = (error as any)?.detail;
                showError(typeof detail === "string" ? detail : JSON.stringify(detail) || "Bulk push failed");
                return;
            }

            const bulkRes = data as any;
            if (response?.status === 200 || bulkRes?.success) {
                showSuccess(`Config Push ${bulkRes.total_executed} success`);
                
                // Show the success results on the modal temporarily
                if (bulkRes.results) {
                    setBulkResults(bulkRes.results);
                } else {
                    setBulkResults(stagedIntents.map((_, i) => ({ index: i, status: "SUCCESS", message: "Success" } as any)));
                }

                // Wait 1.5 seconds for user to see the success state, then close the modal completely
                setTimeout(() => {
                    setBulkResults(null);
                    setStagedIntents([]);
                    setConfirmDialogOpen(false);
                    onClose();
                }, 1500);
            } else if (response?.status === 207) {
                showWarning(
                    `Config Push ${bulkRes.total_executed - bulkRes.total_failed} / ${bulkRes.total_executed} success (${bulkRes.total_failed} failed)`
                );
                if (bulkRes.results) setBulkResults(bulkRes.results);
            } else {
                showError("Unexpected response from bulk endpoint");
                if (bulkRes?.results) setBulkResults(bulkRes.results);
            }

            // Trigger sync and reload interface list if there were successful items (since interfaces might be updated)
            if (bulkRes?.success || (bulkRes?.succeeded && bulkRes.succeeded > 0) || response?.status === 200 || response?.status === 207) {
                try {
                    fetchClient.GET("/interfaces/odl/{node_id}/sync", {
                        params: { path: { node_id: nodeId } }
                    }).then(() => {
                        // Reload if user is currently looking at interface tab or list is expanded
                        if (activeSection.startsWith("interface") || expandedSections.has("interface")) {
                            loadSectionData("interface");
                            if (activeSection.startsWith("interface-")) {
                                loadSectionData(activeSection);
                            }
                        }
                    }).catch(e => console.error("Auto-sync failed", e));
                } catch (syncErr) {
                    console.error("Auto-sync failed directly", syncErr);
                }
            }

        } catch (error: any) {
            console.error("❌ Bulk Push ERROR:", error);
            showError(`Failed to push bulk config: ${error?.message || "Unknown error"}`);
        } finally {
            setIsBulkPushing(false);
        }
    };

    // ==================== Section Renderers ====================
    const renderContent = () => {
        const commonProps = { device, nodeId, showData, onStageIntent: handleStageIntent };

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
                            stagingMode={true}
                            onStageIntent={(intents) => handleStageIntent(intents)}
                            draft={interfaceDrafts[ifaceName]}
                            onDraftChange={(d) => setInterfaceDrafts((prev) => ({ ...prev, [ifaceName]: d }))}
                        />
                    </Box>
                );
            }
        }

        switch (activeSection) {
            case "setting": return <SettingPanel {...commonProps} />;
            case "routing-static": return <StaticRoutePanel {...commonProps} />;
            case "routing-ospf": return <OspfPanel {...commonProps} />;
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

    const isGlobalPushDisabled = mainTab === "config"
        ? (isBulkPushing || stagedIntents.length === 0)
        : isDeploying;

    const getGlobalPushLabel = () => {
        if (mainTab === "template") return "Deploy Template";
        return stagedIntents.length > 0
            ? `Push Config (${stagedIntents.length})`
            : "Save Config";
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
                    <Stack direction="row" spacing={1} alignItems="center">
                        {mainTab === "config" && stagedIntents.length > 0 && (
                            <Button
                                variant="text"
                                size="small"
                                color="error"
                                onClick={handleClearStaged}
                                startIcon={<DeleteSweep />}
                                sx={{ textTransform: "none" }}
                            >
                                Clear
                            </Button>
                        )}
                        <Badge
                            badgeContent={mainTab === "config" ? stagedIntents.length : 0}
                            color="warning"
                            max={99}
                        >
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleGlobalPush}
                                disabled={isGlobalPushDisabled}
                                startIcon={
                                    isBulkPushing || isDeploying
                                        ? <CircularProgress size={16} color="inherit" />
                                        : <Save />
                                }
                                color="primary"
                                sx={{ textTransform: "none" }}
                            >
                                {getGlobalPushLabel()}
                            </Button>
                        </Badge>
                    </Stack>
                </Box>

                {isBulkPushing && <LinearProgress />}

                <Divider />

                {/* Body */}
                <DialogContent sx={{ p: 0, display: "flex", minHeight: 480 }}>
                    {mainTab === "config" ? (
                        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
                            <TopologyConfigSidebar
                                deviceType={device.type}
                                activeSection={activeSection}
                                setActiveSection={setActiveSection}
                                expandedSections={expandedSections}
                                toggleSection={toggleSection}
                                discoveredInterfaces={discoveredInterfaces}
                                stagedIntents={stagedIntents}
                                handleRemoveStaged={handleRemoveStaged}
                            />

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

            <TopologyConfigConfirmModal
                open={confirmDialogOpen}
                onClose={() => {
                    setConfirmDialogOpen(false);
                    // only clear if done
                    if (bulkResults !== null) {
                        setStagedIntents([]);
                        setBulkResults(null);
                    }
                }}
                onReset={() => {
                    setConfirmDialogOpen(false);
                    setStagedIntents([]);
                    setBulkResults(null);
                }}
                deviceName={device.device_name || ""}
                nodeId={nodeId}
                stagedIntents={stagedIntents}
                isPushing={isBulkPushing}
                results={bulkResults}
                onConfirm={executeBulkPush}
            />

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