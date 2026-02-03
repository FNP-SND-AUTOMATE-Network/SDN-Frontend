"use client";

import React, { useState, useEffect } from "react";
import { Subnet, ipamService } from "@/services/ipamService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faNetworkWired,
    faChevronDown,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface SubnetsTableProps {
    subnets: Subnet[];
    onRefresh: () => void;
}

export default function SubnetsTable({
    subnets,
    onRefresh,
}: SubnetsTableProps) {
    const { token } = useAuth();
    const [expandedSubnets, setExpandedSubnets] = useState<Set<string>>(
        new Set()
    );
    const [childSubnets, setChildSubnets] = useState<Record<string, Subnet[]>>(
        {}
    );
    const [loadingChildren, setLoadingChildren] = useState<Set<string>>(
        new Set()
    );

    const toggleExpand = async (subnetId: string) => {
        const newExpanded = new Set(expandedSubnets);

        if (newExpanded.has(subnetId)) {
            // Collapse
            newExpanded.delete(subnetId);
            setExpandedSubnets(newExpanded);
        } else {
            // Expand - fetch children if not already loaded
            newExpanded.add(subnetId);
            setExpandedSubnets(newExpanded);

            if (!childSubnets[subnetId] && token) {
                // Fetch child subnets
                setLoadingChildren(new Set(loadingChildren).add(subnetId));
                try {
                    const response = await ipamService.getSubnetChildren(token, subnetId);
                    setChildSubnets({
                        ...childSubnets,
                        [subnetId]: response.subnets,
                    });
                } catch (error) {
                    console.error("Error fetching child subnets:", error);
                    setChildSubnets({
                        ...childSubnets,
                        [subnetId]: [],
                    });
                } finally {
                    const newLoading = new Set(loadingChildren);
                    newLoading.delete(subnetId);
                    setLoadingChildren(newLoading);
                }
            }
        }
    };

    const renderSubnetRow = (subnet: Subnet, level: number = 0): React.ReactElement => {
        const isExpanded = expandedSubnets.has(subnet.id);
        const children = childSubnets[subnet.id] || [];
        const isLoading = loadingChildren.has(subnet.id);
        const hasChildren = children.length > 0;
        const hasBeenFetched = childSubnets.hasOwnProperty(subnet.id);
        const paddingLeft = level * 24;

        return (
            <React.Fragment key={subnet.id}>
                <tr key={subnet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4" style={{ paddingLeft: `${paddingLeft + 24}px` }}>
                        {isLoading || hasChildren || !hasBeenFetched ? (
                            <button
                                onClick={() => toggleExpand(subnet.id)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
                                ) : (
                                    <FontAwesomeIcon
                                        icon={isExpanded ? faChevronDown : faChevronRight}
                                        className="w-4 h-4"
                                    />
                                )}
                            </button>
                        ) : (
                            <div className="w-4 h-4"></div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                            href={`/ipam/subnets/${subnet.id}`}
                            className="text-sm font-medium text-primary-600 hover:text-primary-800"
                        >
                            {subnet.subnet}
                        </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">/{subnet.mask}</span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                            {subnet.description || "-"}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {subnet.vlan_id ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                VLAN {subnet.vlan_id}
                            </span>
                        ) : (
                            <span className="text-sm text-gray-400">-</span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Link
                            href={`/ipam/subnets/${subnet.id}`}
                            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                        >
                            View Details
                        </Link>
                    </td>
                </tr>
                {/* Render child subnets */}
                {isExpanded &&
                    children.map((childSubnet) =>
                        renderSubnetRow(childSubnet, level + 1)
                    )}
            </React.Fragment>
        );
    };

    return (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                {/* Expand icon */}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subnet
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Mask
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                VLAN
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {subnets.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-8 text-center text-gray-500"
                                >
                                    <FontAwesomeIcon
                                        icon={faNetworkWired}
                                        className="w-12 h-12 mx-auto mb-3 text-gray-300"
                                    />
                                    <p>No subnets found</p>
                                </td>
                            </tr>
                        ) : (
                            subnets.map((subnet) => renderSubnetRow(subnet, 0))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
