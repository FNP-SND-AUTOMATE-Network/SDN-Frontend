"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrochip, faGlobe, faRoute, faClock } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { InterfaceDiscoveryResponse } from "@/services/deviceNetworkService";
import { intentService } from "@/services/intentService";
import { useSnackbar } from "@/hooks/useSnackbar";

type NetworkInterface = InterfaceDiscoveryResponse["interfaces"][0];

interface DeviceInterfaceFormProps {
    interfaceData: NetworkInterface;
    mode: "view" | "edit";
    deviceId: string;
    token: string | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function DeviceInterfaceForm({
    interfaceData,
    mode,
    deviceId,
    token,
    onSuccess,
    onCancel,
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

    const handleSave = async () => {
        if (!token) return;
        setIsSaving(true);
        try {
            // 1. Handle Admin Status (Enable / Disable)
            const currentAdminUp = interfaceData.admin_status?.toLowerCase() === "up";

            if (adminStatus && !currentAdminUp) {
                await intentService.executeIntent(token, {
                    intent: "interface.enable",
                    node_id: deviceId,
                    params: { interface: interfaceData.name }
                });
            } else if (!adminStatus && currentAdminUp) {
                await intentService.executeIntent(token, {
                    intent: "interface.disable",
                    node_id: deviceId,
                    params: { interface: interfaceData.name }
                });
            }

            // 2. Handle IP (interface.set_ipv4)
            const ipChanged = ipv4Address !== (interfaceData.ipv4_address || "") || subnetMask !== (interfaceData.subnet_mask || "");
            if (ipChanged) {
                if (ipv4Address && subnetMask) {
                    await intentService.executeIntent(token, {
                        intent: "interface.set_ipv4",
                        node_id: deviceId,
                        params: {
                            interface: interfaceData.name,
                            ip: ipv4Address,
                            mask: subnetMask
                        }
                    });
                }
            }

            // 3. Handle Description (interface.set_description)
            const descChanged = description !== (interfaceData.description || "");
            if (descChanged) {
                await intentService.executeIntent(token, {
                    intent: "interface.set_description",
                    node_id: deviceId,
                    params: {
                        interface: interfaceData.name,
                        description: description
                    }
                });
            }

            // 4. Handle MTU (interface.set_mtu)
            const mtuChanged = mtu !== (interfaceData.mtu || "");
            if (mtuChanged && mtu) {
                await intentService.executeIntent(token, {
                    intent: "interface.set_mtu",
                    node_id: deviceId,
                    params: {
                        interface: interfaceData.name,
                        mtu: parseInt(mtu.toString(), 10)
                    }
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

                await intentService.executeIntent(token, {
                    intent: "interface.set_ipv6",
                    node_id: deviceId,
                    params: {
                        interface: interfaceData.name,
                        ip: ip,
                        prefix: prefix
                    }
                });
            }

            // 6. Handle OSPF Routing
            const oldProcessId = interfaceData.ospf?.process_id?.toString() || "";
            const oldArea = interfaceData.ospf?.area?.toString() || "";
            const newProcessId = ospfProcessId.trim();
            const newArea = ospfArea.trim();

            if (newProcessId !== oldProcessId || newArea !== oldArea) {
                if (newProcessId && newArea) {
                    await intentService.executeIntent(token, {
                        intent: "routing.ospf.add_network_interface",
                        node_id: deviceId,
                        params: {
                            process_id: parseInt(newProcessId, 10),
                            interface: interfaceData.name,
                            area: parseInt(newArea, 10)
                        }
                    });
                } else if (!newProcessId && !newArea && oldProcessId && oldArea) {
                    await intentService.executeIntent(token, {
                        intent: "routing.ospf.remove_network_interface",
                        node_id: deviceId,
                        params: {
                            process_id: parseInt(oldProcessId, 10),
                            interface: interfaceData.name,
                            area: parseInt(oldArea, 10)
                        }
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
        <div className="flex flex-col h-full">
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
                {(interfaceData.has_ospf || isEdit) && (
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
                        <FontAwesomeIcon icon={faClock} className="text-gray-400 w-4 h-4" /> Last Change
                    </h3>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-900">
                            {interfaceData.last_change ? new Date(interfaceData.last_change).toLocaleString() : "-"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                    {isEdit ? "Cancel" : "Close"}
                </Button>
                {isEdit && (
                    <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                        Save Changes
                    </Button>
                )}
            </div>
        </div>
    );
}
