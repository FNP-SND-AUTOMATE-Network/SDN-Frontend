"use client";

import { IPAddress } from "@/services/ipamService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faServer,
    faCircle,
    faEdit,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";

interface IPAddressesTableProps {
    addresses: IPAddress[];
    onRefresh: () => void;
    onEdit?: (address: IPAddress) => void;
    onDelete?: (address: IPAddress) => void;
}

export default function IPAddressesTable({
    addresses,
    onRefresh,
    onEdit,
    onDelete,
}: IPAddressesTableProps) {
    // Helper function to get status badge
    const getStatusBadge = (address: IPAddress) => {
        // Check if is_gateway
        const isGateway = (address as any).is_gateway === "1" || (address as any).is_gateway === 1;
        if (isGateway) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <FontAwesomeIcon icon={faCircle} className="w-2 h-2" />
                    Gateway
                </span>
            );
        }

        // Simple logic: if has hostname or description, it's "Used", otherwise "Free"
        const isUsed = address.hostname || address.description;

        if (isUsed) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <FontAwesomeIcon icon={faCircle} className="w-2 h-2" />
                    Used
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <FontAwesomeIcon icon={faCircle} className="w-2 h-2" />
                Free
            </span>
        );
    };

    return (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                IP Address
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hostname
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                MAC Address
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {addresses.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-8 text-center text-gray-500"
                                >
                                    <FontAwesomeIcon
                                        icon={faServer}
                                        className="w-12 h-12 text-gray-300 mx-auto mb-3"
                                    />
                                    <p className="text-sm">No IP addresses found</p>
                                </td>
                            </tr>
                        ) : (
                            addresses.map((address) => {
                                const isGateway = (address as any).is_gateway === "1" || (address as any).is_gateway === 1;
                                return (
                                    <tr
                                        key={address.id}
                                        className={`group ${isGateway ? 'bg-purple-50 hover:bg-purple-100' : 'hover:bg-gray-50'}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center mr-3 ${isGateway ? 'bg-purple-200' : 'bg-primary-100'}`}>
                                                    <FontAwesomeIcon
                                                        icon={faServer}
                                                        className={`w-4 h-4 ${isGateway ? 'text-purple-700' : 'text-primary-600'}`}
                                                    />
                                                </div>
                                                <div>
                                                    <span className={`text-sm font-medium ${isGateway ? 'text-purple-900' : 'text-gray-900'}`}>
                                                        {(address as any).ip}
                                                    </span>
                                                    {isGateway && (
                                                        <span className="ml-2 text-xs text-purple-600 font-semibold">★ GATEWAY</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {address.hostname || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                                {address.description || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600 font-mono">
                                                {address.mac || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(address)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(address)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Edit IP Address"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(address)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete IP Address"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {!onEdit && !onDelete && (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination placeholder */}
            {addresses.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">{addresses.length}</span> IP
                            address{addresses.length !== 1 ? "es" : ""}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

