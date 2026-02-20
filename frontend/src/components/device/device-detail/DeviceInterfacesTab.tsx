"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { DeviceNetwork, deviceNetworkService, InterfaceDiscoveryResponse } from "@/services/deviceNetworkService";
import { useSnackbar } from "@/hooks/useSnackbar";

interface DeviceInterfacesTabProps {
    device: DeviceNetwork;
    token: string | null;
}

type NetworkInterface = InterfaceDiscoveryResponse["interfaces"][0];

export function DeviceInterfacesTab({ device, token }: DeviceInterfacesTabProps) {
    const { showError } = useSnackbar();
    const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInterfaces = async () => {
            if (!token) return;

            if (!device.node_id) {
                setIsLoading(false);
                setError("Device does not have a valid Node ID. Please mount the device to ODL first.");
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await deviceNetworkService.discoverInterfaces(token, device.node_id);
                setInterfaces(response.interfaces || []);
            } catch (err: any) {
                const message = err?.message || "Failed to discover interfaces";
                setError(message);
                showError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInterfaces();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [device.node_id, token]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-sm text-gray-500 font-sf-pro-text animate-pulse">
                    Discovering interfaces from device...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-sm text-red-600 font-sf-pro-text text-center">
                    <p className="mb-2 font-medium">Error discovering interfaces</p>
                    <p className="text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    if (interfaces.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-sm text-gray-500 font-sf-pro-text">
                    No interfaces found on this device.
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 font-semibold">Interface name</th>
                        <th className="px-6 py-4 font-semibold">IP Address</th>
                        <th className="px-6 py-4 font-semibold">Subnet Mask</th>
                        <th className="px-6 py-4 font-semibold">Description</th>
                        <th className="px-6 py-4 text-center w-16">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {interfaces.map((iface, index) => (
                        <tr key={`${iface.name}-${index}`} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4 font-medium text-gray-900">
                                <div className="flex items-center gap-2">
                                    {iface.name}
                                    {!iface.admin_status || iface.admin_status.toLowerCase() !== "up" ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800">
                                            Down
                                        </span>
                                    ) : null}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{iface.ipv4_address || "-"}</td>
                            <td className="px-6 py-4 text-gray-600">{iface.subnet_mask || "-"}</td>
                            <td className="px-6 py-4 text-gray-500 italic max-w-xs truncate">
                                {iface.description || "-"}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button
                                    type="button"
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                                    onClick={() => console.log("Action menu clicked for", iface.name)}
                                >
                                    <FontAwesomeIcon icon={faEllipsisVertical} className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
