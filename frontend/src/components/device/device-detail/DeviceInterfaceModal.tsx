"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faNetworkWired, faMicrochip, faGlobe, faRoute, faClock } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { InterfaceDiscoveryResponse } from "@/services/deviceNetworkService";
import { intentService } from "@/services/intentService";
import { useSnackbar } from "@/hooks/useSnackbar";

type NetworkInterface = InterfaceDiscoveryResponse["interfaces"][0];

interface DeviceInterfaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    interfaceData: NetworkInterface | null;
    mode: "view" | "edit";
    deviceId: string;
    token: string | null;
    onSuccess: () => void;
}

export function DeviceInterfaceModal({
    isOpen,
    onClose,
    interfaceData,
    mode,
    deviceId,
    token,
    onSuccess,
}: DeviceInterfaceModalProps) {
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
        if (isOpen && interfaceData) {
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
    }, [isOpen, interfaceData]);

    if (!isOpen || !interfaceData) return null;

    const handleSave = async () => {
        console.log("🔥 [handleSave] TRIGGERED. Token:", !!token, "DeviceId:", deviceId);
        if (!token) return;
        setIsSaving(true);
        try {
            // 1. Handle Admin Status (Enable / Disable)
            const currentAdminUp = interfaceData.admin_status?.toLowerCase() === "up";
            console.log(`➡️ [Admin Status] Current: ${currentAdminUp} | Desired: ${adminStatus}`);

            if (adminStatus && !currentAdminUp) {
                console.log(`🚀 [INTENT] Sending interface.enable for ${interfaceData.name}`);
                await intentService.executeIntent(token, {
                    intent: "interface.enable",
                    node_id: deviceId,
                    params: { interface: interfaceData.name }
                });
            } else if (!adminStatus && currentAdminUp) {
                console.log(`🚀 [INTENT] Sending interface.disable for ${interfaceData.name}`);
                await intentService.executeIntent(token, {
                    intent: "interface.disable",
                    node_id: deviceId,
                    params: { interface: interfaceData.name }
                });
            }

            // 2. Handle IP & Description (interface.set_ipv4)
            const ipChanged = ipv4Address !== (interfaceData.ipv4_address || "") || subnetMask !== (interfaceData.subnet_mask || "");
            const descChanged = description !== (interfaceData.description || "");

            console.log(`➡️ [Changes detected] IP Changed: ${ipChanged} | Desc Changed: ${descChanged}`);
            console.log(`➡️ [Payload Prep] IP: ${ipv4Address}, Mask: ${subnetMask}, Desc: ${description}`);

            if (ipChanged || descChanged) {
                if (ipv4Address && subnetMask) {
                    console.log(`🚀 [INTENT] Sending interface.set_ipv4 for ${interfaceData.name}`);
                    const payload = {
                        intent: "interface.set_ipv4",
                        node_id: deviceId,
                        params: {
                            interface: interfaceData.name,
                            ip: ipv4Address,
                            mask: subnetMask,
                            description: description || undefined
                        }
                    };
                    console.log(`📦 [Payload]`, JSON.stringify(payload, null, 2));

                    await intentService.executeIntent(token, payload);
                } else if (descChanged && !ipChanged) {
                    // Only description changed
                    console.log(`🚀 [INTENT] Sending interface.set_description for ${interfaceData.name}`);
                    const payload = {
                        intent: "interface.set_description",
                        node_id: deviceId,
                        params: {
                            interface: interfaceData.name,
                            description: description
                        }
                    };
                    console.log(`📦 [Payload]`, JSON.stringify(payload, null, 2));

                    await intentService.executeIntent(token, payload);
                } else {
                    console.log("⚠️ [WARNING] IP changed but either IP or Subnet Mask is empty! Skipping set_ipv4 intent.");
                }
            } else {
                console.log("✅ [INFO] No IP or Description changes detected.");
            }

            console.log("🎉 [handleSave] SUCCESSFULLY COMPLETED");
            showSuccess(`Interface ${interfaceData.name} updated successfully`);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("❌ [handleSave] ERROR:", error);
            showError(`Failed to save config: ${error?.message || "Unknown error"}`);
        } finally {
            console.log("🏁 [handleSave] FINALLY BLOCK EXECUTED");
            setIsSaving(false);
        }
    };

    const isUp = interfaceData.oper_status?.toLowerCase() === "up";
    const isEdit = mode === "edit";

    const renderField = (label: string, value: string | number, readonly: boolean = false, onChange?: (val: string) => void) => {
        if (!isEdit || readonly) {
            return (
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium mb-1">{label}</span>
                    <span className="text-sm text-gray-900 font-sf-pro-text">{value || "-"}</span>
                </div>
            );
        }
        return (
            <div className="flex flex-col">
                <label className="text-xs text-gray-700 font-medium mb-1">{label}</label>
                <Input
                    value={value?.toString() || ""}
                    onChange={(e) => onChange?.(e.target.value)}
                    className="h-8 text-sm"
                />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isEdit ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                            <FontAwesomeIcon icon={faNetworkWired} className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-sf-pro-display font-semibold text-gray-900">
                                {isEdit ? "Edit Interface:" : "View Interface:"} {interfaceData.name}
                            </h2>
                            <p className="text-sm text-gray-500 font-sf-pro-text">
                                {interfaceData.type} - {interfaceData.mac_address}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto font-sf-pro-text space-y-8 flex-1">

                    {/* Section 1: Hardware & Status */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                            <FontAwesomeIcon icon={faMicrochip} className="text-gray-400 w-4 h-4" /> Hardware & Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-medium mb-2">Operational Status</span>
                                <div className="flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${isUp ? "bg-green-500" : "bg-red-500"}`}></span>
                                    <span className={`text-sm font-medium ${isUp ? "text-green-700" : "text-red-700"}`}>
                                        {interfaceData.oper_status?.toUpperCase() || "UNKNOWN"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-medium mb-2">Admin Status</span>
                                {isEdit ? (
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={adminStatus} onChange={() => setAdminStatus(!adminStatus)} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-700">{adminStatus ? "UP" : "DOWN"}</span>
                                    </label>
                                ) : (
                                    <span className="text-sm text-gray-900 font-sf-pro-text">{interfaceData.admin_status?.toUpperCase()}</span>
                                )}
                            </div>

                            {renderField("Description", description, false, setDescription)}
                            {renderField("MAC Address", interfaceData.mac_address, true)}
                            {renderField("Duplex", duplex, false, setDuplex)}

                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-medium mb-2">Auto Negotiate</span>
                                {isEdit ? (
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={autoNegotiate} onChange={() => setAutoNegotiate(!autoNegotiate)} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-700">{autoNegotiate ? "ON" : "OFF"}</span>
                                    </label>
                                ) : (
                                    <span className="text-sm text-gray-900 font-sf-pro-text">{interfaceData.auto_negotiate ? "ON" : "OFF"}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: IP Configuration */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                            <FontAwesomeIcon icon={faGlobe} className="text-gray-400 w-4 h-4" /> IP Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderField("IPv4 Address", ipv4Address, false, setIpv4Address)}
                            {renderField("Subnet Mask (or Prefix)", subnetMask, false, setSubnetMask)}
                            {renderField("IPv6 Address", ipv6Address, false, setIpv6Address)}
                            {renderField("MTU", mtu, false, setMtu)}
                        </div>
                    </div>

                    {/* Section 3: Routing (Optional) */}
                    {interfaceData.has_ospf && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                                <FontAwesomeIcon icon={faRoute} className="text-gray-400 w-4 h-4" /> OSPF Routing
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {renderField("Process ID", ospfProcessId, false, setOspfProcessId)}
                                {renderField("Area", ospfArea, false, setOspfArea)}
                            </div>
                        </div>
                    )}

                    {/* Section 4: Metadata */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b pb-2">
                            <FontAwesomeIcon icon={faClock} className="text-gray-400 w-4 h-4" /> Metadata
                        </h3>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-medium mb-1">Last Change</span>
                            <span className="text-sm text-gray-900">
                                {interfaceData.last_change ? new Date(interfaceData.last_change).toLocaleString() : "-"}
                            </span>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        {isEdit ? "Cancel" : "Close"}
                    </Button>
                    {isEdit && (
                        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                            Save Changes
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
