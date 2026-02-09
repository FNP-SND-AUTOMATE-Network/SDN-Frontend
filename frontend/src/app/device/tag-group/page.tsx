"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import {
  tagService,
  Tag,
  TagCreateRequest,
  TagUpdateRequest,
} from "@/services/tagService";
import {
  TagHeader,
  TagTable,
  TagModal,
  TagSkeleton,
  TagTableSkeleton,
  TagPagination,
} from "@/components/device/tag-group";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function DeviceTagGroupPage() {
  const { token, user } = useAuth();
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();

  const [tags, setTags] = useState<Tag[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFirstLoadRef = useRef(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    type: "",
  });

  // Debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    tag: Tag | null;
  }>({
    isOpen: false,
    mode: "add",
    tag: null,
  });

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    tagId: string | null;
    tagName: string;
  }>({
    isOpen: false,
    tagId: null,
    tagName: "",
  });

  // Fetch tags
  const fetchTags = useCallback(async () => {
    if (!token) return;

    try {
      if (isFirstLoadRef.current) {
        setIsInitialLoading(true);
      } else {
        setIsDataLoading(true);
      }
      setError(null);
      const response = await tagService.getTags(
        token,
        pagination.page,
        pagination.pageSize,
        {
          search: debouncedSearch || undefined,
          include_usage: true,
        }
      );
      setTags(response.tags);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));

      // Mark first load as complete
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
      }
    } catch (err) {
      console.error("Error fetching tags:", err);
      setError("Unable to load tag data");
    } finally {
      setIsInitialLoading(false);
      setIsDataLoading(false);
    }
  }, [token, pagination.page, pagination.pageSize, debouncedSearch]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Modal handlers
  const openAddModal = () => {
    setModalState({
      isOpen: true,
      mode: "add",
      tag: null,
    });
  };

  const openEditModal = (tag: Tag) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      tag: tag,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: "add",
      tag: null,
    });
  };

  const handleModalSuccess = () => {
    fetchTags();
  };

  // CRUD operations
  const handleCreateTag = async (data: TagCreateRequest) => {
    if (!token) return;

    try {
      await tagService.createTag(token, data);
      showSuccess("Tag created successfully");
      await fetchTags();
    } catch (err: any) {
      console.error("Error creating tag:", err);
      showError(err.message || "Unable to create tag");
      throw err;
    }
  };

  const handleUpdateTag = async (data: TagUpdateRequest) => {
    if (!token || !modalState.tag) return;

    try {
      await tagService.updateTag(token, modalState.tag.tag_id, data);
      showSuccess("Tag updated successfully");
      await fetchTags();
    } catch (err: any) {
      console.error("Error updating tag:", err);
      showError(err.message || "Unable to update tag");
      throw err;
    }
  };

  const handleModalSubmit = async (data: TagCreateRequest | TagUpdateRequest) => {
    if (modalState.mode === "add") {
      await handleCreateTag(data as TagCreateRequest);
    } else {
      await handleUpdateTag(data as TagUpdateRequest);
    }
  };

  // Delete handlers
  const openDeleteConfirm = (tagId: string, tagName: string) => {
    setConfirmModal({
      isOpen: true,
      tagId: tagId,
      tagName: tagName,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      tagId: null,
      tagName: "",
    });
  };

  const deleteTag = async () => {
    if (!token || !confirmModal.tagId) return;

    try {
      await tagService.deleteTag(token, confirmModal.tagId);
      showSuccess("Tag deleted successfully");
      closeConfirmModal();
      await fetchTags();
    } catch (err: any) {
      console.error("Error deleting tag:", err);
      showError(err.message || "Unable to delete tag");
    }
  };

  // Filter handlers
  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (type: string) => {
    setFilters((prev) => ({ ...prev, type: type }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Pagination handler
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Check permissions
  const canCreateOrEdit =
    user?.role === "ENGINEER" || user?.role === "ADMIN" || user?.role === "OWNER";
  const canDelete = user?.role === "ADMIN" || user?.role === "OWNER";

  // Filter tags by type on client side (since API doesn't support type filter)
  const filteredTags = filters.type
    ? tags.filter((tag) => tag.type === filters.type)
    : tags;

  return (
    <ProtectedRoute>
      <PageLayout>
        {isInitialLoading ? (
          <TagSkeleton />
        ) : (
          <>
            <TagHeader
              onAddTag={openAddModal}
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              searchTerm={filters.search}
              selectedType={filters.type}
              totalTags={pagination.total}
              osTags={tags.reduce((sum, t) => sum + (t.os_count || 0), 0)}
              deviceTags={tags.reduce((sum, t) => sum + (t.device_count || 0), 0)}
              totalUsage={tags.reduce((sum, t) => sum + (t.total_usage || 0), 0)}
            />

            {isDataLoading ? (
              <TagTableSkeleton />
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-red-600 mb-4">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 font-sf-pro-display">
                  Error Occurred
                </h3>
                <p className="text-gray-600 font-sf-pro-text">{error}</p>
              </div>
            ) : (
              <>
                <TagTable
                  tags={filteredTags}
                  onEditTag={canCreateOrEdit ? openEditModal : () => { }}
                  onDeleteTag={canDelete ? openDeleteConfirm : () => { }}
                />

                {pagination.total > pagination.pageSize && (
                  <TagPagination
                    currentPage={pagination.page}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* Tag Modal */}
        {canCreateOrEdit && (
          <TagModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            onSuccess={handleModalSuccess}
            mode={modalState.mode}
            tag={modalState.tag}
            onSubmit={handleModalSubmit}
          />
        )}

        {/* Confirm Delete Modal */}
        {canDelete && (
          <ConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={closeConfirmModal}
            onConfirm={deleteTag}
            title="Confirm Delete Tag"
            message={`Are you sure you want to delete tag "${confirmModal.tagName}"?`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
          />
        )}

        {/* Snackbar Notifications */}
        <MuiSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={hideSnackbar}
          title={snackbar.title}
        />
      </PageLayout>
    </ProtectedRoute>
  );
}
