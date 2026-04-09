"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { fetchClient, $api } from "@/lib/apiv2/fetch";
import { components } from "@/lib/apiv2/schema";
import IPAddressesTable from "@/components/ipam/IPAddressesTable";
import SubnetFormModal from "@/components/ipam/SubnetFormModal";
import IPAddressFormModal from "@/components/ipam/IPAddressFormModal";
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
    Tabs,
    Tab,
    Alert,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import {
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    AccountTree as AccountTreeIcon,
} from "@mui/icons-material";

type SubnetResponse = components["schemas"]["SubnetResponse"];
type IPAddressResponse = components["schemas"]["IpAddressResponse"];

export default function SubnetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const subnetId = params.subnet_id as string;

    const [activeTab, setActiveTab] = useState<"details" | "spacemap">("details");

    // Modal states
    const [showSubnetModal, setShowSubnetModal] = useState(false);
    const [editingSubnet, setEditingSubnet] = useState<SubnetResponse | null>(null);
    const [showIPModal, setShowIPModal] = useState(false);
    const [editingIP, setEditingIP] = useState<IPAddressResponse | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteType, setDeleteType] = useState<"subnet" | "ip">("subnet");
    const [deletingItem, setDeletingItem] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- React Query Data Fetching ---

    const { data: sectionsData } = $api.useQuery(
        "get",
        "/ipam/sections",
        {},
        { enabled: isAuthenticated }
    );
    const allSections = sectionsData?.sections || [];

    const {
        data: subnetDetailData,
        isLoading: isLoadingSubnetDetail,
        error: subnetError,
        refetch: refetchSubnetDetail,
    } = $api.useQuery(
        "get",
        "/ipam/subnets/{subnet_id}",
        { params: { path: { subnet_id: subnetId } } },
        { enabled: isAuthenticated }
    );

    const {
        data: subnetAddressesData,
        refetch: refetchSubnetAddresses,
    } = $api.useQuery(
        "get",
        "/ipam/subnets/{subnet_id}/addresses",
        { params: { path: { subnet_id: subnetId } } },
        { enabled: isAuthenticated }
    );

    const { data: subnetUsageData } = $api.useQuery(
        "get",
        "/ipam/subnets/{subnet_id}/usage",
        { params: { path: { subnet_id: subnetId } } },
        { enabled: isAuthenticated }
    );

    const { data: childSubnetsData, refetch: refetchChildSubnets } = $api.useQuery(
        "get",
        "/ipam/subnets/{subnet_id}/children",
        { params: { path: { subnet_id: subnetId } } },
        { enabled: isAuthenticated }
    );

    const subnetDetail = subnetDetailData as any;
    const addresses = subnetAddressesData?.addresses || [];
    const childSubnets = childSubnetsData?.subnets || [];
    const usage = subnetUsageData as any;
    
    // Handlers
    const handleAddChildSubnet = () => {
        setEditingSubnet(null);
        setShowSubnetModal(true);
    };

    const handleEditChildSubnet = (subnet: SubnetResponse, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSubnet(subnet);
        setShowSubnetModal(true);
    };

    const handleDeleteChildSubnetClick = (subnet: SubnetResponse, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteType("subnet");
        setDeletingItem(subnet);
        setShowDeleteModal(true);
    };

    const handleAddIP = () => {
        setEditingIP(null);
        setShowIPModal(true);
    };

    const handleEditIP = (ip: IPAddressResponse) => {
        setEditingIP(ip);
        setShowIPModal(true);
    };

    const handleDeleteIPClick = (ip: IPAddressResponse) => {
        setDeleteType("ip");
        setDeletingItem(ip);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingItem) return;
        setIsDeleting(true);
        try {
            if (deleteType === "subnet") {
                await fetchClient.DELETE("/ipam/subnets/{subnet_id}", {
                    params: { path: { subnet_id: deletingItem.id } }
                });
                if (deletingItem.id === subnetId) {
                    router.push("/ipam");
                } else {
                    refetchChildSubnets();
                }
            } else {
                await fetchClient.DELETE("/ipam/addresses/{address_id}", {
                    params: { path: { address_id: deletingItem.id } }
                });
                refetchSubnetAddresses();
            }
            setShowDeleteModal(false);
            setDeletingItem(null);
        } catch (err: any) {
            console.error(`Error deleting ${deleteType}:`, err);
            alert(err.message || `Failed to delete ${deleteType}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditCurrentSubnet = () => {
        if (subnetDetail) {
            setEditingSubnet(subnetDetail as SubnetResponse);
            setShowSubnetModal(true);
        }
    };

    const handleDeleteCurrentSubnet = () => {
        if (subnetDetail) {
            setDeleteType("subnet");
            setDeletingItem(subnetDetail as SubnetResponse);
            setShowDeleteModal(true);
        }
    };

    const usagePercent = parseFloat(usage?.Used_percent ?? usage?.used_percent ?? 0) || 0;
    const freePercent = parseFloat(usage?.freehosts_percent ?? 0) || 0;

    return (
        <ProtectedRoute>
            <PageLayout>
                <Box sx={{ p: 4 }}>
                    {/* Breadcrumbs */}
                    <Breadcrumbs separator="/" sx={{ mb: 3 }}>
                        <Link href="/ipam" style={{ textDecoration: "none" }}>
                            <Typography color="text.secondary" sx={{ "&:hover": { color: "primary.main" } }}>IPAM</Typography>
                        </Link>
                        {subnetDetail?.section_id && (
                            <Link href={`/ipam/sections/${subnetDetail.section_id}`} style={{ textDecoration: "none" }}>
                                <Typography color="text.secondary" sx={{ "&:hover": { color: "primary.main" } }}>Section</Typography>
                            </Link>
                        )}
                        <Typography color="text.primary" fontWeight="medium">
                            {subnetDetail ? `${subnetDetail.subnet}/${subnetDetail.mask}` : "Subnet"}
                        </Typography>
                    </Breadcrumbs>

                    {/* Header */}
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <IconButton onClick={() => router.back()} sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography variant="h4" fontWeight="bold" color="text.primary">
                                Subnet details
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEditCurrentSubnet}>
                                Edit Subnet
                            </Button>
                            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteCurrentSubnet}>
                                Delete
                            </Button>
                        </Box>
                    </Box>

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
                            <Tab label="Subnet details" value="details" />
                            <Tab label="Space map" value="spacemap" />
                        </Tabs>
                    </Box>

                    {/* Content */}
                    {isLoadingSubnetDetail ? (
                        <Box sx={{ display: "flex", height: 200, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
                            <CircularProgress />
                            <Typography color="text.secondary">Loading...</Typography>
                        </Box>
                    ) : subnetError ? (
                        <Alert 
                            severity="error" 
                            action={<Button color="inherit" size="small" onClick={() => refetchSubnetDetail()}>Retry</Button>}
                        >
                            {(subnetError as any)?.message || "Failed to load data"}
                        </Alert>
                    ) : (
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 2fr" }, gap: 3 }}>
                            {/* Left Sidebar - Subnet Details */}
                            <Card sx={{ bgcolor: "grey.900", color: "common.white", p: 3, height: "fit-content", borderRadius: 2 }}>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                    <Box>
                                        <Typography variant="body2" color="grey.500" gutterBottom>Subnet details</Typography>
                                        <Typography variant="h6" fontWeight="semibold">
                                            {subnetDetail?.subnet}/{subnetDetail?.mask}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" color="grey.500" gutterBottom>Hierarchy</Typography>
                                        <Typography variant="body2">
                                            {subnetDetail?.master_subnet_id ? "Child subnet" : "Root subnet"}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" color="grey.500" gutterBottom>Description</Typography>
                                        <Typography variant="body2">{subnetDetail?.description || "-"}</Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" color="grey.500" gutterBottom>Usage</Typography>
                                        <Typography variant="body2">
                                            Used: {parseFloat(usage?.used ?? 0) || 0} | Free: {parseFloat(usage?.freehosts ?? 0) || 0} ({freePercent.toFixed(1)}%) | Total: {parseFloat(usage?.maxhosts ?? 0) || 0}
                                        </Typography>
                                    </Box>

                                    {(() => {
                                        const gatewayAddress = addresses.find(
                                            (addr: any) => addr.is_gateway === "1" || addr.is_gateway === 1
                                        );
                                        return gatewayAddress ? (
                                            <Box>
                                                <Typography variant="body2" color="grey.500" gutterBottom>Gateway</Typography>
                                                <Typography variant="body2">{(gatewayAddress as any).ip}</Typography>
                                            </Box>
                                        ) : null;
                                    })()}

                                    {subnetDetail?.vlan_id && (
                                        <Box>
                                            <Typography variant="body2" color="grey.500" gutterBottom>VLAN</Typography>
                                            <Typography variant="body2">{subnetDetail.vlan_id}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Card>

                            {/* Right Content Area */}
                            {activeTab === "details" ? (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                    {/* Usage Graph */}
                                    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: 4, borderRadius: 2 }}>
                                        <Typography variant="h6" fontWeight="semibold" gutterBottom>Usage graph</Typography>
                                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 250 }}>
                                            <Box sx={{ position: "relative", width: 220, height: 220 }}>
                                                <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="40"
                                                        fill="none"
                                                        stroke="#10b981"
                                                        strokeWidth="20"
                                                        strokeDasharray={`${usagePercent * 2.51} 251`}
                                                        style={{ transition: "stroke-dasharray 0.5s ease" }}
                                                    />
                                                </svg>
                                                <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                    <Typography variant="h3" fontWeight="bold">{usagePercent.toFixed(1)}%</Typography>
                                                    <Typography variant="body1" color="text.secondary">Used</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 2 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Box sx={{ width: 16, height: 16, bgcolor: "#10b981", borderRadius: 1 }} />
                                                <Typography variant="body2" color="text.secondary">Used</Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Box sx={{ width: 16, height: 16, bgcolor: "#e5e7eb", borderRadius: 1 }} />
                                                <Typography variant="body2" color="text.secondary">Free</Typography>
                                            </Box>
                                        </Box>
                                    </Card>

                                    {/* Child Subnets - only show for root subnets */}
                                    {!subnetDetail?.master_subnet_id && (
                                        <Box>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                                <Typography variant="h6" fontWeight="semibold">Child Subnets ({childSubnets.length})</Typography>
                                                <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddChildSubnet}>
                                                    Add Child Subnet
                                                </Button>
                                            </Box>

                                            {childSubnets.length === 0 ? (
                                                <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                                    <AccountTreeIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                                                    <Typography color="text.secondary">No child subnets yet</Typography>
                                                </Paper>
                                            ) : (
                                                <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                                    <List disablePadding>
                                                        {childSubnets.map((childSubnet: any, i: number) => (
                                                            <div key={childSubnet.id}>
                                                                {i > 0 && <Divider />}
                                                                <ListItemButton
                                                                    component={Link}
                                                                    href={`/ipam/subnets/${childSubnet.id}`}
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
                                                                        primaryTypographyProps={{ fontWeight: "semibold", color: "text.primary" }}
                                                                    />
                                                                    <Box sx={{ display: "flex", gap: 1, opacity: 0.5, "&:hover": { opacity: 1 } }}>
                                                                        <IconButton size="small" onClick={(e) => handleEditChildSubnet(childSubnet, e)}>
                                                                            <EditIcon fontSize="small" />
                                                                        </IconButton>
                                                                        <IconButton size="small" color="error" onClick={(e) => handleDeleteChildSubnetClick(childSubnet, e)}>
                                                                            <DeleteIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Box>
                                                                </ListItemButton>
                                                            </div>
                                                        ))}
                                                    </List>
                                                </Paper>
                                            )}
                                        </Box>
                                    )}

                                    {/* IP Addresses */}
                                    <Box>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                            <Typography variant="h6" fontWeight="semibold">IP Addresses ({addresses.length})</Typography>
                                            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddIP}>
                                                Add IP Address
                                            </Button>
                                        </Box>

                                        {addresses.length === 0 ? (
                                            <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                                <AccountTreeIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                                                <Typography variant="h6" gutterBottom>No IP addresses found</Typography>
                                                <Typography color="text.secondary">Get started by adding your first IP address</Typography>
                                            </Paper>
                                        ) : (
                                            <IPAddressesTable
                                                addresses={addresses}
                                                onRefresh={refetchSubnetAddresses}
                                                onEdit={handleEditIP as any}
                                                onDelete={handleDeleteIPClick as any}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            ) : (
                                <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                    <Typography color="text.secondary">Space map view coming soon...</Typography>
                                </Paper>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Subnet Form Modal */}
                <SubnetFormModal
                    isOpen={showSubnetModal}
                    onClose={() => {
                        setShowSubnetModal(false);
                        setEditingSubnet(null);
                    }}
                    onSuccess={() => { refetchSubnetDetail(); refetchChildSubnets(); }}
                    subnet={editingSubnet as any}
                    sectionId={subnetDetail?.section_id || ""}
                    parentSubnetId={editingSubnet ? undefined : subnetId}
                    allSections={allSections as any}
                />

                {/* IP Address Form Modal */}
                <IPAddressFormModal
                    isOpen={showIPModal}
                    onClose={() => {
                        setShowIPModal(false);
                        setEditingIP(null);
                    }}
                    onSuccess={refetchSubnetAddresses}
                    address={editingIP as any}
                    subnetId={subnetId}
                />

                {/* Delete Confirmation Modal */}
                <DeleteConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setDeletingItem(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    title={deleteType === "subnet" ? "Delete Subnet" : "Delete IP Address"}
                    message={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
                    itemName={deletingItem ? (deleteType === "subnet" ? `${deletingItem.subnet}/${deletingItem.mask}` : deletingItem.ip) : ""}
                    isLoading={isDeleting}
                />
            </PageLayout>
        </ProtectedRoute>
    );
}
