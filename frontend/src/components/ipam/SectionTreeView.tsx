"use client";

import { Section, Subnet } from "@/services/ipamService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFolder,
    faFolderOpen,
    faNetworkWired,
    faChevronRight,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState } from "react";

interface SectionTreeViewProps {
    sections: Section[];
    subnets: Subnet[];
    currentSectionId: string;
}

type TreeNode = {
    id: string;
    type: "section" | "subnet";
    name: string;
    description?: string | null;
    data: Section | Subnet;
    children: TreeNode[];
};

export default function SectionTreeView({
    sections,
    subnets,
    currentSectionId,
}: SectionTreeViewProps) {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
        new Set([currentSectionId])
    );

    // Build tree structure
    const buildTree = (): TreeNode[] => {
        const tree: TreeNode[] = [];

        // Add sub-sections
        const subSections = sections.filter(
            (s) => s.master_section === currentSectionId
        );
        subSections.forEach((section) => {
            tree.push({
                id: section.id,
                type: "section",
                name: section.name,
                description: section.description,
                data: section,
                children: [], // Could recursively build if needed
            });
        });

        // Add only parent subnets (subnets without master_subnet_id)
        const parentSubnets = subnets.filter((subnet) => {
            const subnetDetail = subnet as any;
            return !subnetDetail.master_subnet_id;
        });

        parentSubnets.forEach((subnet) => {
            tree.push({
                id: subnet.id,
                type: "subnet",
                name: `${subnet.subnet}/${subnet.mask}`,
                description: subnet.description,
                data: subnet,
                children: [],
            });
        });

        return tree;
    };

    const toggleNode = (nodeId: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const renderNode = (node: TreeNode, level: number = 0) => {
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children.length > 0;
        const paddingLeft = level * 24;

        if (node.type === "section") {
            const section = node.data as Section;
            return (
                <div key={node.id}>
                    <Link href={`/ipam/sections/${node.id}`}>
                        <div
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border-b border-gray-100"
                            style={{ paddingLeft: `${paddingLeft + 12}px` }}
                        >
                            {hasChildren && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleNode(node.id);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FontAwesomeIcon
                                        icon={isExpanded ? faChevronDown : faChevronRight}
                                        className="w-3 h-3"
                                    />
                                </button>
                            )}
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FontAwesomeIcon
                                    icon={isExpanded ? faFolderOpen : faFolder}
                                    className="w-5 h-5 text-primary-600"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                                        {node.name}
                                    </h3>
                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                        Section
                                    </span>
                                </div>
                                {node.description && (
                                    <p className="text-xs text-gray-600 truncate mt-0.5">
                                        {node.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Link>
                    {hasChildren && isExpanded && (
                        <div>{node.children.map((child) => renderNode(child, level + 1))}</div>
                    )}
                </div>
            );
        } else {
            // Subnet node
            const subnet = node.data as Subnet;
            return (
                <Link key={node.id} href={`/ipam/subnets/${node.id}`}>
                    <div
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border-b border-gray-100"
                        style={{ paddingLeft: `${paddingLeft + 12}px` }}
                    >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon
                                icon={faNetworkWired}
                                className="w-5 h-5 text-green-600"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    {node.name}
                                </h3>
                                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                                    Subnet
                                </span>
                            </div>
                            {node.description && (
                                <p className="text-xs text-gray-600 truncate mt-0.5">
                                    {node.description}
                                </p>
                            )}
                            {subnet.vlan_id && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    VLAN: {subnet.vlan_id}
                                </p>
                            )}
                        </div>
                    </div>
                </Link>
            );
        }
    };

    const tree = buildTree();

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {tree.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                    <FontAwesomeIcon
                        icon={faFolder}
                        className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    />
                    <p className="text-sm">No sub-sections or subnets found</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {tree.map((node) => renderNode(node, 0))}
                </div>
            )}
        </div>
    );
}
