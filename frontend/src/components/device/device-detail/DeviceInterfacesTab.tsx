"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical, faEye, faEdit } from "@fortawesome/free-solid-svg-icons";
import { DeviceNetwork, deviceNetworkService, InterfaceDiscoveryResponse } from "@/services/deviceNetworkService";
import { useSnackbar } from "@/hooks/useSnackbar";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { DeviceInterfaceModal } from "./DeviceInterfaceModal";

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

    // Modal state
    const [selectedInterface, setSelectedInterface] = useState<NetworkInterface | null>(null);
    const [modalMode, setModalMode] = useState<"view" | "edit">("view");
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    useEffect(() => {
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
                        <th className="px-6 py-4 font-semibold w-16 text-center">Status</th>
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
                            <td className="px-6 py-4 text-center">
                                <div className="flex justify-center">
                                    <span
                                        className={`w-2 h-2 rounded-full ${iface.oper_status && iface.oper_status.toLowerCase() === "up" ? "bg-green-500" : "bg-red-500"}`}
                                        title={iface.oper_status ? iface.oper_status.toUpperCase() : "DOWN"}
                                    ></span>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                                <div className="flex items-center gap-2">
                                    {iface.name}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{iface.ipv4_address || "-"}</td>
                            <td className="px-6 py-4 text-gray-600">{iface.subnet_mask || "-"}</td>
                            <td className="px-6 py-4 text-gray-500 italic max-w-xs truncate">
                                {iface.description || "-"}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <Menu as="div" className="relative inline-block text-left">
                                    <Menu.Button className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors focus:outline-none">
                                        <FontAwesomeIcon icon={faEllipsisVertical} className="w-4 h-4" />
                                    </Menu.Button>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                            <div className="px-1 py-1 ">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedInterface(iface);
                                                                setModalMode("view");
                                                                setIsModalOpen(true);
                                                            }}
                                                            className={`${active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'} group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                                                        >
                                                            <FontAwesomeIcon icon={faEye} className="w-4 h-4 mr-2" />
                                                            View config
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedInterface(iface);
                                                                setModalMode("edit");
                                                                setIsModalOpen(true);
                                                            }}
                                                            className={`${active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'} group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors mt-1`}
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} className="w-4 h-4 mr-2" />
                                                            Edit config
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal */}
            <DeviceInterfaceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                interfaceData={selectedInterface}
                mode={modalMode}
                deviceId={device.node_id || ""}
                token={token}
                onSuccess={fetchInterfaces}
            />
        </div>
    );
}
