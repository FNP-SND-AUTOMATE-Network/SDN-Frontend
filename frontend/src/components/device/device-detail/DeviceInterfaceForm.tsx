"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Stack,
    TextField,
    Switch,
    FormControlLabel,
    Button,
    Divider,
    CircularProgress,
} from "@mui/material";
import {
    Memory,
    Language,
    AltRoute,
    AccessTime,
    Add as AddIcon,
} from "@mui/icons-material";
import { InterfaceDiscoveryResponse } from "@/services/deviceNetworkService";
import { fetchClient } from "@/lib/apiv2/fetch";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { StagedIntent } from "@/components/topology/config-panels/types";
import IPPicker from "@/components/device/device-list/IPPicker";

type NetworkInterface = InterfaceDiscoveryResponse["interfaces"][0];

/** Draft state that can be persisted across interface switches */
export interface InterfaceDraft {
    adminStatus: boolean;
    description: string;
    duplex: string;
    autoNegotiate: boolean;
    ipv4Address: string;
    subnetMask: string;
    ipv6Address: string;
    mtu: string | number;
    ospfProcessId: string;
    ospfArea: string;
}

interface DeviceInterfaceFormProps {
    interfaceData: NetworkInterface;
    mode: "view" | "edit";
    deviceId: string;
    onSuccess: (msg?: string) => void;
    onCancel: () => void;
    hideFooter?: boolean;
    onSaveRef?: React.MutableRefObject<(() => Promise<void>) | null>;
    /** When true, the form will not fire API calls. Instead it stages intents via onStageIntent. */
    stagingMode?: boolean;
    /** Callback to queue intents for bulk push (only used when stagingMode=true) */
    onStageIntent?: (intents: StagedIntent[]) => void;
    /** External draft state for preserving form values across interface switches */
    draft?: InterfaceDraft;
    /** Callback when draft changes so parent can persist it */
    onDraftChange?: (draft: InterfaceDraft) => void;
}

// --- Helper: Section Header ---
function SectionHeader({ icon, title, action }: { icon: React.ReactNode; title: string; action?: React.ReactNode }) {
    return (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ pb: 1, mb: 2, borderBottom: 1, borderColor: "divider" }}
        >
            <Stack direction="row" alignItems="center" spacing={1}>
                {icon}
                <Typography variant="subtitle2" fontWeight={600}>
                    {title}
                </Typography>
            </Stack>
            {action && <Box>{action}</Box>}
        </Stack>
    );
}

