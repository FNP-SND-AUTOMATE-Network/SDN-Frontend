"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import TemplateCard from "@/components/templates/TemplateCard";
import TemplateCardSkeleton from "@/components/templates/TemplateCardSkeleton";
import CreateTemplateModal from "@/components/templates/CreateTemplateModal";
import EditTemplateModal from "@/components/templates/EditTemplateModal";
import TemplateDetailModal from "@/components/templates/TemplateDetailModal";
import Pagination from "@/components/ui/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faUpload, faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  configurationTemplateService,
  ConfigurationTemplate
} from "@/services/configurationTemplateService";
import { useAuth } from "@/contexts/AuthContext";

export default function TemplatesConfigurationPage() {
  const { token } = useAuth();
  const [templates, setTemplates] = useState<ConfigurationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalMode, setCreateModalMode] = useState<"upload" | "write">("write");

  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ConfigurationTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<ConfigurationTemplate | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 8;

  // Fetch templates function
  const fetchTemplates = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await configurationTemplateService.getTemplates(
        token,
        currentPage,
        pageSize,
        { search: searchQuery || undefined }
      );
      setTemplates(response.templates);
      setTotal(response.total);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch templates on mount and when dependencies change
  useEffect(() => {
    fetchTemplates();
  }, [token, currentPage, searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTemplateClick = async (template: ConfigurationTemplate) => {
    if (!token) return;

    // Show modal immediately with loading state
    setSelectedTemplate(template);
    setShowDetailModal(true);
    setIsFetchingDetail(true);

    try {
      // Fetch full template detail including config_content
      const fullTemplate = await configurationTemplateService.getTemplate(token, template.id);
      setSelectedTemplate(fullTemplate);
    } catch (err) {
      console.error("Failed to fetch template detail:", err);
      // Keep the basic template info if fetch fails
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTemplate(null);
  };

  const handleEditTemplate = (template: ConfigurationTemplate) => {
    setEditTemplate(template);
    setShowEditModal(true);
    handleCloseDetailModal();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditTemplate(null);
  };

  const handleEditSuccess = () => {
    fetchTemplates();
  };

  const handleDeleteTemplate = async (template: ConfigurationTemplate) => {
    if (!token) return;

    setIsDeleting(true);
    try {
      await configurationTemplateService.deleteTemplate(token, template.id);
      handleCloseDetailModal();
      fetchTemplates();
    } catch (err) {
      console.error("Failed to delete template:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleOpenNewTemplate = () => {
    setCreateModalMode("write");
    setShowCreateModal(true);
  };

  const handleOpenUploadTemplate = () => {
    setCreateModalMode("upload");
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    fetchTemplates();
  };

  return (
    <ProtectedRoute>
      <PageLayout>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent font-sf-pro-display">
            Configuration
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenNewTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              New Template
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-md">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Content */}
        {isLoading ? (
          <TemplateCardSkeleton count={8} />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setCurrentPage(1)}
              className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No templates found</p>
            <button
              onClick={handleOpenNewTemplate}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Create your first template
            </button>
          </div>
        ) : (
          <>
            {/* Templates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={handleTemplateClick}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}

        {/* Create Template Modal */}
        <CreateTemplateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          defaultMode={createModalMode}
        />

        {/* Template Detail Modal */}
        <TemplateDetailModal
          isOpen={showDetailModal}
          template={selectedTemplate}
          onClose={handleCloseDetailModal}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
          isDeleting={isDeleting}
          isLoadingContent={isFetchingDetail}
        />

        {/* Edit Template Modal */}
        <EditTemplateModal
          isOpen={showEditModal}
          template={editTemplate}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
        />
      </PageLayout>
    </ProtectedRoute>
  );
}
