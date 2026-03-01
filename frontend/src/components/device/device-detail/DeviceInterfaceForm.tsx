"use client";

import { useState, useEffect } from "react";
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
} from "@mui/icons-material";
import { InterfaceDiscoveryResponse } from "@/services/deviceNetworkService";
import { fetchClient } from "@/lib/apiv2/fetch";
import { useSnackbar } from "@/hooks/useSnackbar";

type NetworkInterface = InterfaceDiscoveryResponse["interfaces"][0];

interface DeviceInterfaceFormProps {
    interfaceData: NetworkInterface;
    mode: "view" | "edit";
    deviceId: string;
    onSuccess: () => void;
    onCancel: () => void;
    hideFooter?: boolean;
    onSaveRef?: React.MutableRefObject<(() => Promise<void>) | null>;
}

// --- Helper: Section Header ---
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ pb: 1, mb: 2, borderBottom: 1, borderColor: "divider" }}
        >
            {icon}
            <Typography variant="subtitle2" fontWeight={600}>
                {title}
            </Typography>
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
}: DeviceInterfaceFormProps) {
    const { showSuccess, showError } = useSnackbar();

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

    useEffect(() => {
        if (interfaceData) {
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
    }, [interfaceData]);

    // Helper to execute an intent via fetchClient
    const executeIntent = async (intent: string, params: Record<string, any>) => {
        const { error } = await fetchClient.POST("/api/v1/nbi/intents", {
            body: {
                intent,
                node_id: deviceId,
                params,
            },
        });
        if (error) {
            throw new Error((error as any)?.message || `Failed to execute intent: ${intent}`);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Handle Admin Status (Enable / Disable)
            const currentAdminUp = interfaceData.admin_status?.toLowerCase() === "up";

            if (adminStatus && !currentAdminUp) {
                await executeIntent("interface.enable", { interface: interfaceData.name });
            } else if (!adminStatus && currentAdminUp) {
                await executeIntent("interface.disable", { interface: interfaceData.name });
            }

            // 2. Handle IP (interface.set_ipv4)
            const ipChanged = ipv4Address !== (interfaceData.ipv4_address || "") || subnetMask !== (interfaceData.subnet_mask || "");
            if (ipChanged && ipv4Address && subnetMask) {
                await executeIntent("interface.set_ipv4", {
                    interface: interfaceData.name,
                    ip: ipv4Address,
                    mask: subnetMask,
                });
            }

            // 3. Handle Description (interface.set_description)
            const descChanged = description !== (interfaceData.description || "");
            if (descChanged) {
                await executeIntent("interface.set_description", {
                    interface: interfaceData.name,
                    description,
                });
            }

            // 4. Handle MTU (interface.set_mtu)
            const mtuChanged = mtu !== (interfaceData.mtu || "");
            if (mtuChanged && mtu) {
                await executeIntent("interface.set_mtu", {
                    interface: interfaceData.name,
                    mtu: parseInt(mtu.toString(), 10),
                });
            }

            // 5. Handle IPv6 (interface.set_ipv6)
            const ipv6Changed = ipv6Address !== (interfaceData.ipv6 || "");
            if (ipv6Changed && ipv6Address) {
                let ip = ipv6Address;
                let prefix = "64";
                if (ipv6Address.includes("/")) {
                    const parts = ipv6Address.split("/");
                    ip = parts[0];
                    prefix = parts[1];
                }

                await executeIntent("interface.set_ipv6", {
                    interface: interfaceData.name,
                    ip,
                    prefix,
                });
            }

            // 6. Handle OSPF Routing
            const oldProcessId = interfaceData.ospf?.process_id?.toString() || "";
            const oldArea = interfaceData.ospf?.area?.toString() || "";
            const newProcessId = ospfProcessId.trim();
            const newArea = ospfArea.trim();

            if (newProcessId !== oldProcessId || newArea !== oldArea) {
                if (newProcessId && newArea) {
                    await executeIntent("routing.ospf.add_network_interface", {
                        process_id: parseInt(newProcessId, 10),
                        interface: interfaceData.name,
                        area: parseInt(newArea, 10),
                    });
                } else if (!newProcessId && !newArea && oldProcessId && oldArea) {
                    await executeIntent("routing.ospf.remove_network_interface", {
                        process_id: parseInt(oldProcessId, 10),
                        interface: interfaceData.name,
                        area: parseInt(oldArea, 10),
                    });
                }
            }

            showSuccess(`Interface ${interfaceData.name} updated successfully`);
            onSuccess();
        } catch (error: any) {
            console.error("❌ [handleSave] ERROR:", error);
            showError(`Failed to save config: ${error?.message || "Unknown error"}`);
        } finally {
            setIsSaving(false);
        }
    };

    const isUp = interfaceData.oper_status?.toLowerCase() === "up";
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
                        />
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                                gap: 2.5,
                            }}
                        >
                            {/* Operational Status */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: "block" }}>
                                    Operational Status
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Box
                                        sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            bgcolor: isUp ? "success.main" : "error.main",
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        fontWeight={500}
                                        color={isUp ? "success.dark" : "error.dark"}
                                    >
                                        {interfaceData.oper_status?.toUpperCase() || "UNKNOWN"}
                                    </Typography>
                                </Stack>
                            </Box>

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

                            {/* Duplex */}
                            {isEdit ? (
                                <TextField
                                    label="Duplex"
                                    size="small"
                                    value={duplex}
                                    onChange={(e) => setDuplex(e.target.value)}
                                    fullWidth
                                />
                            ) : (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: "block" }}>
                                        Duplex
                                    </Typography>
                                    <Typography variant="body2">{duplex || "-"}</Typography>
                                </Box>
                            )}

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
                                <TextField
                                    label="IPv4 Address"
                                    size="small"
                                    value={ipv4Address}
                                    onChange={(e) => setIpv4Address(e.target.value)}
                                    fullWidth
                                />
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
                            {interfaceData.last_change
                                ? new Date(interfaceData.last_change).toLocaleString()
                                : "-"}
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* Footer */}
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
        </Box>
    );
}
