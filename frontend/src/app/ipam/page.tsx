"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { $api } from "@/lib/apiv2/fetch";
import {
    Box,
    Typography,
    Button,
    Paper,
    IconButton,
    Alert,
    Collapse,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider,
} from "@mui/material";
import {
    Folder as FolderIcon,
    FolderOpen as FolderOpenIcon,
    AccountTree as AccountTreeIcon,
    KeyboardArrowRight as KeyboardArrowRightIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
} from "@mui/icons-material";

import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import SectionFormModal from "@/components/ipam/SectionFormModal";
import DeleteConfirmModal from "@/components/ipam/DeleteConfirmModal";
import IPAMSkeleton from "@/components/ipam/IPAMSkeleton";
import Link from "next/link";
import { components } from "@/lib/apiv2/schema";
import { fetchClient } from "@/lib/apiv2/fetch";

type SectionResponse = components["schemas"]["SectionResponse"];

export default function IPAMPage() {
    const { isAuthenticated, user } = useAuth();
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // Modal states
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [editingSection, setEditingSection] = useState<SectionResponse | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingSection, setDeletingSection] = useState<SectionResponse | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [menuSection, setMenuSection] = useState<SectionResponse | null>(null);

    // React Query for sections
    const { 
        data: sectionsData, 
        isLoading, 
        error: fetchError,
        refetch
    } = $api.useQuery(
        "get",
        "/ipam/sections",
        {},
        {
            enabled: isAuthenticated,
        }
    );

    const sections = sectionsData?.sections || [];
    let error = null;
    if (fetchError) {
        const errObj = fetchError as any;
        if (typeof errObj === "string") error = errObj;
        else error = errObj.detail || errObj.message || "Failed to load sections";
        
        if (typeof error === "object") {
            error = JSON.stringify(error);
        }
    }

    const toggleSection = (sectionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const handleAddSection = () => {
        setEditingSection(null);
        setShowSectionModal(true);
    };

    const handleEditSection = (section: SectionResponse, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setEditingSection(section);
        setShowSectionModal(true);
    };

    const handleDeleteClick = (section: SectionResponse, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setDeletingSection(section);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!isAuthenticated || !deletingSection) return;

        setIsDeleting(true);
        try {
            const res = await fetchClient.DELETE("/ipam/sections/{section_id}", {
                params: { path: { section_id: deletingSection.id } }
            });
            if (res.error) throw res.error;
            
            setShowDeleteModal(false);
            setDeletingSection(null);
            refetch();
        } catch (err: any) {
            console.error("Error deleting section:", err);
            alert(err.message || "Failed to delete section");
        } finally {
            setIsDeleting(false);
        }
    };

    // Get root sections (those without master_section)
    const rootSections = sections.filter(
        (s) => !s.master_section || s.master_section === ""
    );

    // Get sub-sections for a given section
    const getSubSections = (parentId: string) => {
        return sections.filter((s) => s.master_section === parentId);
    };

    const renderSection = (section: SectionResponse, level: number = 0) => {
        const subSections = getSubSections(section.id);
        const hasChildren = subSections.length > 0;
        const isExpanded = expandedSections.has(section.id);
        const paddingLeft = level * 24 + 16;

        return (
            <Box key={section.id}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        py: 1.5,
                        px: 2,
                        pl: `${paddingLeft}px`,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        transition: "background-color 0.2s",
                        "&:hover": {
                            bgcolor: "action.hover",
                            "& .action-buttons": {
                                opacity: 1,
                            },
                        },
                    }}
                >
                    {hasChildren ? (
                        <IconButton
                            size="small"
                            onClick={(e) => toggleSection(section.id, e)}
                            sx={{ color: "text.secondary" }}
                        >
                            {isExpanded ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
                        </IconButton>
                    ) : (
                        <Box sx={{ width: 28 }} />
                    )}
                    
                    {isExpanded ? (
                        <FolderOpenIcon color="primary" />
                    ) : (
                        <FolderIcon color="primary" />
                    )}
                    
                    <Box component={Link} href={`/ipam/sections/${section.id}`} sx={{ flex: 1, textDecoration: "none", color: "text.primary", fontWeight: 500, "&:hover": { color: "primary.main" } }}>
                        {section.name}
                    </Box>
                    
                    {section.description && (
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200, display: { xs: "none", sm: "block" } }}>
                            {section.description}
                        </Typography>
                    )}
                    
                    {/* Action buttons - MoreVert */}
                    {user?.role?.toLowerCase() !== "viewer" && (
                        <Box className="action-buttons" sx={{ opacity: 0, transition: "opacity 0.2s" }}>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setMenuAnchorEl(e.currentTarget);
                                    setMenuSection(section);
                                }}
                            >
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                </Box>
                
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    {subSections.map((sub) => renderSection(sub, level + 1))}
                </Collapse>
            </Box>
        );
    };

    return (
        <ProtectedRoute>
            <PageLayout>
                {isLoading ? (
                    <IPAMSkeleton />
                ) : (
                    <Box sx={{ p: 3 }}>
                        {/* Header */}
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" color="text.primary">
                                    IP Address Management
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Manage your IP address space, subnets, and VLANs
                                </Typography>
                            </Box>
                            {user?.role?.toLowerCase() !== "viewer" && (
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    startIcon={<AddIcon />} 
                                    onClick={handleAddSection}
                                    sx={{ textTransform: "none", fontWeight: 500 }}
                                >
                                    Add Section
                                </Button>
                            )}
                        </Box>

                        {/* Stats Cards */}
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
                            <Paper elevation={0} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "info.light", color: "info.dark", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <FolderIcon />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Total Sections</Typography>
                                    <Typography variant="h5" fontWeight="bold" color="text.primary">{sections.length}</Typography>
                                </Box>
                            </Paper>
                            <Paper elevation={0} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "success.light", color: "success.dark", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <AccountTreeIcon />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Root Sections</Typography>
                                    <Typography variant="h5" fontWeight="bold" color="text.primary">{rootSections.length}</Typography>
                                </Box>
                            </Paper>
                            <Paper elevation={0} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "secondary.light", color: "secondary.dark", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <FolderIcon />
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Sub-sections</Typography>
                                    <Typography variant="h5" fontWeight="bold" color="text.primary">{sections.length - rootSections.length}</Typography>
                                </Box>
                            </Paper>
                        </Box>

                        {/* Sections List */}
                        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
                            <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                                <Typography variant="h6" fontWeight="medium" color="text.primary">Sections</Typography>
                            </Box>

                            {error ? (
                                error === "phpIPAM integration is not enabled" ? (
                                    <Box sx={{ p: 6, textAlign: "center" }}>
                                        <AccountTreeIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                                        <Typography variant="h6" fontWeight="medium" color="text.primary" gutterBottom>
                                            phpIPAM Integration Disabled
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            The IP Address Management system requires phpIPAM integration. Please enable it in the backend configuration to use this feature.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ p: 3 }}>
                                        <Alert severity="error" action={
                                            <Button color="inherit" size="small" onClick={() => refetch()}>
                                                Retry
                                            </Button>
                                        }>
                                            {error}
                                        </Alert>
                                    </Box>
                                )
                            ) : rootSections.length === 0 ? (
                                <Box sx={{ p: 6, textAlign: "center" }}>
                                    <FolderIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                                    <Typography variant="h6" fontWeight="medium" color="text.primary" gutterBottom>
                                        No sections found
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        Get started by creating your first section
                                    </Typography>
                                    {user?.role?.toLowerCase() !== "viewer" && (
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            startIcon={<AddIcon />} 
                                            onClick={handleAddSection}
                                            sx={{ textTransform: "none", fontWeight: 500 }}
                                        >
                                            Add Section
                                        </Button>
                                    )}
                                </Box>
                            ) : (
                                <Box>
                                    {rootSections.map((section) => renderSection(section, 0))}
                                </Box>
                            )}
                        </Paper>
                    </Box>
                )}
                {/* Context Menu for Sections */}
                <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={() => { setMenuAnchorEl(null); setMenuSection(null); }}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                    <MenuItem onClick={() => {
                        if (menuSection) handleEditSection(menuSection, {} as any);
                        setMenuAnchorEl(null);
                        setMenuSection(null);
                    }}>
                        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                        Edit Section
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => {
                        if (menuSection) handleDeleteClick(menuSection, {} as any);
                        setMenuAnchorEl(null);
                        setMenuSection(null);
                    }} sx={{ color: "error.main" }}>
                        <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                        Delete Section
                    </MenuItem>
                </Menu>

                {/* Section Form Modal */}
                <SectionFormModal
                    isOpen={showSectionModal}
                    onClose={() => {
                        setShowSectionModal(false);
                        setEditingSection(null);
                    }}
                    onSuccess={() => refetch()}
                    section={editingSection}
                    allSections={sections}
                />

                {/* Delete Confirmation Modal */}
                <DeleteConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setDeletingSection(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    title="Delete Section"
                    message="Are you sure you want to delete this section? This action cannot be undone."
                    itemName={deletingSection?.name}
                    isLoading={isDeleting}
                />
            </PageLayout>
        </ProtectedRoute>
    );
}
