"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchClient } from "@/lib/apiv2/fetch";
import { components } from "@/lib/apiv2/schema";
import {
    Box,
    Typography,
    IconButton,
    CircularProgress,
} from "@mui/material";
import {
    Folder as FolderIcon,
    FolderOpen as FolderOpenIcon,
    AccountTree as AccountTreeIcon,
    KeyboardArrowRight as KeyboardArrowRightIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    Lan as LanIcon,
} from "@mui/icons-material";

type SectionResponse = components["schemas"]["SectionResponse"];
type SubnetResponse = components["schemas"]["SubnetResponse"];

interface IPAMTreeSidebarProps {
    sections: SectionResponse[];
    subnets: SubnetResponse[];
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
    data: SectionResponse | SubnetResponse;
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
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [subnetChildren, setSubnetChildren] = useState<Record<string, SubnetResponse[]>>({});
    const [loadingSubnets, setLoadingSubnets] = useState<Set<string>>(new Set());
    const hasInitialized = useRef(false);

    // Find all ancestor section IDs for a given id
    const getAncestorSectionPath = useCallback((sectionId: string): string[] => {
        const path: string[] = [sectionId];
        let current = sections.find((s) => s.id === sectionId);
        while (current?.master_section) {
            path.push(current.master_section);
            current = sections.find((s) => s.id === current?.master_section);
        }
        return path;
    }, [sections]);

    // Find the section that owns a subnet
    const findSectionForSubnet = useCallback((subnetId: string): string | null => {
        const subnet = subnets.find(s => s.id === subnetId);
        if (subnet) return (subnet as any).section_id || null;
        // Also check in fetched children
        for (const [parentId, children] of Object.entries(subnetChildren)) {
            if (children.find(c => c.id === subnetId)) {
                const parentSubnet = subnets.find(s => s.id === parentId);
                if (parentSubnet) return (parentSubnet as any).section_id || null;
            }
        }
        return null;
    }, [subnets, subnetChildren]);

    // Auto-expand on initial mount only
    useEffect(() => {
        if (!hasInitialized.current && sections.length > 0 && currentSectionId) {
            hasInitialized.current = true;
            const pathToExpand = getAncestorSectionPath(currentSectionId);
            if (pathToExpand.length > 0) {
                setExpandedNodes(new Set(pathToExpand));
            }
        }
    }, [sections, currentSectionId, getAncestorSectionPath]);

