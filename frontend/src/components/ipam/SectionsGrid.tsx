"use client";

import { useState } from "react";
import Link from "next/link";
import { components } from "@/lib/apiv2/schema";
import {
    Card,
    Typography,
    IconButton,
    Box,
    Collapse,
    Tooltip,
} from "@mui/material";
import {
    Folder as FolderIcon,
    FolderOpen as FolderOpenIcon,
    MoreVert as MoreVertIcon,
} from "@mui/icons-material";

type SectionResponse = components["schemas"]["SectionResponse"];

interface SectionsGridProps {
    sections: SectionResponse[];
    onRefresh: () => void;
}

export default function SectionsGrid({ sections, onRefresh }: SectionsGridProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    const rootSections = sections.filter(s => !s.master_section);
    const getSectionChildren = (parentId: string) =>
        sections.filter(s => s.master_section === parentId);

    const toggleExpand = (sectionId: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const renderSection = (section: SectionResponse, level: number = 0) => {
        const children = getSectionChildren(section.id);
        const hasChildren = children.length > 0;
        const isExpanded = expandedSections.has(section.id);
        const marginLeft = level * 3; // MUI spacing 3 = 24px

        return (
            <Box key={section.id} sx={{ ml: marginLeft, mb: 2 }}>
                <Card 
                    elevation={0} 
                    sx={{ 
                        border: "1px solid", 
                        borderColor: "divider",
                        "&:hover": { borderColor: "primary.300", boxShadow: 1 },
                        transition: "all 0.2s",
                        "&:hover .folder-icon-bg": { bgcolor: "primary.200" }
                    }}
                >
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
                                <Box 
                                    className="folder-icon-bg"
                                    sx={{ 
                                        width: 48, 
                                        height: 48, 
                                        bgcolor: "primary.50", 
                                        borderRadius: 2, 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "center",
                                        transition: "background-color 0.2s",
                                        flexShrink: 0
                                    }}
                                >
                                    {isExpanded ? (
                                        <FolderOpenIcon sx={{ fontSize: 24, color: "primary.main" }} />
                                    ) : (
                                        <FolderIcon sx={{ fontSize: 24, color: "primary.main" }} />
                                    )}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography 
                                        component={Link} 
                                        href={`/ipam/sections/${section.id}`}
                                        variant="subtitle1" 
                                        fontWeight="semibold"
                                        color="text.primary"
                                        sx={{ 
                                            textDecoration: "none",
                                            "&:hover": { color: "primary.main" },
                                            display: "block",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {section.name}
                                    </Typography>
                                    {section.description && (
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{
                                                mt: 0.5,
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                lineHeight: 1.5,
                                                maxHeight: "3em"
                                            }}
                                        >
                                            {section.description}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2, flexShrink: 0 }}>
                                {hasChildren && (
                                    <Typography 
                                        component="button"
                                        onClick={() => toggleExpand(section.id)}
                                        variant="caption"
                                        fontWeight="medium"
                                        color="text.secondary"
                                        sx={{ 
                                            bgcolor: "transparent", 
                                            border: "none", 
                                            cursor: "pointer",
                                            "&:hover": { color: "text.primary" },
                                            p: 1
                                        }}
                                    >
                                        {isExpanded ? 'Collapse' : `${children.length} sub${children.length > 1 ? 's' : ''}`}
                                    </Typography>
                                )}
                                <Tooltip title="Section actions">
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            console.log("Section menu:", section.id);
                                        }}
                                        sx={{ color: "text.secondary" }}
                                    >
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>

                        <Box sx={{ 
                            pt: 2, 
                            borderTop: "1px solid", 
                            borderColor: "divider",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}>
                            <Typography variant="caption" color="text.secondary">
                                Section ID: {section.id}
                            </Typography>
                            {level > 0 && (
                                <Typography variant="caption" color="primary.main" fontWeight="medium">
                                    Sub-section
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Card>

                {hasChildren && (
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ 
                            ml: 2.5, 
                            mt: 2,
                            pl: 2.5, 
                            borderLeft: "2px solid", 
                            borderColor: "divider" 
                        }}>
                            {children.map(child => renderSection(child, level + 1))}
                        </Box>
                    </Collapse>
                )}
            </Box>
        );
    };

    return (
        <Box>
            {rootSections.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography color="text.secondary">No root sections found</Typography>
                </Box>
            ) : (
                rootSections.map(section => renderSection(section, 0))
            )}
        </Box>
    );
}

