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
    allInterfaces?: NetworkInterface[];
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

const IPV4_MASK_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV4_ADDRESS_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;

function ipv4ToInt(ip: string): number {
    const octets = ip.split(".").map((part) => Number(part));
    if (octets.length !== 4 || octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255)) {
        throw new Error(`IPv4 address ไม่ถูกต้อง: ${ip}`);
    }
    return (((octets[0] << 24) >>> 0) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

function intToIpv4(value: number): string {
    return [
        (value >>> 24) & 255,
        (value >>> 16) & 255,
        (value >>> 8) & 255,
        value & 255,
    ].join(".");
}

function isValidIpv4Address(ip: string): boolean {
    if (!IPV4_ADDRESS_PATTERN.test(ip)) return false;
    const octets = ip.split(".").map((part) => Number(part));
    return octets.length === 4 && octets.every((octet) => !Number.isNaN(octet) && octet >= 0 && octet <= 255);
}

function getIpv4Range(ip: string, mask: string): { start: number; end: number; network: string } {
    const ipInt = ipv4ToInt(ip);
    const maskInt = ipv4ToInt(mask);
    const start = (ipInt & maskInt) >>> 0;
    const end = (start | ((~maskInt) >>> 0)) >>> 0;
    return { start, end, network: intToIpv4(start) };
}

function findOverlappingInterface(
    targetInterfaceName: string,
    targetIp: string,
    targetMask: string,
    allInterfaces: NetworkInterface[],
): { interfaceName: string; network: string } | null {
    const targetRange = getIpv4Range(targetIp, targetMask);

    for (const iface of allInterfaces) {
        if (iface.name === targetInterfaceName) continue;
        const otherIp = (iface.ipv4_address || "").trim();
        const rawOtherMask = (iface.subnet_mask || "").trim();
        if (!otherIp || !rawOtherMask) continue;
        if (!isValidIpv4Address(otherIp)) continue;

        let otherMask = "";
        try {
            otherMask = normalizeIpv4Mask(rawOtherMask);
        } catch {
            continue;
        }

        const otherRange = getIpv4Range(otherIp, otherMask);
        const overlaps = Math.max(targetRange.start, otherRange.start) <= Math.min(targetRange.end, otherRange.end);

        if (overlaps) {
            return { interfaceName: iface.name, network: otherRange.network };
        }
    }

    return null;
}

function prefixToIpv4Mask(prefix: number): string {
    if (prefix < 16 || prefix > 30) {
        throw new Error("IPv4 prefix ต้องอยู่ระหว่าง 16 ถึง 30");
    }

    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    return [
        (mask >>> 24) & 255,
        (mask >>> 16) & 255,
        (mask >>> 8) & 255,
        mask & 255,
    ].join(".");
}

function isValidIpv4SubnetMask(mask: string): boolean {
    if (!IPV4_MASK_PATTERN.test(mask)) return false;

    const octets = mask.split(".").map((part) => Number(part));
    if (octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255)) {
        return false;
    }

    const bits = octets
        .map((octet) => octet.toString(2).padStart(8, "0"))
        .join("");

    return /^1*0*$/.test(bits);
}

function normalizeIpv4Mask(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "";

    const prefixCandidate = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
    if (/^\d{1,2}$/.test(prefixCandidate)) {
        return prefixToIpv4Mask(Number(prefixCandidate));
    }

    if (isValidIpv4SubnetMask(trimmed)) {
        return trimmed;
    }

    throw new Error("Subnet Mask incorrect (must be valid mask like 255.255.255.0 or /24)");
}

