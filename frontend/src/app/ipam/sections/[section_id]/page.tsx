"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { fetchClient, $api } from "@/lib/apiv2/fetch";
import { components } from "@/lib/apiv2/schema";
import IPAMTreeSidebar from "@/components/ipam/IPAMTreeSidebar";
import SubnetsTable from "@/components/ipam/SubnetsTable";
import IPAddressesTable from "@/components/ipam/IPAddressesTable";
import IPSpaceMap from "@/components/ipam/IPSpaceMap";
import SectionFormModal from "@/components/ipam/SectionFormModal";
import SubnetFormModal from "@/components/ipam/SubnetFormModal";
import DeleteConfirmModal from "@/components/ipam/DeleteConfirmModal";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import Link from "next/link";
import {
    Box,
    Typography,
    Paper,
    Breadcrumbs,
    Button,
    IconButton,
    CircularProgress,
    Card,
    CardContent,
    Grid,
    Alert,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
} from "@mui/material";
import {
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Folder as FolderIcon,
    AccountTree as AccountTreeIcon,
    MoreVert as MoreVertIcon,
} from "@mui/icons-material";

type ViewType = "section" | "subnet";
type SectionResponse = components["schemas"]["SectionResponse"];
type SubnetResponse = components["schemas"]["SubnetResponse"];