export function DeviceInterfaceForm({
    interfaceData,
    mode,
    deviceId,
    onSuccess,
    onCancel,
    hideFooter,
    onSaveRef,
    stagingMode = false,
    onStageIntent,
    draft,
    onDraftChange,
}: DeviceInterfaceFormProps) {
    const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();

    // Local state for edits
    const [adminStatus, setAdminStatus] = useState(true);
    const [description, setDescription] = useState("");
    const [duplex, setDuplex] = useState("");
    const [autoNegotiate, setAutoNegotiate] = useState(true);
    const [ipv4Address, setIpv4Address] = useState("");
    const [subnetMask, setSubnetMask] = useState("");
    const [ipv6Address, setIpv6Address] = useState("");
    const [mtu, setMtu] = useState<string | number>("");
    const [ospfProcessId, setOspfProcessId] = useState("");
    const [ospfArea, setOspfArea] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    // Guard to prevent onDraftChange from firing during init
    const isInitializingRef = React.useRef(false);

    // Initialize from draft (if provided) or from interfaceData
    // Only depends on interfaceData.name — when user switches interface, we re-init
    useEffect(() => {
        isInitializingRef.current = true;
        if (draft) {
            // Restore from persisted draft
            setAdminStatus(draft.adminStatus);
            setDescription(draft.description);
            setDuplex(draft.duplex);
            setAutoNegotiate(draft.autoNegotiate);
            setIpv4Address(draft.ipv4Address);
            setSubnetMask(draft.subnetMask);
            setIpv6Address(draft.ipv6Address);
            setMtu(draft.mtu);
            setOspfProcessId(draft.ospfProcessId);
            setOspfArea(draft.ospfArea);
        } else if (interfaceData) {
            setAdminStatus(interfaceData.admin_status?.toLowerCase() === "up");
            setDescription(interfaceData.description || "");
            setDuplex(interfaceData.duplex || "Auto");
            setAutoNegotiate(interfaceData.auto_negotiate ?? true);
            setIpv4Address(interfaceData.ipv4_address || "");
            setSubnetMask(interfaceData.subnet_mask || "");
            setIpv6Address(interfaceData.ipv6 || "");
            setMtu(interfaceData.mtu || "");

            if (interfaceData.has_ospf && interfaceData.ospf) {
                setOspfProcessId(interfaceData.ospf.process_id?.toString() || "");
                setOspfArea(interfaceData.ospf.area?.toString() || "");
            } else {
                setOspfProcessId("");
                setOspfArea("");
            }
        }
        // Allow onDraftChange after a tick (after React batches the setState calls)
        requestAnimationFrame(() => { isInitializingRef.current = false; });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interfaceData.name]);

    // Notify parent of draft changes (for persistence across interface switches)
    useEffect(() => {
        // Skip during initialization to avoid infinite loop
        if (isInitializingRef.current) return;
        if (onDraftChange && stagingMode) {
            onDraftChange({
                adminStatus,
                description,
                duplex,
                autoNegotiate,
                ipv4Address,
                subnetMask,
                ipv6Address,
                mtu,
                ospfProcessId,
                ospfArea,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adminStatus, description, duplex, autoNegotiate, ipv4Address, subnetMask, ipv6Address, mtu, ospfProcessId, ospfArea]);

    // ==================== Build Intent List (shared between staging & direct modes) ====================
    const buildIntents = (): StagedIntent[] => {
        const intents: StagedIntent[] = [];
        const ifName = interfaceData.name;

        // 1. Admin Status
        const currentAdminUp = interfaceData.admin_status?.toLowerCase() === "up";
        if (adminStatus && !currentAdminUp) {
            intents.push({ intent: "interface.enable", node_id: deviceId, params: { interface: ifName, admin_status: "up" }, label: `${ifName}: Enable (no shutdown)` });
        } else if (!adminStatus && currentAdminUp) {
            intents.push({ intent: "interface.disable", node_id: deviceId, params: { interface: ifName, admin_status: "down" }, label: `${ifName}: Disable (shutdown)` });
        }

        // 2. IPv4
        const ipChanged = ipv4Address !== (interfaceData.ipv4_address || "") || subnetMask !== (interfaceData.subnet_mask || "");
        if (ipChanged && ipv4Address && subnetMask) {
            intents.push({ intent: "interface.set_ipv4", node_id: deviceId, params: { interface: ifName, ip: ipv4Address, mask: subnetMask }, label: `${ifName}: Set IPv4 → ${ipv4Address}` });
        }

        // 3. Description
        const descChanged = description !== (interfaceData.description || "");
        if (descChanged) {
            intents.push({ intent: "interface.set_description", node_id: deviceId, params: { interface: ifName, description }, label: `${ifName}: Set description` });
        }

        // 4. MTU
        const mtuChanged = mtu !== (interfaceData.mtu || "");
        if (mtuChanged && mtu) {
            intents.push({ intent: "interface.set_mtu", node_id: deviceId, params: { interface: ifName, mtu: parseInt(mtu.toString(), 10) }, label: `${ifName}: Set MTU → ${mtu}` });
        }

        // 5. IPv6
        const ipv6Changed = ipv6Address !== (interfaceData.ipv6 || "");
        if (ipv6Changed && ipv6Address) {
            let ip = ipv6Address;
            let prefix = "64";
            if (ipv6Address.includes("/")) {
                const parts = ipv6Address.split("/");
                ip = parts[0];
                prefix = parts[1];
            }
            intents.push({ intent: "interface.set_ipv6", node_id: deviceId, params: { interface: ifName, ip, prefix }, label: `${ifName}: Set IPv6 → ${ip}` });
        }

        // 6. OSPF
        const oldProcessId = interfaceData.ospf?.process_id?.toString() || "";
        const oldArea = interfaceData.ospf?.area?.toString() || "";
        const newProcessId = ospfProcessId.trim();
        const newArea = ospfArea.trim();

        if (newProcessId !== oldProcessId || newArea !== oldArea) {
            if (newProcessId && newArea) {
                intents.push({ intent: "routing.ospf.add_network_interface", node_id: deviceId, params: { process_id: parseInt(newProcessId, 10), interface: ifName, area: parseInt(newArea, 10) }, label: `${ifName}: OSPF area ${newArea}` });
            } else if (!newProcessId && !newArea && oldProcessId && oldArea) {
                intents.push({ intent: "routing.ospf.remove_network_interface", node_id: deviceId, params: { process_id: parseInt(oldProcessId, 10), interface: ifName, area: parseInt(oldArea, 10) }, label: `${ifName}: Remove OSPF` });
            }
        }

        return intents;
    };

    // ==================== Staging Mode: Queue intents ====================
    const handleStageIntents = () => {
        const intents = buildIntents();
        if (intents.length === 0) {
            showError("ไม่มีการเปลี่ยนแปลง — ไม่มี Intent ที่ต้อง Queue");
            return;
        }
        if (onStageIntent) {
            onStageIntent(intents);
            showSuccess(`เพิ่ม ${intents.length} รายการของ ${interfaceData.name} เข้าคิว`);
        }
    };

    // ==================== Direct Mode: Execute intents immediately ====================
    const executeIntent = async (intent: string, params: Record<string, any>) => {
        const { data, error } = await fetchClient.POST("/api/v1/nbi/intents", {
            body: {
                intent,
                node_id: deviceId,
                params,
            },
        });
        if (error) {
            let errorMsg = `Failed to execute intent: ${intent}`;
            if (error && typeof error === 'object') {
                if ((error as any).detail) {
                    if (Array.isArray((error as any).detail)) {
                        errorMsg = (error as any).detail.map((e: any) => `${e.loc?.join('->') || 'Field'}: ${e.msg}`).join(', ');
                    } else if (typeof (error as any).detail === 'string') {
                        errorMsg = (error as any).detail;
                    } else {
                        errorMsg = JSON.stringify((error as any).detail);
                    }
                } else if ((error as any).message) {
                    errorMsg = (error as any).message;
                } else {
                    try {
                        const str = JSON.stringify(error);
                        if (str !== "{}") errorMsg = str;
                    } catch (e) { }
                }
            } else if (typeof error === 'string') {
                errorMsg = error;
            }
            throw new Error(errorMsg);
        }

        if (data && !(data as any).success) {
            const backendError = (data as any).error;
            const errMsg = typeof backendError === 'string' ? backendError : JSON.stringify(backendError);
            throw new Error(errMsg || `Intent ${intent} returned success=false`);
        }
    };

    const handleSave = async () => {
        // In staging mode, delegate to handleStageIntents
        if (stagingMode) {
            handleStageIntents();
            return;
        }

        // Direct mode: execute intents immediately
        setIsSaving(true);
        try {
            const intents = buildIntents();
            for (const staged of intents) {
                await executeIntent(staged.intent, staged.params);
            }

            // Auto-sync interfaces after config push
            try {
                await fetchClient.GET("/interfaces/odl/{node_id}/sync", {
                    params: { path: { node_id: deviceId } }
                });
            } catch (syncErr) {
                console.error("Failed to run sync:", syncErr);
            }

            // Instead of showing local snackbar and unmounting, pass the message to the parent
            onSuccess(`Interface ${interfaceData.name} updated successfully`);
        } catch (error: any) {
            console.error("❌ [handleSave] ERROR:", error);
            showError(`Failed to save config: ${error?.message || "Unknown error"}`);
        } finally {
            setIsSaving(false);
        }
    };

    const isEdit = mode === "edit";

    // Expose handleSave to parent
    if (onSaveRef) {
        onSaveRef.current = handleSave;
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", ...(hideFooter ? {} : { height: "100%" }) }}>
            <Box sx={{ flex: 1, ...(hideFooter ? {} : { p: 3, overflowY: "auto" }) }}>
                <Stack spacing={4}>
                    {/* Section 1: Hardware & Status */}
                    <Box>
                        <SectionHeader
                            icon={<Memory fontSize="small" color="action" />}
                            title="Hardware & Status"
                            action={
                                stagingMode && isEdit ? (
                                    <Button
                                        variant="outlined"
                                        color="warning"
                                        size="small"
                                        onClick={handleStageIntents}
                                        startIcon={<AddIcon />}
                                        sx={{ textTransform: "none", py: 0.25 }}
                                    >
                                        Queue {interfaceData.name}
                                    </Button>
                                ) : undefined
                            }
                        />
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                                gap: 2.5,
                            }}
                        >
                            {/* Admin Status */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: "block" }}>
                                    Admin Status
                                </Typography>
                                {isEdit ? (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={adminStatus}
                                                onChange={() => setAdminStatus(!adminStatus)}
                                                size="small"
                                            />
                                        }
                                        label={adminStatus ? "UP" : "DOWN"}
                                        slotProps={{ typography: { variant: "body2", fontWeight: 500 } }}
                                    />
                                ) : (
                                    <Typography variant="body2">
                                        {interfaceData.admin_status?.toUpperCase()}
                                    </Typography>
                                )}
                            </Box>

                            {/* Description */}
                            {isEdit ? (
                                <TextField
                                    label="Description"
                                    size="small"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    fullWidth
                                />
                            ) : (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: "block" }}>
                                        Description
                                    </Typography>
                                    <Typography variant="body2">{description || "-"}</Typography>
                                </Box>
                            )}

                            {/* MAC Address (always read-only) */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: "block" }}>
                                    MAC Address
                                </Typography>
                                <Typography variant="body2">{interfaceData.mac_address || "-"}</Typography>
                            </Box>

                            {/* Duplex (always read-only, intent not supported yet) */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: "block" }}>
                                    Duplex
                                </Typography>
                                <Typography variant="body2">{interfaceData.duplex || "-"}</Typography>
                            </Box>

                            {/* Auto Negotiate */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: "block" }}>
                                    Auto Negotiate
                                </Typography>
                                {isEdit ? (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={autoNegotiate}
                                                onChange={() => setAutoNegotiate(!autoNegotiate)}
                                                size="small"
                                            />
                                        }
                                        label={autoNegotiate ? "ON" : "OFF"}
                                        slotProps={{ typography: { variant: "body2", fontWeight: 500 } }}
                                    />
                                ) : (
                                    <Typography variant="body2">
                                        {interfaceData.auto_negotiate ? "ON" : "OFF"}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    {/* Section 2: IP Configuration */}
                    <Box>
                        <SectionHeader
                            icon={<Language fontSize="small" color="action" />}
                            title="IP Configuration"
                        />
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                                gap: 2.5,
                            }}
                        >
                            {isEdit ? (
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <TextField
                                        label="IPv4 Address"
                                        size="small"
                                        value={ipv4Address}
                                        onChange={(e) => setIpv4Address(e.target.value)}
                                        fullWidth
                                    />
                                    <IPPicker 
                                        onIpSelect={(ip) => setIpv4Address(ip)} 
                                        disabled={isSaving} 
                                    />
                                </Box>
                            ) : (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: "block" }}>
                                        IPv4 Address
                                    </Typography>
                                    <Typography variant="body2">{ipv4Address || "-"}</Typography>
                                </Box>
                            )}

                            {isEdit ? (
                                <TextField
                                    label="Subnet Mask (or Prefix)"
                                    size="small"
                                    value={subnetMask}
                                    onChange={(e) => setSubnetMask(e.target.value)}
                                    fullWidth
                                />
                            ) : (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: "block" }}>
                                        Subnet Mask
                                    </Typography>
                                    <Typography variant="body2">{subnetMask || "-"}</Typography>
                                </Box>
                            )}

                            {isEdit ? (
                                <TextField
                                    label="IPv6 Address"
                                    size="small"
                                    value={ipv6Address}
                                    onChange={(e) => setIpv6Address(e.target.value)}
                                    fullWidth
                                />
                            ) : (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: "block" }}>
                                        IPv6 Address
                                    </Typography>
                                    <Typography variant="body2">{ipv6Address || "-"}</Typography>
                                </Box>
                            )}

                            {isEdit ? (
                                <TextField
                                    label="MTU"
                                    size="small"
                                    value={mtu}
                                    onChange={(e) => setMtu(e.target.value)}
                                    fullWidth
                                />
                            ) : (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: "block" }}>
                                        MTU
                                    </Typography>
                                    <Typography variant="body2">{mtu || "-"}</Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Section 3: OSPF Routing (Optional) */}
                    {(interfaceData.has_ospf || isEdit) && (
                        <Box>
                            <SectionHeader
                                icon={<AltRoute fontSize="small" color="action" />}
                                title="OSPF Routing"
                            />
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                                    gap: 2.5,
                                }}
                            >
                                {isEdit ? (
                                    <TextField
                                        label="Process ID"
                                        size="small"
                                        value={ospfProcessId}
                                        onChange={(e) => setOspfProcessId(e.target.value)}
                                        fullWidth
                                    />
                                ) : (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: "block" }}>
                                            Process ID
                                        </Typography>
                                        <Typography variant="body2">{ospfProcessId || "-"}</Typography>
                                    </Box>
                                )}

                                {isEdit ? (
                                    <TextField
                                        label="Area"
                                        size="small"
                                        value={ospfArea}
                                        onChange={(e) => setOspfArea(e.target.value)}
                                        fullWidth
                                    />
                                ) : (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: "block" }}>
                                            Area
                                        </Typography>
                                        <Typography variant="body2">{ospfArea || "-"}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    )}

                    {/* Section 4: Last Change */}
                    <Box>
                        <SectionHeader
                            icon={<AccessTime fontSize="small" color="action" />}
                            title="Last Change"
                        />
                        <Typography variant="body2">
                            {interfaceData.last_change || "-"}
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* Footer (only in non-staging, non-hidden mode) */}
            {!hideFooter && (
                <>
                    <Divider />
                    <Box
                        sx={{
                            p: 2.5,
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1.5,
                            bgcolor: "grey.50",
                            flexShrink: 0,
                        }}
                    >
                        <Button variant="outlined" onClick={onCancel} disabled={isSaving}>
                            {isEdit ? "Cancel" : "Close"}
                        </Button>
                        {isEdit && (
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={isSaving}
                                startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
                            >
                                Save Changes
                            </Button>
                        )}
                    </Box>
                </>
            )}

            {/* MuiSnackbar for success/error alerts */}
            <MuiSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                title={snackbar.title}
                onClose={hideSnackbar}
            />
        </Box>
    );
}
