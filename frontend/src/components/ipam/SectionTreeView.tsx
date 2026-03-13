"use client";

import { useState } from "react";
import Link from "next/link";
import { components } from "@/lib/apiv2/schema";
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Typography,
    Box,
    Chip,
    Paper,
} from "@mui/material";
import {
    Folder as FolderIcon,
    FolderOpen as FolderOpenIcon,
    Lan as NetworkIcon,
    ExpandMore,
    ChevronRight,
} from "@mui/icons-material";

type SectionResponse = components["schemas"]["SectionResponse"];
type SubnetResponse = components["schemas"]["SubnetResponse"];

interface SectionTreeViewProps {
    sections: SectionResponse[];
    subnets: SubnetResponse[];
    currentSectionId: string;
}

type TreeNode = {
    id: string;
    type: "section" | "subnet";
    name: string;
    description?: string | null;
    data: SectionResponse | SubnetResponse;
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

    const toggleNode = (nodeId: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
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
        const paddingLeft = level * 3 + 2; // MUI theme spacing

        if (node.type === "section") {
            const section = node.data as SectionResponse;
            return (
                <Box key={node.id}>
                    <ListItem disablePadding>
                        <ListItemButton
                            component={Link}
                            href={`/ipam/sections/${node.id}`}
                            sx={{ pl: paddingLeft, borderBottom: "1px solid", borderColor: "divider" }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                                {hasChildren && (
                                    <Box
                                        onClick={(e) => toggleNode(node.id, e)}
                                        sx={{ 
                                            display: "flex", 
                                            alignItems: "center", 
                                            justifyContent: "center",
                                            mr: 1,
                                            p: 0.5,
                                            cursor: "pointer",
                                            borderRadius: "50%",
                                            "&:hover": { bgcolor: "action.hover" }
                                        }}
                                    >
                                        {isExpanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                                    </Box>
                                )}
                                {!hasChildren && <Box sx={{ width: 28 }} />}
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 1,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor: "primary.50",
                                        }}
                                    >
                                        {isExpanded ? (
                                            <FolderOpenIcon sx={{ fontSize: 20, color: "primary.main" }} />
                                        ) : (
                                            <FolderIcon sx={{ fontSize: 20, color: "primary.main" }} />
                                        )}
                                    </Box>
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Typography variant="body2" fontWeight="semibold" noWrap>
                                                {node.name}
                                            </Typography>
                                            <Chip label="Section" size="small" color="info" variant="outlined" sx={{ height: 20, fontSize: "0.625rem" }} />
                                        </Box>
                                    }
                                    secondary={node.description}
                                    secondaryTypographyProps={{ variant: "caption", noWrap: true }}
                                />
                            </Box>
                        </ListItemButton>
                    </ListItem>
                    {hasChildren && (
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {node.children.map((child) => renderNode(child, level + 1))}
                            </List>
                        </Collapse>
                    )}
                </Box>
            );
        } else {
            // Subnet node
            const subnet = node.data as SubnetResponse;
            return (
                <ListItem key={node.id} disablePadding>
                    <ListItemButton
                        component={Link}
                        href={`/ipam/subnets/${node.id}`}
                        sx={{ pl: paddingLeft + 3.5, borderBottom: "1px solid", borderColor: "divider" }} // Align icon with section folders
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "success.50",
                                }}
                            >
                                <NetworkIcon sx={{ fontSize: 20, color: "success.main" }} />
                            </Box>
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="body2" fontWeight="semibold" noWrap>
                                        {node.name}
                                    </Typography>
                                    <Chip label="Subnet" size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: "0.625rem" }} />
                                </Box>
                            }
                            secondary={
                                <Box component="span" sx={{ display: "flex", flexDirection: "column", mt: 0.5 }}>
                                    {node.description && (
                                        <Typography variant="caption" color="text.secondary" noWrap>
                                            {node.description}
                                        </Typography>
                                    )}
                                    {subnet.vlan_id && (
                                        <Typography variant="caption" color="text.disabled">
                                            VLAN: {subnet.vlan_id}
                                        </Typography>
                                    )}
                                </Box>
                            }
                        />
                    </ListItemButton>
                </ListItem>
            );
        }
    };

    const tree = buildTree();

    return (
        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
            {tree.length === 0 ? (
                <Box sx={{ p: 6, textAlign: "center", color: "text.disabled" }}>
                    <FolderIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                        No sub-sections or subnets found
                    </Typography>
                </Box>
            ) : (
                <List disablePadding>
                    {tree.map((node) => renderNode(node, 0))}
                </List>
            )}
        </Paper>
    );
}
