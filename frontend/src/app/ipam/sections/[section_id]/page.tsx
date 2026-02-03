"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ipamService, Subnet, Section, IPAddress } from "@/services/ipamService";
import IPAMTreeSidebar from "@/components/ipam/IPAMTreeSidebar";
import SubnetsTable from "@/components/ipam/SubnetsTable";
import IPAddressesTable from "@/components/ipam/IPAddressesTable";
import SectionFormModal from "@/components/ipam/SectionFormModal";
import SubnetFormModal from "@/components/ipam/SubnetFormModal";
import DeleteConfirmModal from "@/components/ipam/DeleteConfirmModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFolder,
    faArrowLeft,
    faPlus,
    faNetworkWired,
    faEdit,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/Button";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import Link from "next/link";

type ViewType = "section" | "subnet";

export default function SectionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuth();
    const initialSectionId = params.section_id as string;

    // View state
    const [viewType, setViewType] = useState<ViewType>("section");
    const [currentViewId, setCurrentViewId] = useState<string>(initialSectionId);

    // Section data
    const [subnets, setSubnets] = useState<Subnet[]>([]);
    const [allSections, setAllSections] = useState<Section[]>([]);
    const [subSections, setSubSections] = useState<Section[]>([]);
    const [currentSection, setCurrentSection] = useState<Section | null>(null);

    // Subnet data (for subnet view)
    const [subnetDetail, setSubnetDetail] = useState<any>(null);
    const [subnetAddresses, setSubnetAddresses] = useState<IPAddress[]>([]);
    const [subnetUsage, setSubnetUsage] = useState<any>(null);
    const [childSubnets, setChildSubnets] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [showSubnetModal, setShowSubnetModal] = useState(false);
    const [editingSubnet, setEditingSubnet] = useState<Subnet | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteType, setDeleteType] = useState<"section" | "subnet">("section");
    const [deletingItem, setDeletingItem] = useState<Section | Subnet | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch all sections once on mount
    useEffect(() => {
        fetchAllSections();
    }, [token]);

    // Fetch data when view changes
    useEffect(() => {
        if (viewType === "section") {
            fetchSectionData(currentViewId);
        } else {
            fetchSubnetData(currentViewId);
        }
    }, [currentViewId, viewType, token]);

    const fetchAllSections = async () => {
        if (!token) return;
        try {
            const sectionsResponse = await ipamService.getSections(token);
            setAllSections(sectionsResponse.sections);
        } catch (err: any) {
            console.error("Error fetching sections:", err);
        }
    };

    const fetchSectionData = async (sectionId: string) => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const [subnetsResponse, sectionsResponse] = await Promise.all([
                ipamService.getSectionSubnets(token, sectionId),
                ipamService.getSections(token),
            ]);

            setSubnets(subnetsResponse.subnets);
            setAllSections(sectionsResponse.sections);

            const current = sectionsResponse.sections.find((s) => s.id === sectionId);
            setCurrentSection(current || null);

            const childSections = sectionsResponse.sections.filter(
                (s) => s.master_section === sectionId
            );
            setSubSections(childSections);
        } catch (err: any) {
            console.error("Error fetching section data:", err);
            setError(err.message || "Failed to load section data");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubnetData = async (subnetId: string) => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const [detailResponse, addressesResponse, usageResponse, childrenResponse] =
                await Promise.all([
                    ipamService.getSubnetDetail(token, subnetId),
                    ipamService.getSubnetAddresses(token, subnetId),
                    ipamService.getSubnetUsage(token, subnetId),
                    ipamService.getSubnetChildren(token, subnetId).catch(() => ({ subnets: [], total: 0 })),
                ]);

            setSubnetDetail(detailResponse);
            setSubnetAddresses(addressesResponse.addresses);
            setSubnetUsage(usageResponse);
            setChildSubnets(childrenResponse.subnets);
        } catch (err: any) {
            console.error("Error fetching subnet data:", err);
            setError(err.message || "Failed to load subnet data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectSection = (selectedSectionId: string) => {
        setViewType("section");
        setCurrentViewId(selectedSectionId);
    };

    const handleSelectSubnet = (subnetId: string) => {
        setViewType("subnet");
        setCurrentViewId(subnetId);
    };

    // Section CRUD handlers
    const handleAddSection = () => {
        setEditingSection(null);
        setShowSectionModal(true);
    };

    const handleEditSection = () => {
        if (currentSection) {
            setEditingSection(currentSection);
            setShowSectionModal(true);
        }
    };

    const handleDeleteSectionClick = () => {
        if (currentSection) {
            setDeleteType("section");
            setDeletingItem(currentSection);
            setShowDeleteModal(true);
        }
    };

    // Subnet CRUD handlers
    const handleAddSubnet = () => {
        setEditingSubnet(null);
        setShowSubnetModal(true);
    };

    const handleEditSubnet = (subnet: Subnet) => {
        setEditingSubnet(subnet);
        setShowSubnetModal(true);
    };

    const handleDeleteSubnetClick = (subnet: Subnet) => {
        setDeleteType("subnet");
        setDeletingItem(subnet);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!token || !deletingItem) return;

        setIsDeleting(true);
        try {
            if (deleteType === "section") {
                await ipamService.deleteSection(token, deletingItem.id);
                router.push("/ipam");
            } else {
                await ipamService.deleteSubnet(token, deletingItem.id);
                fetchSectionData(currentViewId);
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

    const handleSectionSuccess = () => {
        fetchAllSections();
        fetchSectionData(currentViewId);
    };

    const handleSubnetSuccess = () => {
        fetchSectionData(currentViewId);
    };

    const parentSubnets = subnets.filter((subnet) => {
        const subnetDetail = subnet as any;
        return !subnetDetail.master_subnet_id || subnetDetail.master_subnet_id === "";
    });

    const totalItems = subSections.length + parentSubnets.length;
    const usagePercent = subnetUsage?.Used_percent || 0;
    const freePercent = subnetUsage?.freehosts_percent || 0;

    return (
        <ProtectedRoute>
            <PageLayout>
                <div className="flex h-[calc(100vh-64px)]">
                    {/* Left Sidebar - Tree Navigation */}
                    <div className="w-80 flex-shrink-0">
                        <IPAMTreeSidebar
                            sections={allSections}
                            subnets={subnets}
                            currentSectionId={initialSectionId}
                            selectedId={currentViewId}
                            selectedType={viewType}
                            onSelectSection={handleSelectSection}
                            onSelectSubnet={handleSelectSubnet}
                        />
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6">
                            {/* Breadcrumb */}
                            <nav className="mb-4">
                                <ol className="flex items-center space-x-2 text-sm">
                                    <li>
                                        <Link
                                            href="/ipam"
                                            className="text-gray-500 hover:text-primary-600 transition-colors"
                                        >
                                            IPAM
                                        </Link>
                                    </li>
                                    <li className="text-gray-400">/</li>
                                    <li className="text-gray-900 font-medium">
                                        {viewType === "section"
                                            ? currentSection?.name || `Section ${currentViewId}`
                                            : `${subnetDetail?.subnet}/${subnetDetail?.mask}` || "Subnet"}
                                    </li>
                                </ol>
                            </nav>

                            {/* Content based on view type */}
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                                        <p className="mt-4 text-gray-600">Loading...</p>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800">{error}</p>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            viewType === "section"
                                                ? fetchSectionData(currentViewId)
                                                : fetchSubnetData(currentViewId)
                                        }
                                        className="mt-3"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            ) : viewType === "section" ? (
                                // Section View
                                <>
                                    {/* Header */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <button
                                                onClick={() => router.push("/ipam")}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faArrowLeft}
                                                    className="w-5 h-5 text-gray-600"
                                                />
                                            </button>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                                        <FontAwesomeIcon
                                                            icon={faFolder}
                                                            className="w-6 h-6 text-primary-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h1 className="text-3xl font-bold text-gray-900">
                                                            {currentSection?.name || "Section Details"}
                                                        </h1>
                                                        {currentSection?.description && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {currentSection.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" onClick={handleEditSection}>
                                                    <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                                    Edit
                                                </Button>
                                                <Button variant="outline" onClick={handleDeleteSectionClick} className="text-red-600 hover:bg-red-50 border-red-200">
                                                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                                    Delete
                                                </Button>
                                                <Button variant="outline" onClick={handleAddSection}>
                                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                                    Add Section
                                                </Button>
                                                <Button variant="primary" onClick={handleAddSubnet}>
                                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                                    Add Subnet
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                            <div className="text-sm text-gray-600">Sub-sections</div>
                                            <div className="text-2xl font-bold text-gray-900 mt-1">
                                                {subSections.length}
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                            <div className="text-sm text-gray-600">Subnets</div>
                                            <div className="text-2xl font-bold text-gray-900 mt-1">
                                                {parentSubnets.length}
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                            <div className="text-sm text-gray-600">Total Items</div>
                                            <div className="text-2xl font-bold text-gray-900 mt-1">
                                                {totalItems}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contents */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-semibold text-gray-900">Contents</h2>
                                            <div className="text-sm text-gray-600">
                                                {totalItems} item{totalItems !== 1 ? "s" : ""}
                                            </div>
                                        </div>

                                        {totalItems === 0 ? (
                                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                                <FontAwesomeIcon
                                                    icon={faFolder}
                                                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                                                />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    No items found
                                                </h3>
                                                <p className="text-gray-600 mb-4">
                                                    Get started by adding sections or subnets
                                                </p>
                                            </div>
                                        ) : (
                                            <SubnetsTable
                                                subnets={parentSubnets}
                                                onRefresh={() => fetchSectionData(currentViewId)}
                                            />
                                        )}
                                    </div>
                                </>
                            ) : (
                                // Subnet View
                                <div className="space-y-6">
                                    {/* Top Row: Subnet Details + Usage Graph */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Left Sidebar - Subnet Details */}
                                        <div className="lg:col-span-1">
                                            <div className="bg-gray-800 text-white space-y-4 rounded-lg shadow-sm border border-gray-200 p-7 h-full">
                                                <div>
                                                    <div className="text-sm text-gray-400 mb-1">Subnet details</div>
                                                    <div className="text-lg font-semibold">
                                                        {subnetDetail?.subnet}/{subnetDetail?.mask}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="text-sm text-gray-400 mb-1">Subnet description</div>
                                                    <div className="text-sm">{subnetDetail?.description || "-"}</div>
                                                </div>

                                                <div>
                                                    <div className="text-sm text-gray-400 mb-1">Subnet Usage</div>
                                                    <div className="text-sm">
                                                        Used: {subnetUsage?.used || 0} | Free: {subnetUsage?.freehosts || 0} (
                                                        {freePercent.toFixed(1)}%) | Total: {subnetUsage?.maxhosts || 0}
                                                    </div>
                                                </div>

                                                {/* Gateway - only show if found in IP addresses */}
                                                {(() => {
                                                    const gatewayAddress = subnetAddresses.find(
                                                        (addr: any) => addr.is_gateway === "1" || addr.is_gateway === 1
                                                    );
                                                    return gatewayAddress ? (
                                                        <div>
                                                            <div className="text-sm text-gray-400 mb-1">Gateway</div>
                                                            <div className="text-sm">{(gatewayAddress as any).ip}</div>
                                                        </div>
                                                    ) : null;
                                                })()}

                                                {subnetDetail?.vlan_id && (
                                                    <div>
                                                        <div className="text-sm text-gray-400 mb-1">VLAN</div>
                                                        <div className="text-sm">{subnetDetail.vlan_id}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Content Area - Usage Graph */}
                                        <div className="lg:col-span-2">
                                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-7 h-full">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage graph</h3>
                                                <div className="flex items-center justify-center h-64">
                                                    <div className="relative w-64 h-64">
                                                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                                            <circle
                                                                cx="50"
                                                                cy="50"
                                                                r="40"
                                                                fill="none"
                                                                stroke="#e5e7eb"
                                                                strokeWidth="20"
                                                            />
                                                            <circle
                                                                cx="50"
                                                                cy="50"
                                                                r="40"
                                                                fill="none"
                                                                stroke="#10b981"
                                                                strokeWidth="20"
                                                                strokeDasharray={`${usagePercent * 2.51} 251`}
                                                                className="transition-all duration-500"
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="text-center">
                                                                <div className="text-3xl font-bold text-gray-900">
                                                                    {usagePercent.toFixed(1)}%
                                                                </div>
                                                                <div className="text-sm text-gray-600">Used</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Child Subnets - Full Width */}
                                    {childSubnets.length > 0 && (
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                                Child Subnets
                                            </h2>
                                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                                <div className="divide-y divide-gray-100">
                                                    {childSubnets.map((childSubnet) => (
                                                        <div
                                                            key={childSubnet.id}
                                                            onClick={() => handleSelectSubnet(childSubnet.id)}
                                                            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                                        >
                                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                <FontAwesomeIcon
                                                                    icon={faNetworkWired}
                                                                    className="w-5 h-5 text-green-600"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-sm font-semibold text-gray-900">
                                                                    {childSubnet.subnet}/{childSubnet.mask}
                                                                </h3>
                                                                {childSubnet.description && (
                                                                    <p className="text-xs text-gray-600 truncate mt-0.5">
                                                                        {childSubnet.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* IP Addresses - Full Width */}
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                            IP Addresses
                                        </h2>
                                        {subnetAddresses.length === 0 ? (
                                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                                <FontAwesomeIcon
                                                    icon={faNetworkWired}
                                                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                                                />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    No IP addresses found
                                                </h3>
                                            </div>
                                        ) : (
                                            <IPAddressesTable
                                                addresses={subnetAddresses}
                                                onRefresh={() => fetchSubnetData(currentViewId)}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Section Form Modal */}
                <SectionFormModal
                    isOpen={showSectionModal}
                    onClose={() => {
                        setShowSectionModal(false);
                        setEditingSection(null);
                    }}
                    onSuccess={handleSectionSuccess}
                    section={editingSection}
                    parentSectionId={currentViewId}
                    allSections={allSections}
                />

                {/* Subnet Form Modal */}
                <SubnetFormModal
                    isOpen={showSubnetModal}
                    onClose={() => {
                        setShowSubnetModal(false);
                        setEditingSubnet(null);
                    }}
                    onSuccess={handleSubnetSuccess}
                    subnet={editingSubnet}
                    sectionId={viewType === "section" ? currentViewId : (subnetDetail?.section_id || currentViewId)}
                    allSections={allSections}
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
                    itemName={deletingItem ? (deleteType === "section" ? (deletingItem as Section).name : `${(deletingItem as Subnet).subnet}/${(deletingItem as Subnet).mask}`) : ""}
                    isLoading={isDeleting}
                />
            </PageLayout>
        </ProtectedRoute>
    );
}