export default function SectionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const initialSectionId = params.section_id as string;

    // View state
    const [viewType, setViewType] = useState<ViewType>("section");
    const [currentViewId, setCurrentViewId] = useState<string>(initialSectionId);

    // Modal states
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [editingSection, setEditingSection] = useState<SectionResponse | null>(null);
    const [showSubnetModal, setShowSubnetModal] = useState(false);
    const [editingSubnet, setEditingSubnet] = useState<SubnetResponse | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteType, setDeleteType] = useState<"section" | "subnet">("section");
    const [deletingItem, setDeletingItem] = useState<SectionResponse | SubnetResponse | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

    // --- React Query Data Fetching ---

    // All sections for tree
    const { data: sectionsData, refetch: refetchSections } = $api.useQuery(
        "get",
        "/ipam/sections",
        {},
        { enabled: isAuthenticated }
    );
    const allSections = sectionsData?.sections || [];
    
    // For section view
    const { 
        data: sectionSubnetsData, 
        isLoading: isLoadingSection, 
        error: sectionError,
        refetch: refetchSectionSubnets
    } = $api.useQuery(
        "get",
        "/ipam/sections/{section_id}/subnets",
        { params: { path: { section_id: currentViewId } } },
        { enabled: isAuthenticated && viewType === "section" }
    );
    const subnets = sectionSubnetsData?.subnets || [];
    const currentSection = allSections.find((s) => s.id === currentViewId);
    const subSections = allSections.filter((s) => s.master_section === currentViewId);
    const parentSubnets = subnets.filter((s: any) => !s.master_subnet_id || s.master_subnet_id === "");
    const isChildSection = !!currentSection?.master_section;

    // For subnet view
    const {
        data: subnetDetailData,
        isLoading: isLoadingSubnetDetail,
        error: subnetDetailError,
        refetch: refetchSubnetDetail
    } = $api.useQuery(
        "get",
        "/ipam/subnets/{subnet_id}",
        { params: { path: { subnet_id: currentViewId } } },
        { enabled: isAuthenticated && viewType === "subnet" }
    );
    
    const { data: subnetAddressesData, refetch: refetchSubnetAddresses } = $api.useQuery(
        "get",
        "/ipam/subnets/{subnet_id}/addresses",
        { params: { path: { subnet_id: currentViewId } } },
        { enabled: isAuthenticated && viewType === "subnet" }
    );
    
    const { data: subnetUsageData } = $api.useQuery(
        "get",
        "/ipam/subnets/{subnet_id}/usage",
        { params: { path: { subnet_id: currentViewId } } },
        { enabled: isAuthenticated && viewType === "subnet" }
    );
    
    const { data: childSubnetsData } = $api.useQuery(
        "get",
        "/ipam/subnets/{subnet_id}/children",
        { params: { path: { subnet_id: currentViewId } } },
        { enabled: isAuthenticated && viewType === "subnet" }
    );

    // Fetch space-map to get proper status for each IP
    const { data: spaceMapData } = $api.useQuery(
        "get",
        "/ipam/subnets/{subnet_id}/space-map",
        { params: { path: { subnet_id: currentViewId } } },
        { enabled: isAuthenticated && viewType === "subnet" }
    );

    const subnetDetail = subnetDetailData as any;
    const rawSubnetAddresses = subnetAddressesData?.addresses || [];
    const childSubnets = childSubnetsData?.subnets || [];
    const subnetUsage = subnetUsageData as any;

    // Build a status map from space-map data (IP -> status string)
    const statusMap = useMemo(() => {
        const map: Record<string, string> = {};
        if (spaceMapData?.addresses) {
            for (const entry of spaceMapData.addresses) {
                map[entry.ip] = entry.status;
            }
        }
        return map;
    }, [spaceMapData]);

    // Enrich addresses with status from space-map
    const subnetAddresses = useMemo(() => {
        return rawSubnetAddresses.map((addr: any) => ({
            ...addr,
            _status: statusMap[addr.ip] || null,
        }));
    }, [rawSubnetAddresses, statusMap]);
    
    const usedPercent = parseFloat(subnetUsage?.Used_percent ?? subnetUsage?.used_percent ?? 0) || 0;
    const freePercent = parseFloat(subnetUsage?.freehosts_percent ?? 0) || 0;
    const offlinePercent = parseFloat(subnetUsage?.Offline_percent ?? subnetUsage?.offline_percent ?? 0) || 0;
    const reservedPercent = parseFloat(subnetUsage?.Reserved_percent ?? subnetUsage?.reserved_percent ?? 0) || 0;

    const circumference = 2 * Math.PI * 40;
    const usageSegments = [
        { label: "Used",     pct: usedPercent,     color: "#f59e0b" },
        { label: "Reserved", pct: reservedPercent,  color: "#6366f1" },
        { label: "Offline",  pct: offlinePercent,   color: "#94a3b8" },
        { label: "Free",     pct: freePercent,      color: "#22c55e" },
    ].filter(s => s.pct > 0);
    if (usageSegments.length === 0) usageSegments.push({ label: "Free", pct: 100, color: "#22c55e" });

    const isLoading = viewType === "section" ? isLoadingSection : isLoadingSubnetDetail;
    const error = viewType === "section" ? sectionError : subnetDetailError;

    // --- Handlers ---

    const handleSelectSection = (selectedSectionId: string) => {
        setViewType("section");
        setCurrentViewId(selectedSectionId);
    };

    const handleSelectSubnet = (subnetId: string) => {
        setViewType("subnet");
        setCurrentViewId(subnetId);
    };

    const handleAddSection = () => {
        setEditingSection(null);
        setShowSectionModal(true);
    };

    const handleEditSection = () => {
        if (currentSection) {
            setEditingSection(currentSection as SectionResponse);
            setShowSectionModal(true);
        }
    };

    const handleDeleteSectionClick = () => {
        if (currentSection) {
            setDeleteType("section");
            setDeletingItem(currentSection as SectionResponse);
            setShowDeleteModal(true);
        }
    };

    const handleAddSubnet = () => {
        setEditingSubnet(null);
        setShowSubnetModal(true);
    };

    const handleEditSubnet = (subnet: SubnetResponse) => {
        setEditingSubnet(subnet);
        setShowSubnetModal(true);
    };

    const handleDeleteSubnetClick = (subnet: SubnetResponse) => {
        setDeleteType("subnet");
        setDeletingItem(subnet);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingItem) return;
        setIsDeleting(true);
        try {
            if (deleteType === "section") {
                await fetchClient.DELETE("/ipam/sections/{section_id}", {
                    params: { path: { section_id: deletingItem.id } }
                });
                router.push("/ipam");
            } else {
                await fetchClient.DELETE("/ipam/subnets/{subnet_id}", {
                    params: { path: { subnet_id: deletingItem.id } }
                });
                if (viewType === "section") {
                    refetchSectionSubnets();
                } else {
                    refetchSubnetDetail();
                }
            }
            setShowDeleteModal(false);
            setDeletingItem(null);
            refetchSections();
        } catch (err: any) {
            console.error(`Error deleting ${deleteType}:`, err);
            alert(err.message || `Failed to delete ${deleteType}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const totalItems = subSections.length + parentSubnets.length;

    return (
        <ProtectedRoute>
            <PageLayout>
                <Box sx={{ display: "flex", height: "calc(100vh - 64px)" }}>
                    {/* Left Sidebar - Tree Navigation */}
                    <Box sx={{ width: 320, flexShrink: 0 }}>
                        <IPAMTreeSidebar
                            sections={allSections}
                            subnets={subnets as SubnetResponse[]}
                            currentSectionId={initialSectionId}
                            selectedId={currentViewId}
                            selectedType={viewType}
                            onSelectSection={handleSelectSection}
                            onSelectSubnet={handleSelectSubnet}
                        />
                    </Box>

                    {/* Right Content Area */}
                    <Box sx={{ flex: 1, overflowY: "auto", bgcolor: "background.default", p: 3 }}>
                        {/* Breadcrumbs */}
                        <Breadcrumbs separator="/" sx={{ mb: 3 }}>
                            <Link href="/ipam" style={{ textDecoration: "none" }}>
                                <Typography color="text.secondary" sx={{ "&:hover": { color: "primary.main" } }}>IPAM</Typography>
                            </Link>
                            <Typography color="text.primary" fontWeight="medium">
                                {viewType === "section"
                                    ? currentSection?.name || `Section ${currentViewId}`
                                    : `${subnetDetail?.subnet}/${subnetDetail?.mask}` || "Subnet"}
                            </Typography>
                        </Breadcrumbs>

                        {/* Content based on state */}
                        {isLoading ? (
                            <Box sx={{ display: "flex", height: 200, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
                                <CircularProgress />
                                <Typography color="text.secondary">Loading details...</Typography>
                            </Box>
                        ) : error ? (
                            <Alert 
                                severity="error" 
                                action={
                                    <Button color="inherit" size="small" onClick={() => viewType === "section" ? refetchSectionSubnets() : refetchSubnetDetail()}>
                                        Retry
                                    </Button>
                                }
                            >
                                {(error as any)?.message || "Failed to load data"}
                            </Alert>
                        ) : viewType === "section" ? (
                            // Section View
                            <Box>
                                {/* Header */}
                                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 4 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <IconButton onClick={() => router.push("/ipam")} sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
                                            <ArrowBackIcon />
                                        </IconButton>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            <Box sx={{ width: 48, height: 48, bgcolor: "primary.lighter", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <FolderIcon sx={{ color: "primary.main", fontSize: 28 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h4" fontWeight="bold" color="text.primary">
                                                    {currentSection?.name || "Section Details"}
                                                </Typography>
                                                {currentSection?.description && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                        {currentSection.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                    {user?.role?.toLowerCase() !== "viewer" && (
                                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddSubnet} sx={{ textTransform: "none" }}>
                                                Add Subnet
                                            </Button>
                                            <IconButton onClick={(e) => setMenuAnchorEl(e.currentTarget)} sx={{ border: "1px solid", borderColor: "divider" }}>
                                                <MoreVertIcon />
                                            </IconButton>
                                            <Menu
                                                anchorEl={menuAnchorEl}
                                                open={Boolean(menuAnchorEl)}
                                                onClose={() => setMenuAnchorEl(null)}
                                                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                                transformOrigin={{ vertical: "top", horizontal: "right" }}
                                            >
                                                <MenuItem onClick={() => { setMenuAnchorEl(null); handleEditSection(); }}>
                                                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                                                    Edit Section
                                                </MenuItem>
                                                {!isChildSection && (
                                                    <MenuItem onClick={() => { setMenuAnchorEl(null); handleAddSection(); }}>
                                                        <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                                                        Add Sub-section
                                                    </MenuItem>
                                                )}
                                                <Divider />
                                                <MenuItem onClick={() => { setMenuAnchorEl(null); handleDeleteSectionClick(); }} sx={{ color: "error.main" }}>
                                                    <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                                                    Delete Section
                                                </MenuItem>
                                            </Menu>
                                        </Box>
                                    )}
                                </Box>

                                {/* Stats Cards */}
                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3, mb: 4 }}>
                                    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                                        <CardContent>
                                            <Typography color="text.secondary" variant="body2" gutterBottom>Sub-sections</Typography>
                                            <Typography variant="h4" fontWeight="bold">{subSections.length}</Typography>
                                        </CardContent>
                                    </Card>
                                    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                                        <CardContent>
                                            <Typography color="text.secondary" variant="body2" gutterBottom>Subnets</Typography>
                                            <Typography variant="h4" fontWeight="bold">{parentSubnets.length}</Typography>
                                        </CardContent>
                                    </Card>
                                    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                                        <CardContent>
                                            <Typography color="text.secondary" variant="body2" gutterBottom>Total Items</Typography>
                                            <Typography variant="h4" fontWeight="bold">{totalItems}</Typography>
                                        </CardContent>
                                    </Card>
                                </Box>

                                {/* Contents */}
                                <Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                        <Typography variant="h6" fontWeight="semibold">Contents</Typography>
                                        <Typography variant="body2" color="text.secondary">{totalItems} item{totalItems !== 1 ? "s" : ""}</Typography>
                                    </Box>

                                    {totalItems === 0 ? (
                                        <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                            <FolderIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                                            <Typography variant="h6" color="text.primary" gutterBottom>No items found</Typography>
                                            <Typography color="text.secondary">Get started by adding sections or subnets</Typography>
                                        </Paper>
                                    ) : (
                                        <SubnetsTable
                                            subnets={parentSubnets}
                                            onRefresh={refetchSectionSubnets}
                                        />
                                    )}
                                </Box>
                            </Box>
                        ) : (
                            // Subnet View
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 2fr" }, gap: 3 }}>
                                    {/* Left Sidebar - Subnet Details */}
                                    <Card sx={{ bgcolor: "grey.900", color: "common.white", p: 3, height: "100%", borderRadius: 2 }}>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                            <Box>
                                                <Typography variant="body2" color="grey.500" gutterBottom>Subnet details</Typography>
                                                <Typography variant="h6" fontWeight="semibold">
                                                    {subnetDetail?.subnet}/{subnetDetail?.mask}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" color="grey.500" gutterBottom>Description</Typography>
                                                <Typography variant="body2">{subnetDetail?.description || "-"}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" color="grey.500" gutterBottom>Usage</Typography>
                                                <Typography variant="body2">
                                                    Used: {parseFloat(subnetUsage?.used ?? 0) || 0} | Free: {parseFloat(subnetUsage?.freehosts ?? 0) || 0} ({freePercent.toFixed(1)}%) | Total: {parseFloat(subnetUsage?.maxhosts ?? 0) || 0}
                                                </Typography>
                                            </Box>
                                            {(() => {
                                                const gatewayAddress = subnetAddresses.find(
                                                    (addr: any) => addr.is_gateway === "1" || addr.is_gateway === 1
                                                );
                                                return gatewayAddress ? (
                                                    <Box>
                                                        <Typography variant="body2" color="grey.500" gutterBottom>Gateway</Typography>
                                                        <Typography variant="body2">{(gatewayAddress as any).ip}</Typography>
                                                    </Box>
                                                ) : null;
                                            })()}
                                        </Box>
                                    </Card>

                                    {/* Right Content Area - Usage Graph */}
                                    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: 3, height: "100%", borderRadius: 2 }}>
                                        <Typography variant="h6" fontWeight="semibold" gutterBottom>Usage graph</Typography>
                                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 250 }}>
                                            <Box sx={{ position: "relative", width: 200, height: 200 }}>
                                                <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                                                    {(() => {
                                                        let offset = 0;
                                                        return usageSegments.map((seg) => {
                                                            const dashLen = (seg.pct / 100) * circumference;
                                                            const el = (
                                                                <circle key={seg.label} cx="50" cy="50" r="40" fill="none" stroke={seg.color} strokeWidth="20" strokeDasharray={`${dashLen} ${circumference - dashLen}`} strokeDashoffset={-offset} style={{ transition: "stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease" }} />
                                                            );
                                                            offset += dashLen;
                                                            return el;
                                                        });
                                                    })()}
                                                </svg>
                                                <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                    <Typography variant="h4" fontWeight="bold">{usedPercent.toFixed(1)}%</Typography>
                                                    <Typography variant="body2" color="text.secondary">Used</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2, flexWrap: "wrap" }}>
                                            {[
                                                { label: "Used", color: "#f59e0b" },
                                                { label: "Reserved", color: "#6366f1" },
                                                { label: "Offline", color: "#94a3b8" },
                                                { label: "Free", color: "#22c55e" },
                                            ].map((item) => (
                                                <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                    <Box sx={{ width: 12, height: 12, bgcolor: item.color, borderRadius: 0.5 }} />
                                                    <Typography variant="caption">{item.label}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Card>
                                </Box>

                                {/* Child Subnets */}
                                {childSubnets.length > 0 && (
                                    <Box>
                                        <Typography variant="h6" fontWeight="semibold" gutterBottom>Child Subnets</Typography>
                                        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                            <List disablePadding>
                                                {childSubnets.map((childSubnet: any, index: number) => (
                                                    <div key={childSubnet.id}>
                                                        {index > 0 && <Divider />}
                                                        <ListItemButton
                                                            onClick={() => handleSelectSubnet(childSubnet.id)}
                                                            sx={{ py: 2, "&:hover": { bgcolor: "action.hover" } }}
                                                        >
                                                            <ListItemIcon>
                                                                <Box sx={{ width: 40, height: 40, bgcolor: "success.lighter", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                    <AccountTreeIcon sx={{ color: "success.main" }} />
                                                                </Box>
                                                            </ListItemIcon>
                                                            <ListItemText 
                                                                primary={`${childSubnet.subnet}/${childSubnet.mask}`}
                                                                secondary={childSubnet.description}
                                                                primaryTypographyProps={{ fontWeight: "semibold" }}
                                                                secondaryTypographyProps={{ noWrap: true }}
                                                            />
                                                        </ListItemButton>
                                                    </div>
                                                ))}
                                            </List>
                                        </Paper>
                                    </Box>
                                )}

                                {/* Space Map Visuals */}
                                <Box>
                                    <IPSpaceMap subnetId={currentViewId} />
                                </Box>

                                {/* IP Addresses */}
                                <Box>
                                    <Typography variant="h6" fontWeight="semibold" gutterBottom>IP Addresses</Typography>
                                    {subnetAddresses.length === 0 ? (
                                        <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                            <AccountTreeIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                                            <Typography variant="h6" color="text.primary" gutterBottom>No IP addresses found</Typography>
                                        </Paper>
                                    ) : (
                                        <IPAddressesTable
                                            addresses={subnetAddresses}
                                            onRefresh={refetchSubnetAddresses}
                                        />
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Section Form Modal */}
                <SectionFormModal
                    isOpen={showSectionModal}
                    onClose={() => {
                        setShowSectionModal(false);
                        setEditingSection(null);
                    }}
                    onSuccess={() => { refetchSections(); refetchSectionSubnets(); }}
                    section={editingSection as any}
                    parentSectionId={currentViewId}
                    allSections={allSections as any}
                />

                {/* Subnet Form Modal */}
                <SubnetFormModal
                    isOpen={showSubnetModal}
                    onClose={() => {
                        setShowSubnetModal(false);
                        setEditingSubnet(null);
                    }}
                    onSuccess={() => { refetchSectionSubnets(); refetchSubnetDetail(); }}
                    subnet={editingSubnet as any}
                    sectionId={viewType === "section" ? currentViewId : (subnetDetail?.section_id || currentViewId)}
                    allSections={allSections as any}
                />

                {/* Delete Confirmation Modal */}
                <DeleteConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setDeletingItem(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    title={deleteType === "section" ? "Delete Section" : "Delete Subnet"}
                    message={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
                    itemName={deletingItem ? (deleteType === "section" ? (deletingItem as SectionResponse).name : `${(deletingItem as SubnetResponse).subnet}/${(deletingItem as SubnetResponse).mask}`) : ""}
                    isLoading={isDeleting}
                />
            </PageLayout>
        </ProtectedRoute>
    );
}
