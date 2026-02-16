"use client";

import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCog,
    faDatabase,
    faCircle,
    faEllipsisVertical,
    faFile,
} from "@fortawesome/free-solid-svg-icons";
import {
    Router as RouterIcon,
    Shield,
    Wifi,
    Box,
    Server,
} from "lucide-react";
import { DeviceNetwork, TypeDevice, StatusDevice } from "@/services/deviceNetworkService";
import ConfigPreviewModal from "./ConfigPreviewModal";
import TopologyConfigModal from "./TopologyConfigModal";

interface TopologyDeviceTableProps {
    devices: DeviceNetwork[];
    selectedDeviceId?: string | null;
    onDeviceSelect?: (deviceId: string) => void;
}

export default function TopologyDeviceTable({
    devices,
    selectedDeviceId,
    onDeviceSelect,
}: TopologyDeviceTableProps) {
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [configModalDevice, setConfigModalDevice] = useState<DeviceNetwork | null>(null);
    const [configEditorDevice, setConfigEditorDevice] = useState<DeviceNetwork | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = (deviceId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenDropdownId(openDropdownId === deviceId ? null : deviceId);
    };

    const getTypeBadge = (type: string) => {
        const base =
            "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded whitespace-nowrap font-sf-pro-text";
        switch (type) {
            case "SWITCH":
                return `${base} bg-blue-50 text-blue-700`;
            case "ROUTER":
                return `${base} bg-purple-50 text-purple-700`;
            case "FIREWALL":
                return `${base} bg-red-50 text-red-700`;
            case "ACCESS_POINT":
                return `${base} bg-indigo-50 text-indigo-700`;
            default:
                return `${base} bg-gray-50 text-gray-700`;
        }
    };

    const getTypeIcon = (type: string) => {
        const iconClass = "w-4 h-4";
        switch (type) {
            case "SWITCH":
                return <Server className={iconClass} />;
            case "ROUTER":
                return <RouterIcon className={iconClass} />;
            case "FIREWALL":
                return <Shield className={iconClass} />;
            case "ACCESS_POINT":
                return <Wifi className={iconClass} />;
            default:
                return <Box className={iconClass} />;
        }
    };

    const getStatusBadge = (status: StatusDevice) => {
        const badges: Record<StatusDevice, { label: string; className: string }> = {
            ONLINE: {
                label: "Online",
                className: "bg-green-100 text-green-800",
            },
            OFFLINE: {
                label: "Offline",
                className: "bg-gray-100 text-gray-800",
            },
            MAINTENANCE: {
                label: "Maintenance",
                className: "bg-yellow-100 text-yellow-800",
            },
            OTHER: {
                label: "Other",
                className: "bg-blue-100 text-blue-800",
            },
        };

        const badge = badges[status] || badges.OTHER;
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
            >
                <FontAwesomeIcon icon={faCircle} className="w-2 h-2" />
                {badge.label}
            </span>
        );
    };

    if (devices.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-gray-500 text-sm">No devices to display</p>
            </div>
        );
    }

    return (
        <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Device</h3>
                </div>

                <div className="overflow-x-auto overflow-y-visible">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    IP Management
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">

                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {devices.map((device) => {
                                const isSelected = selectedDeviceId === device.id;
                                return (
                                    <tr
                                        key={device.id}
                                        className={`cursor-pointer transition-colors ${isSelected
                                            ? "bg-primary-50"
                                            : "hover:bg-gray-50"
                                            }`}
                                        onClick={() => onDeviceSelect?.(device.id)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {device.device_name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {device.device_model}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <span className={getTypeBadge(device.type)}>
                                                    <span>{getTypeIcon(device.type)}</span>
                                                    {device.type.replace("_", " ")}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {device.ip_address || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(device.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="relative inline-block" ref={openDropdownId === device.id ? dropdownRef : null}>
                                                {/* Ellipsis Button */}
                                                <button
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                                    onClick={(e) => toggleDropdown(device.id, e)}
                                                    title="Actions"
                                                >
                                                    <FontAwesomeIcon icon={faEllipsisVertical} className="w-4 h-4" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {openDropdownId === device.id && (
                                                    <div className="fixed transform -translate-x-full -translate-y-1/2 ml-[-8px] w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[100]" style={{ top: 'auto', left: 'auto' }}>
                                                        <button
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenDropdownId(null);
                                                                setConfigEditorDevice(device);
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faCog} className="w-4 h-4 text-green-600" />
                                                            Config
                                                        </button>
                                                        <button
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenDropdownId(null);
                                                                setConfigModalDevice(device);
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faFile} className="w-4 h-4 text-blue-600" />
                                                            View Config
                                                        </button>
                                                        <button
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenDropdownId(null);
                                                                // TODO: Implement backup
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faDatabase} className="w-4 h-4 text-orange-600" />
                                                            Backup
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Config Preview Modal */}
            <ConfigPreviewModal
                isOpen={!!configModalDevice}
                onClose={() => setConfigModalDevice(null)}
                device={configModalDevice}
            />

            {/* Config Editor Modal */}
            <TopologyConfigModal
                isOpen={!!configEditorDevice}
                onClose={() => setConfigEditorDevice(null)}
                device={configEditorDevice}
            />
        </div>
    );
}
