"use client";

import React, { useState, useEffect } from "react";
import { fetchClient } from "@/lib/apiv2/fetch";
import { components } from "@/lib/apiv2/schema";
import {
    Box,
    Typography,
    IconButton,
    CircularProgress,
    Divider
} from "@mui/material";
import {
    Folder as FolderIcon,
    FolderOpen as FolderOpenIcon,
    AccountTree as AccountTreeIcon,
    KeyboardArrowRight as KeyboardArrowRightIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
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
        if (currentSectionId && sections.length > 0) {
            const pathToExpand = getAncestorPath(currentSectionId);
            setExpandedNodes(new Set(pathToExpand));
        }
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
            if (nodeType === "subnet" && !subnetChildren[nodeId]) {
                setLoadingSubnets(new Set(loadingSubnets).add(nodeId));
                try {
                    const response = await fetchClient.GET("/ipam/subnets/{subnet_id}/children", {
                        params: { path: { subnet_id: nodeId } }
                    });
                    if (response.error) throw response.error;
                    
                    setSubnetChildren({
                        ...subnetChildren,
                        [nodeId]: response.data?.subnets || [],
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

        const hasBeenFetched = node.type === "subnet" ? subnetChildren.hasOwnProperty(node.id) : true;
        const showArrow = node.type === "section" ? hasChildren : (hasChildren || !hasBeenFetched);

        return (
            <Box key={uniqueKey}>
                <Box
                    onClick={() => handleSelect(node)}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        py: 1,
                        pr: 2,
                        pl: `${paddingLeft}px`,
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        ...(isSelected
                            ? {
                                  bgcolor: node.type === "section" ? "primary.lighter" : "success.lighter",
                                  color: node.type === "section" ? "primary.dark" : "success.dark",
                                  borderRight: "3px solid",
                                  borderColor: node.type === "section" ? "primary.main" : "success.main",
                              }
                            : {
                                  color: "text.primary",
                                  "&:hover": {
                                      bgcolor: "action.hover",
                                  },
                              }),
                    }}
                >
                    {showArrow ? (
                        <IconButton
                            size="small"
                            onClick={(e) => toggleNode(node.id, node.type, e)}
                            sx={{ p: 0.5, color: "text.secondary" }}
                        >
                            {isLoading ? (
                                <CircularProgress size={14} />
                            ) : isExpanded ? (
                                <KeyboardArrowDownIcon fontSize="small" />
                            ) : (
                                <KeyboardArrowRightIcon fontSize="small" />
                            )}
                        </IconButton>
                    ) : (
                        <Box sx={{ width: 24 }} />
                    )}
                    
                    {node.type === "section" ? (
                        isExpanded ? (
                            <FolderOpenIcon sx={{ fontSize: 18, color: isSelected ? "primary.main" : "primary.light" }} />
                        ) : (
                            <FolderIcon sx={{ fontSize: 18, color: isSelected ? "primary.main" : "primary.light" }} />
                        )
                    ) : (
                        <AccountTreeIcon sx={{ fontSize: 18, color: isSelected ? "success.main" : "success.light" }} />
                    )}
                    
                    <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {node.name}
                    </Typography>
                </Box>
                {hasChildren && isExpanded && (
                    <Box>
                        {node.children.map((child) => renderNode(child, level + 1))}
                    </Box>
                )}
            </Box>
        );
    };

    const tree = buildTree(null);

    return (
        <Box sx={{ height: "100%", bgcolor: "background.paper", borderRight: "1px solid", borderColor: "divider", overflowY: "auto" }}>
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="subtitle2" fontWeight="semibold" color="text.secondary">
                    IPAM Tree
                </Typography>
            </Box>
            <Box sx={{ py: 1 }}>
                {tree.length === 0 ? (
                    <Typography variant="body2" color="text.disabled" align="center" sx={{ p: 2 }}>
                        No sections found
                    </Typography>
                ) : (
                    tree.map((node) => renderNode(node, 0))
                )}
            </Box>
        </Box>
    );
}
