"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ipamService, Section } from "@/services/ipamService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFolder,
    faFolderOpen,
    faNetworkWired,
    faChevronRight,
    faChevronDown,
    faPlus,
    faEdit,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/Button";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import SectionFormModal from "@/components/ipam/SectionFormModal";
import DeleteConfirmModal from "@/components/ipam/DeleteConfirmModal";
import IPAMSkeleton from "@/components/ipam/IPAMSkeleton";
import Link from "next/link";

export default function IPAMPage() {
    const router = useRouter();
    const { token } = useAuth();
    const [sections, setSections] = useState<Section[]>([]);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingSection, setDeletingSection] = useState<Section | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchSections();
    }, [token]);

    const fetchSections = async () => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await ipamService.getSections(token);
            setSections(response.sections);
        } catch (err: any) {
            console.error("Error fetching sections:", err);
            setError(err.message || "Failed to load sections");
        } finally {
            setIsLoading(false);
        }
    };

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

    const handleEditSection = (section: Section, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setEditingSection(section);
        setShowSectionModal(true);
    };

    const handleDeleteClick = (section: Section, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setDeletingSection(section);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!token || !deletingSection) return;

        setIsDeleting(true);
        try {
            await ipamService.deleteSection(token, deletingSection.id);
            setShowDeleteModal(false);
            setDeletingSection(null);
            fetchSections();
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

    const renderSection = (section: Section, level: number = 0) => {
        const subSections = getSubSections(section.id);
        const hasChildren = subSections.length > 0;
        const isExpanded = expandedSections.has(section.id);
        const paddingLeft = level * 24 + 16;

        return (
            <div key={section.id}>
                <div
                    className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 border-b border-gray-100 transition-colors group"
                    style={{ paddingLeft: `${paddingLeft}px` }}
                >
                    {hasChildren ? (
                        <button
                            onClick={(e) => toggleSection(section.id, e)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FontAwesomeIcon
                                icon={isExpanded ? faChevronDown : faChevronRight}
                                className="w-4 h-4"
                            />
                        </button>
                    ) : (
                        <div className="w-4" />
                    )}
                    <FontAwesomeIcon
                        icon={isExpanded ? faFolderOpen : faFolder}
                        className="w-5 h-5 text-blue-500"
                    />
                    <Link
                        href={`/ipam/sections/${section.id}`}
                        className="flex-1 text-gray-900 font-medium hover:text-primary-600"
                    >
                        {section.name}
                    </Link>
                    {section.description && (
                        <span className="text-sm text-gray-500 truncate max-w-xs">
                            {section.description}
                        </span>
                    )}
                    {/* Action buttons */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => handleEditSection(section, e)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Section"
                        >
                            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => handleDeleteClick(section, e)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Section"
                        >
                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {isExpanded && subSections.map((sub) => renderSection(sub, level + 1))}
            </div>
        );
    };

    return (
        <ProtectedRoute>
            <PageLayout>
                {isLoading ? (
                    <IPAMSkeleton />
                ) : (
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    IP Address Management
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Manage your IP address space, subnets, and VLANs
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="primary" onClick={handleAddSection}>
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                    Add Section
                                </Button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon icon={faFolder} className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Total Sections</div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {sections.length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon icon={faNetworkWired} className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Root Sections</div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {rootSections.length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon icon={faFolder} className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Sub-sections</div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {sections.length - rootSections.length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sections List */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Sections</h2>
                            </div>

                            {error ? (
                                <div className="p-6">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-800">{error}</p>
                                        <Button variant="outline" onClick={fetchSections} className="mt-3">
                                            Retry
                                        </Button>
                                    </div>
                                </div>
                            ) : rootSections.length === 0 ? (
                                <div className="p-12 text-center">
                                    <FontAwesomeIcon
                                        icon={faFolder}
                                        className="w-16 h-16 text-gray-300 mx-auto mb-4"
                                    />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No sections found
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Get started by creating your first section
                                    </p>
                                    <Button variant="primary" onClick={handleAddSection}>
                                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                        Add Section
                                    </Button>
                                </div>
                            ) : (
                                <div>{rootSections.map((section) => renderSection(section, 0))}</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Section Form Modal */}
                <SectionFormModal
                    isOpen={showSectionModal}
                    onClose={() => {
                        setShowSectionModal(false);
                        setEditingSection(null);
                    }}
                    onSuccess={fetchSections}
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
