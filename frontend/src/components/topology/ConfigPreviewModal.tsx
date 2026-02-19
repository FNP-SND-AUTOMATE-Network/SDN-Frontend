"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCircle } from "@fortawesome/free-solid-svg-icons";
import { DeviceNetwork } from "@/services/deviceNetworkService";

interface ConfigPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    device: DeviceNetwork | null;
}

export default function ConfigPreviewModal({
    isOpen,
    onClose,
    device,
}: ConfigPreviewModalProps) {
    if (!isOpen || !device) return null;

    // Sample config - in real app, fetch from API
    // const sampleConfig

    const getStatusBadge = () => {
        const isOnline = device.status === "ONLINE";
        return (
            <span className={`inline-flex items-center gap-1 ${isOnline ? "text-green-600" : "text-gray-500"}`}>
                <FontAwesomeIcon icon={faCircle} className="w-2 h-2" />
                {isOnline ? "Online" : "Offline"}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative bg-white rounded-lg shadow-xl  w-full max-w-4xl  ">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Preview Configuration
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Device Info */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Device:</span>
                                <span className="ml-2 font-medium text-gray-900">{device.device_name}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">IP mgmt:</span>
                                <span className="ml-2 font-medium text-gray-900">{device.ip_address || "-"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Status:</span>
                                <span className="ml-2">{getStatusBadge()}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">OS:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                    {device.operatingSystem?.os_type || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Config Preview */}
                    <div className="p-6">
                        <div className="border-2 border-blue-400 rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-4 py-2 border-b border-blue-400">
                                <span className="text-sm font-medium text-gray-700">
                                    Configuration Preview (Read-only)
                                </span>
                            </div>
                            <div className="bg-white min-h-[400px] max-h-[500px] overflow-y-auto">
                                {/* TODO: ดึง config จาก API endpoint */}
                                <div className="p-4 text-sm text-gray-500 italic">
                                    Configuration data will be loaded from API...
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
