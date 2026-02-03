"use client";

import React, { useState, useEffect } from "react";
import { Section, Subnet, ipamService } from "@/services/ipamService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFolder,
    faFolderOpen,
    faNetworkWired,
    faChevronRight,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/contexts/AuthContext";

interface IPAMTreeSidebarProps {
    sections: Section[];
    subnets: Subnet[];
    currentSectionId: string;
    selectedId: string;
    selectedType: "section" | "subnet";
    onSelectSection: (sectionId: string) => void;
    onSelectSubnet: (subnetId: string) => void;
}

type TreeNode = {
    id: string;
    type: "section" | "subnet";
    name: string;
    description?: string | null;
    data: Section | Subnet;
    children: TreeNode[];
};

export default function IPAMTreeSidebar({
    sections,
    subnets,
    currentSectionId,
    selectedId,
    selectedType,
    onSelectSection,
    onSelectSubnet,
}: IPAMTreeSidebarProps) {
    const { token } = useAuth();
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [subnetChildren, setSubnetChildren] = useState<Record<string, Subnet[]>>({});
    const [loadingSubnets, setLoadingSubnets] = useState<Set<string>>(new Set());

    // Find all ancestor section IDs for expanding path to current section
    const getAncestorPath = (sectionId: string): string[] => {
        const path: string[] = [sectionId];
        let current = sections.find((s) => s.id === sectionId);
        while (current?.master_section) {
            path.push(current.master_section);
            current = sections.find((s) => s.id === current?.master_section);
        }
        return path;
    };

    // Auto-expand path to current section on mount
    useEffect(() => {
        const pathToExpand = getAncestorPath(currentSectionId);
        setExpandedNodes(new Set(pathToExpand));
    }, [currentSectionId, sections]);

    // Build full hierarchical tree from root
    const buildTree = (parentId: string | null = null): TreeNode[] => {
        const tree: TreeNode[] = [];

        // Get sections at this level
        const childSections = sections.filter(
            (s) => (s.master_section || null) === parentId
        );

        childSections.forEach((section) => {
            // Recursively build children
            const children = buildTree(section.id);

            // Add subnets that belong to this section (only parent subnets)
            const sectionSubnets = subnets.filter(
                (subnet) =>
                    (subnet as any).section_id === section.id &&
                    !(subnet as any).master_subnet_id
            );

            sectionSubnets.forEach((subnet) => {
                // Check if this subnet has fetched children
                const fetchedChildren = subnetChildren[subnet.id] || [];
                const subnetChildNodes: TreeNode[] = fetchedChildren.map((childSubnet) => ({
                    id: childSubnet.id,
                    type: "subnet",
                    name: `${childSubnet.subnet}/${childSubnet.mask}`,
                    description: childSubnet.description,
                    data: childSubnet,
                    children: [],
                }));

                children.push({
                    id: subnet.id,
                    type: "subnet",
                    name: `${subnet.subnet}/${subnet.mask}`,
                    description: subnet.description,
                    data: subnet,
                    children: subnetChildNodes,
                });
            });

            tree.push({
                id: section.id,
                type: "section",
                name: section.name,
                description: section.description,
                data: section,
                children,
            });
        });

        return tree;
    };

    const toggleNode = async (nodeId: string, nodeType: "section" | "subnet", e: React.MouseEvent) => {
        e.stopPropagation();
        const newExpanded = new Set(expandedNodes);

        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
            setExpandedNodes(newExpanded);
        } else {
            newExpanded.add(nodeId);
            setExpandedNodes(newExpanded);

            // If it's a subnet and we haven't fetched its children yet, fetch them
            if (nodeType === "subnet" && !subnetChildren[nodeId] && token) {
                setLoadingSubnets(new Set(loadingSubnets).add(nodeId));
                try {
                    const response = await ipamService.getSubnetChildren(token, nodeId);
                    setSubnetChildren({
                        ...subnetChildren,
                        [nodeId]: response.subnets,
                    });
                } catch (error) {
                    console.error("Error fetching subnet children:", error);
                    setSubnetChildren({
                        ...subnetChildren,
                        [nodeId]: [],
                    });
                } finally {
                    const newLoading = new Set(loadingSubnets);
                    newLoading.delete(nodeId);
                    setLoadingSubnets(newLoading);
                }
            }
        }
    };

    const handleSelect = (node: TreeNode) => {
        if (node.type === "section") {
            onSelectSection(node.id);
        } else {
            onSelectSubnet(node.id);
        }
    };

    const renderNode = (node: TreeNode, level: number = 0): React.ReactElement => {
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children.length > 0;
        const isLoading = loadingSubnets.has(node.id);
        const isSelected = selectedId === node.id && selectedType === node.type;
        const paddingLeft = level * 16 + 12;
        const uniqueKey = `${node.type}-${node.id}`;

        // For subnets, show arrow if has children or hasn't been fetched yet
        const hasBeenFetched = node.type === "subnet" ? subnetChildren.hasOwnProperty(node.id) : true;
        const showArrow = node.type === "section" ? hasChildren : (hasChildren || !hasBeenFetched);

        if (node.type === "section") {
            return (
                <div key={uniqueKey}>
                    <div
                        onClick={() => handleSelect(node)}
                        className={`flex items-center gap-2 py-2 px-3 cursor-pointer transition-colors ${isSelected
                            ? "bg-primary-100 text-primary-700 border-r-2 border-primary-600"
                            : "hover:bg-gray-100 text-gray-700"
                            }`}
                        style={{ paddingLeft: `${paddingLeft}px` }}
                    >
                        {showArrow ? (
                            <button
                                onClick={(e) => toggleNode(node.id, node.type, e)}
                                className="flex-shrink-0"
                            >
                                <FontAwesomeIcon
                                    icon={isExpanded ? faChevronDown : faChevronRight}
                                    className="w-3 h-3"
                                />
                            </button>
                        ) : (
                            <div className="w-3" />
                        )}
                        <FontAwesomeIcon
                            icon={isExpanded ? faFolderOpen : faFolder}
                            className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-primary-600" : "text-blue-500"
                                }`}
                        />
                        <span className="text-sm font-medium truncate">{node.name}</span>
                    </div>
                    {hasChildren && isExpanded && (
                        <div>
                            {node.children.map((child) => renderNode(child, level + 1))}
                        </div>
                    )}
                </div>
            );
        } else {
            // Subnet node
            return (
                <div key={uniqueKey}>
                    <div
                        onClick={() => handleSelect(node)}
                        className={`flex items-center gap-2 py-2 px-3 cursor-pointer transition-colors ${isSelected
                            ? "bg-green-100 text-green-700 border-r-2 border-green-600"
                            : "hover:bg-gray-100 text-gray-700"
                            }`}
                        style={{ paddingLeft: `${paddingLeft}px` }}
                    >
                        {showArrow ? (
                            <button
                                onClick={(e) => toggleNode(node.id, node.type, e)}
                                className="flex-shrink-0"
                            >
                                {isLoading ? (
                                    <div className="w-3 h-3 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
                                ) : (
                                    <FontAwesomeIcon
                                        icon={isExpanded ? faChevronDown : faChevronRight}
                                        className="w-3 h-3"
                                    />
                                )}
                            </button>
                        ) : (
                            <div className="w-3" />
                        )}
                        <FontAwesomeIcon
                            icon={faNetworkWired}
                            className="w-4 h-4 flex-shrink-0 text-green-600"
                        />
                        <span className="text-sm truncate">{node.name}</span>
                    </div>
                    {hasChildren && isExpanded && (
                        <div>
                            {node.children.map((child) => renderNode(child, level + 1))}
                        </div>
                    )}
                </div>
            );
        }
    };

    // Build tree from root (sections with no parent)
    const tree = buildTree(null);

    return (
        <div className="h-full bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">IPAM Tree</h3>
            </div>
            <div className="py-2">
                {tree.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                        No sections found
                    </div>
                ) : (
                    tree.map((node) => renderNode(node, 0))
                )}
            </div>
        </div>
    );
}