    // Build full hierarchical tree from root
    const buildTree = useCallback((parentId: string | null = null): TreeNode[] => {
        const tree: TreeNode[] = [];

        const childSections = sections.filter(
            (s) => (s.master_section || null) === parentId
        );

        childSections.forEach((section) => {
            const children = buildTree(section.id);

            const sectionSubnets = subnets.filter(
                (subnet) =>
                    (subnet as any).section_id === section.id &&
                    !(subnet as any).master_subnet_id
            );

            sectionSubnets.forEach((subnet) => {
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
    }, [sections, subnets, subnetChildren]);

    const toggleNode = async (nodeId: string, nodeType: "section" | "subnet", e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });

        // If it's a subnet and we haven't fetched its children yet, fetch them
        if (nodeType === "subnet" && !subnetChildren[nodeId] && !expandedNodes.has(nodeId)) {
            setLoadingSubnets(prev => new Set(prev).add(nodeId));
            try {
                const response = await fetchClient.GET("/ipam/subnets/{subnet_id}/children", {
                    params: { path: { subnet_id: nodeId } }
                });
                if (response.error) throw response.error;
                
                setSubnetChildren(prev => ({
                    ...prev,
                    [nodeId]: response.data?.subnets || [],
                }));
            } catch (error) {
                console.error("Error fetching subnet children:", error);
                setSubnetChildren(prev => ({
                    ...prev,
                    [nodeId]: [],
                }));
            } finally {
                setLoadingSubnets(prev => {
                    const next = new Set(prev);
                    next.delete(nodeId);
                    return next;
                });
            }
        }
    };

    const handleSelect = (node: TreeNode, e: React.MouseEvent) => {
        e.stopPropagation();

        if (node.type === "section") {
            // Auto-expand section when selecting it + expand parent path
            setExpandedNodes(prev => {
                const next = new Set(prev);
                next.add(node.id);
                // Also ensure all parents are expanded
                const ancestors = getAncestorSectionPath(node.id);
                ancestors.forEach(id => next.add(id));
                return next;
            });
            onSelectSection(node.id);
        } else {
            // For subnet: ensure parent section stays expanded
            const sectionId = findSectionForSubnet(node.id);
            if (sectionId) {
                setExpandedNodes(prev => {
                    const next = new Set(prev);
                    // Keep all currently expanded nodes + expand the path to this subnet's section
                    const ancestors = getAncestorSectionPath(sectionId);
                    ancestors.forEach(id => next.add(id));
                    return next;
                });
            }
            onSelectSubnet(node.id);
        }
    };

    const renderNode = (node: TreeNode, level: number = 0): React.ReactElement => {
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children.length > 0;
        const isLoading = loadingSubnets.has(node.id);
        const isSelected = selectedId === node.id && selectedType === node.type;
        const indent = level * 20 + 8;
        const uniqueKey = `${node.type}-${node.id}`;

        const hasBeenFetched = node.type === "subnet" ? subnetChildren.hasOwnProperty(node.id) : true;
        const showArrow = node.type === "section" ? hasChildren : (hasChildren || !hasBeenFetched);

        return (
            <Box key={uniqueKey}>
                <Box
                    onClick={(e) => handleSelect(node, e)}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        py: 0.75,
                        pr: 1.5,
                        pl: `${indent}px`,
                        cursor: "pointer",
                        borderRadius: 0,
                        transition: "all 0.15s ease",
                        minHeight: 36,
                        ...(isSelected
                            ? {
                                  bgcolor: node.type === "section"
                                      ? "rgba(99, 102, 241, 0.08)"
                                      : "rgba(16, 185, 129, 0.08)",
                                  borderRight: "3px solid",
                                  borderColor: node.type === "section"
                                      ? "#6366f1"
                                      : "#10b981",
                              }
                            : {
                                  "&:hover": {
                                      bgcolor: "action.hover",
                                  },
                              }),
                    }}
                >
                    {/* Expand/collapse arrow */}
                    {showArrow ? (
                        <IconButton
                            size="small"
                            onClick={(e) => toggleNode(node.id, node.type, e)}
                            sx={{ p: 0.25, color: "text.secondary", "&:hover": { color: "text.primary" } }}
                        >
                            {isLoading ? (
                                <CircularProgress size={14} />
                            ) : isExpanded ? (
                                <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                            ) : (
                                <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />
                            )}
                        </IconButton>
                    ) : (
                        <Box sx={{ width: 22 }} />
                    )}

                    {/* Icon */}
                    {node.type === "section" ? (
                        isExpanded ? (
                            <FolderOpenIcon sx={{ fontSize: 18, color: isSelected ? "#6366f1" : "#818cf8", flexShrink: 0 }} />
                        ) : (
                            <FolderIcon sx={{ fontSize: 18, color: isSelected ? "#6366f1" : "#818cf8", flexShrink: 0 }} />
                        )
                    ) : (
                        <LanIcon sx={{ fontSize: 16, color: isSelected ? "#10b981" : "#34d399", flexShrink: 0 }} />
                    )}

                    {/* Label */}
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: "0.8125rem",
                            color: isSelected
                                ? (node.type === "section" ? "#4f46e5" : "#059669")
                                : "text.primary",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: 1.4,
                        }}
                    >
                        {node.name}
                    </Typography>
                </Box>

                {/* Children */}
                {isExpanded && hasChildren && (
                    <Box>
                        {node.children.map((child) => renderNode(child, level + 1))}
                    </Box>
                )}
            </Box>
        );
    };

    const tree = buildTree(null);

    return (
        <Box
            sx={{
                height: "100%",
                bgcolor: "background.paper",
                borderRight: "1px solid",
                borderColor: "divider",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Header */}
            <Box sx={{
                px: 2,
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
            }}>
                <AccountTreeIcon sx={{ fontSize: 18, color: "#6366f1" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.secondary", letterSpacing: "0.05em", fontSize: "0.75rem", textTransform: "uppercase" }}>
                    IPAM Navigator
                </Typography>
            </Box>

            {/* Tree */}
            <Box sx={{ flex: 1, overflowY: "auto", py: 0.5 }}>
                {tree.length === 0 ? (
                    <Typography variant="body2" color="text.disabled" align="center" sx={{ p: 3 }}>
                        No sections found
                    </Typography>
                ) : (
                    tree.map((node) => renderNode(node, 0))
                )}
            </Box>
        </Box>
    );
}
