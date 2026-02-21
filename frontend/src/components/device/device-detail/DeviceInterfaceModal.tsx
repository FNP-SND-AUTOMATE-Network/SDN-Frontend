"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faNetworkWired } from "@fortawesome/free-solid-svg-icons";
import { InterfaceDiscoveryResponse } from "@/services/deviceNetworkService";
import { DeviceInterfaceForm } from "./DeviceInterfaceForm";

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
    if (!isOpen || !interfaceData) return null;

    const isEdit = mode === "edit";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
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

                {/* Content (Form) */}
                <div className="flex-1 overflow-y-auto">
                    <DeviceInterfaceForm
                        interfaceData={interfaceData}
                        mode={mode}
                        deviceId={deviceId}
                        token={token}
                        onSuccess={() => {
                            onSuccess();
                            onClose();
                        }}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    );
}
