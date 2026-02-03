"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ipamService, IPAddress, Subnet, Section } from "@/services/ipamService";
import IPAddressesTable from "@/components/ipam/IPAddressesTable";
import SubnetFormModal from "@/components/ipam/SubnetFormModal";
import IPAddressFormModal from "@/components/ipam/IPAddressFormModal";
import DeleteConfirmModal from "@/components/ipam/DeleteConfirmModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faNetworkWired,
    faArrowLeft,
    faPlus,
    faEdit,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/Button";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import Link from "next/link";

export default function SubnetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuth();
    const subnetId = params.subnet_id as string;

    const [addresses, setAddresses] = useState<IPAddress[]>([]);
    const [childSubnets, setChildSubnets] = useState<any[]>([]);
    const [subnetDetail, setSubnetDetail] = useState<any>(null);
    const [usage, setUsage] = useState<any>(null);
    const [allSections, setAllSections] = useState<Section[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"details" | "spacemap">("details");

    // Modal states
    const [showSubnetModal, setShowSubnetModal] = useState(false);
    const [editingSubnet, setEditingSubnet] = useState<Subnet | null>(null);
    const [showIPModal, setShowIPModal] = useState(false);
    const [editingIP, setEditingIP] = useState<IPAddress | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteType, setDeleteType] = useState<"subnet" | "ip">("subnet");
    const [deletingItem, setDeletingItem] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchData();
        fetchSections();
    }, [subnetId, token]);

    const fetchSections = async () => {
        if (!token) return;
        try {
            const response = await ipamService.getSections(token);
            setAllSections(response.sections);
        } catch (err) {
            console.error("Error fetching sections:", err);
        }
    };

    const fetchData = async () => {
        if (!token || !subnetId) return;

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
            setAddresses(addressesResponse.addresses);
            setUsage(usageResponse);
            setChildSubnets(childrenResponse.subnets);
        } catch (err: any) {
            console.error("Error fetching data:", err);
            setError(err.message || "Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    // Child Subnet CRUD handlers
    const handleAddChildSubnet = () => {
        setEditingSubnet(null);
        setShowSubnetModal(true);
    };

    const handleEditChildSubnet = (subnet: Subnet, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingSubnet(subnet);
        setShowSubnetModal(true);
    };

    const handleDeleteChildSubnetClick = (subnet: Subnet, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteType("subnet");
        setDeletingItem(subnet);
        setShowDeleteModal(true);
    };

    // IP Address CRUD handlers
    const handleAddIP = () => {
        setEditingIP(null);
        setShowIPModal(true);
    };

    const handleEditIP = (ip: IPAddress) => {
        setEditingIP(ip);
        setShowIPModal(true);
    };

    const handleDeleteIPClick = (ip: IPAddress) => {
        setDeleteType("ip");
        setDeletingItem(ip);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!token || !deletingItem) return;

        setIsDeleting(true);
        try {
            if (deleteType === "subnet") {
                await ipamService.deleteSubnet(token, deletingItem.id);
            } else {
                await ipamService.deleteIPAddress(token, deletingItem.id);
            }
            setShowDeleteModal(false);
            setDeletingItem(null);
            fetchData();
        } catch (err: any) {
            console.error(`Error deleting ${deleteType}:`, err);
            alert(err.message || `Failed to delete ${deleteType}`);
        } finally {
            setIsDeleting(false);
        }
    };

    // Edit current subnet
    const handleEditCurrentSubnet = () => {
        if (subnetDetail) {
            setEditingSubnet(subnetDetail);
            setShowSubnetModal(true);
        }
    };

    // Delete current subnet
    const handleDeleteCurrentSubnet = () => {
        if (subnetDetail) {
            setDeleteType("subnet");
            setDeletingItem(subnetDetail);
            setShowDeleteModal(true);
        }
    };

    const usagePercent = usage?.Used_percent || 0;
    const freePercent = usage?.freehosts_percent || 0;

    return (
        <ProtectedRoute>
            <PageLayout>
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
                            {subnetDetail?.section_id && (
                                <>
                                    <li>
                                        <Link
                                            href={`/ipam/sections/${subnetDetail.section_id}`}
                                            className="text-gray-500 hover:text-primary-600 transition-colors"
                                        >
                                            Section
                                        </Link>
                                    </li>
                                    <li className="text-gray-400">/</li>
                                </>
                            )}
                            <li className="text-gray-900 font-medium">
                                {subnetDetail
                                    ? `${subnetDetail.subnet}/${subnetDetail.mask}`
                                    : "Subnet"}
                            </li>
                        </ol>
                    </nav>

                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FontAwesomeIcon
                                        icon={faArrowLeft}
                                        className="w-5 h-5 text-gray-600"
                                    />
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900">Subnet details</h1>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleEditCurrentSubnet}>
                                    <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                    Edit Subnet
                                </Button>
                                <Button variant="outline" onClick={handleDeleteCurrentSubnet} className="text-red-600 hover:bg-red-50 border-red-200">
                                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab("details")}
                                className={`px-4 py-2 border-b-2 transition-colors ${activeTab === "details"
                                    ? "border-primary-600 text-primary-600 font-medium"
                                    : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Subnet details
                            </button>
                            <button
                                onClick={() => setActiveTab("spacemap")}
                                className={`px-4 py-2 border-b-2 transition-colors ${activeTab === "spacemap"
                                    ? "border-primary-600 text-primary-600 font-medium"
                                    : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Space map
                            </button>
                        </div>
                    </div>

                    {/* Content */}
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
                            <Button variant="outline" onClick={fetchData} className="mt-3">
                                Retry
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Sidebar - Subnet Details */}
                            <div className="lg:col-span-1">
                                <div className="bg-gray-800 text-white rounded-lg p-6 space-y-4">
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Subnet details</div>
                                        <div className="text-lg font-semibold">
                                            {subnetDetail?.subnet}/{subnetDetail?.mask}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Hierarchy</div>
                                        <div className="text-sm">
                                            {subnetDetail?.master_subnet_id ? (
                                                <span>Child subnet</span>
                                            ) : (
                                                <span>Root subnet</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Subnet description</div>
                                        <div className="text-sm">
                                            {subnetDetail?.description || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Subnet Usage</div>
                                        <div className="text-sm">
                                            Used: {usage?.used || 0} | Free: {usage?.freehosts || 0} ({freePercent.toFixed(1)}%) | Total: {usage?.maxhosts || 0}
                                        </div>
                                    </div>

                                    {/* Gateway from IP addresses */}
                                    {(() => {
                                        const gatewayAddress = addresses.find(
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

                            {/* Right Content Area */}
                            <div className="lg:col-span-2">
                                {activeTab === "details" ? (
                                    <div className="space-y-6">
                                        {/* Usage Graph */}
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                Usage graph
                                            </h3>
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
                                            <div className="mt-4 flex justify-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                                                    <span className="text-sm text-gray-700">Used</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                                    <span className="text-sm text-gray-700">Free</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Child Subnets - only show for root subnets */}
                                        {!subnetDetail?.master_subnet_id && (
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h2 className="text-xl font-semibold text-gray-900">
                                                        Child Subnets ({childSubnets.length})
                                                    </h2>
                                                    <Button variant="outline" size="sm" onClick={handleAddChildSubnet}>
                                                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                                        Add Child Subnet
                                                    </Button>
                                                </div>
                                                {childSubnets.length === 0 ? (
                                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                                                        <FontAwesomeIcon
                                                            icon={faNetworkWired}
                                                            className="w-12 h-12 text-gray-300 mx-auto mb-3"
                                                        />
                                                        <p className="text-gray-600">No child subnets yet</p>
                                                    </div>
                                                ) : (
                                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                                        <div className="divide-y divide-gray-100">
                                                            {childSubnets.map((childSubnet) => (
                                                                <div
                                                                    key={childSubnet.id}
                                                                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors group"
                                                                >
                                                                    <Link
                                                                        href={`/ipam/subnets/${childSubnet.id}`}
                                                                        className="flex items-center gap-3 flex-1 min-w-0"
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
                                                                    </Link>
                                                                    {/* Action buttons */}
                                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button
                                                                            onClick={(e) => handleEditChildSubnet(childSubnet, e)}
                                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                            title="Edit Subnet"
                                                                        >
                                                                            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => handleDeleteChildSubnetClick(childSubnet, e)}
                                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                            title="Delete Subnet"
                                                                        >
                                                                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* IP Addresses */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-xl font-semibold text-gray-900">
                                                    IP Addresses ({addresses.length})
                                                </h2>
                                                <Button variant="primary" onClick={handleAddIP}>
                                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                                    Add IP Address
                                                </Button>
                                            </div>
                                            {addresses.length === 0 ? (
                                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                                    <FontAwesomeIcon
                                                        icon={faNetworkWired}
                                                        className="w-16 h-16 text-gray-300 mx-auto mb-4"
                                                    />
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        No IP addresses found
                                                    </h3>
                                                    <p className="text-gray-600 mb-4">
                                                        Get started by adding your first IP address
                                                    </p>
                                                </div>
                                            ) : (
                                                <IPAddressesTable
                                                    addresses={addresses}
                                                    onRefresh={fetchData}
                                                    onEdit={handleEditIP}
                                                    onDelete={handleDeleteIPClick}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                        <p className="text-gray-600">Space map view coming soon...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Subnet Form Modal */}
                <SubnetFormModal
                    isOpen={showSubnetModal}
                    onClose={() => {
                        setShowSubnetModal(false);
                        setEditingSubnet(null);
                    }}
                    onSuccess={fetchData}
                    subnet={editingSubnet}
                    sectionId={subnetDetail?.section_id || ""}
                    parentSubnetId={editingSubnet ? undefined : subnetId}
                    allSections={allSections}
                />

                {/* IP Address Form Modal */}
                <IPAddressFormModal
                    isOpen={showIPModal}
                    onClose={() => {
                        setShowIPModal(false);
                        setEditingIP(null);
                    }}
                    onSuccess={fetchData}
                    address={editingIP}
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
                    message={`Are you sure you want to delete this ${deleteType === "subnet" ? "subnet" : "IP address"}? This action cannot be undone.`}
                    itemName={deletingItem ? (deleteType === "subnet" ? `${deletingItem.subnet}/${deletingItem.mask}` : deletingItem.ip) : ""}
                    isLoading={isDeleting}
                />
            </PageLayout>
        </ProtectedRoute>
    );
}