function normalizeMaskForCompare(value: string): string {
    try {
        return normalizeIpv4Mask(value);
    } catch {
        return value.trim();
    }
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
    allInterfaces = [],
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
    const [ipv4AddressError, setIpv4AddressError] = useState("");
    const [subnetMask, setSubnetMask] = useState("");
    const [subnetMaskError, setSubnetMaskError] = useState("");
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
            setIpv4AddressError("");
            setSubnetMask(interfaceData.subnet_mask || "");
            setSubnetMaskError("");
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
    const applyInlineValidationError = (message: string): boolean => {
        if (message.includes("IPv4 Address") || message.includes("IPv4 is incomplete") || message.includes("IPv4 ไม่ครบ") || message.includes("IPv4 ไม่ถูกต้อง")) {
            setIpv4AddressError("IPv4 is incomplete or invalid (must be in x.x.x.x format)");
            return true;
        }

        if (message.includes("Subnet Mask") || message.includes("IPv4 prefix")) {
            setSubnetMaskError(message);
            return true;
        }

        if (message.includes("overlap")) {
            setSubnetMaskError(message);
            return true;
        }

        return false;
    };

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
        const normalizedInputIp = ipv4Address.trim();
        if (normalizedInputIp && !isValidIpv4Address(normalizedInputIp)) {
            throw new Error("IPv4 Address is invalid (must be in x.x.x.x format)");
        }

        const normalizedCurrentMask = normalizeMaskForCompare(interfaceData.subnet_mask || "");
        const normalizedInputMask = subnetMask ? normalizeIpv4Mask(subnetMask) : "";
        const ipChanged =
            normalizedInputIp !== (interfaceData.ipv4_address || "") ||
            normalizedInputMask !== normalizedCurrentMask;

        if (ipChanged && normalizedInputIp && normalizedInputMask) {
            const overlap = findOverlappingInterface(ifName, normalizedInputIp, normalizedInputMask, allInterfaces);
            if (overlap) {
                throw new Error(`Network ${intToIpv4(getIpv4Range(normalizedInputIp, normalizedInputMask).start)} overlaps with ${overlap.interfaceName}`);
            }

            intents.push({ intent: "interface.set_ipv4", node_id: deviceId, params: { interface: ifName, ip: normalizedInputIp, mask: normalizedInputMask }, label: `${ifName}: Set IPv4 → ${normalizedInputIp}` });
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
        let intents: StagedIntent[] = [];
        try {
            intents = buildIntents();
        } catch (error: any) {
            if (applyInlineValidationError(error?.message || "")) {
                return;
            }
            showError(error?.message || "Invalid IPv4/Subnet Mask");
            return;
        }

        if (intents.length === 0) {
            showError("No changes — No intents to queue");
            return;
        }
        if (onStageIntent) {
            onStageIntent(intents);
            showSuccess(`Add ${intents.length} intents of ${interfaceData.name} to queue`);
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
            if (applyInlineValidationError(error?.message || "")) {
                return;
            }
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
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                    <TextField
                                        label="IPv4 Address"
                                        size="small"
                                        value={ipv4Address}
                                        error={Boolean(ipv4AddressError)}
                                        helperText={ipv4AddressError || undefined}
                                        onChange={(e) => {
                                            const nextValue = e.target.value;
                                            setIpv4Address(nextValue);
                                            if (!nextValue.trim() || isValidIpv4Address(nextValue.trim())) {
                                                setIpv4AddressError("");
                                            }
                                        }}
                                        onBlur={() => {
                                            const trimmed = ipv4Address.trim();
                                            if (!trimmed) {
                                                setIpv4AddressError("");
                                                return;
                                            }
                                            if (!isValidIpv4Address(trimmed)) {
                                                setIpv4AddressError("IPv4 is incomplete or invalid (must be in x.x.x.x format)");
                                            } else {
                                                setIpv4AddressError("");
                                            }
                                        }}
                                        fullWidth
                                    />
                                    <Box sx={{ height: 40, display: 'flex', alignItems: 'center' }}>
                                        <IPPicker
                                            onIpSelect={(ip) => setIpv4Address(ip)}
                                            disabled={isSaving}
                                        />
                                    </Box>
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
                                    error={Boolean(subnetMaskError)}
                                    helperText={subnetMaskError || undefined}
                                    onChange={(e) => {
                                        const nextValue = e.target.value;
                                        setSubnetMask(nextValue);
                                        if (!nextValue.trim()) {
                                            setSubnetMaskError("");
                                            return;
                                        }
                                        try {
                                            normalizeIpv4Mask(nextValue);
                                            setSubnetMaskError("");
                                        } catch {
                                            // Keep existing error state until blur or save.
                                        }
                                    }}
                                    onBlur={() => {
                                        if (!subnetMask.trim()) {
                                            setSubnetMaskError("");
                                            return;
                                        }
                                        try {
                                            setSubnetMask(normalizeIpv4Mask(subnetMask));
                                            setSubnetMaskError("");
                                        } catch (error: any) {
                                            setSubnetMaskError(error?.message || "Subnet Mask ไม่ถูกต้อง");
                                        }
                                    }}
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
