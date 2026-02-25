"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { $api, fetchClient } from "@/lib/apiv2/fetch";
import { components } from "@/lib/apiv2/schema";

type TagResponse = components["schemas"]["TagResponse"];
type TagCreate = components["schemas"]["TagCreate"];
type TagUpdate = components["schemas"]["TagUpdate"];
import {
  TagHeader,
  TagTable,
  CreateTagModal,
  EditTagModal,
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

  const [isDataLoading, setIsDataLoading] = useState(false);

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
    tag: TagResponse | null;
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

  // Fetch tags using React Query
  const { data, isLoading: isInitialLoading, error, refetch } = $api.useQuery(
    "get",
    "/tags/",
    {
      params: {
        query: {
          page: pagination.page,
          page_size: pagination.pageSize,
          search: debouncedSearch || undefined,
          include_usage: true,
        },
      },
    },
    { enabled: !!token }
  );

  const tags = data?.tags || [];

  useEffect(() => {
    if (data) {
      setPagination((prev) => ({
        ...prev,
        total: data.total,
      }));
    }
  }, [data]);

  // Modal handlers
  const openAddModal = () => {
    setModalState({
      isOpen: true,
      mode: "add",
      tag: null,
    });
  };

  const openEditModal = (tag: TagResponse) => {
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
    refetch();
  };

  // CRUD operations
  const handleCreateTag = async (data: TagCreate) => {
    if (!token) return;

    try {
      const { error } = await fetchClient.POST("/tags/", {
        body: data,
      });
      if (error) throw error;

      showSuccess("Tag created successfully");
      refetch();
    } catch (err: any) {
      console.error("Error creating tag:", err);
      showError(err?.message || "Unable to create tag");
      throw err;
    }
  };

  const handleUpdateTag = async (data: TagUpdate) => {
    if (!token || !modalState.tag) return;

    try {
      const { error } = await fetchClient.PUT("/tags/{tag_id}", {
        params: { path: { tag_id: modalState.tag.tag_id } },
        body: data,
      });
      if (error) throw error;

      showSuccess("Tag updated successfully");
      refetch();
    } catch (err: any) {
      console.error("Error updating tag:", err);
      showError(err?.message || "Unable to update tag");
      throw err;
    }
  };

  const handleModalSubmit = async (data: TagCreate | TagUpdate) => {
    if (modalState.mode === "add") {
      await handleCreateTag(data as TagCreate);
    } else {
      await handleUpdateTag(data as TagUpdate);
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
      const { error } = await fetchClient.DELETE("/tags/{tag_id}", {
        params: { path: { tag_id: confirmModal.tagId } },
      });
      if (error) throw error;

      showSuccess("Tag deleted successfully");
      closeConfirmModal();
      refetch();
    } catch (err: any) {
      console.error("Error deleting tag:", err);
      showError(err?.message || "Unable to delete tag");
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
                <p className="text-gray-600 font-sf-pro-text">{error instanceof Error ? error.message : "Unable to load tag data"}</p>
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

        {/* Create Tag Modal */}
        {canCreateOrEdit && modalState.mode === "add" && (
          <CreateTagModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            onSubmit={async (data) => {
              await handleModalSubmit(data);
              handleModalSuccess();
            }}
          />
        )}

        {/* Edit Tag Modal */}
        {canCreateOrEdit && modalState.mode === "edit" && modalState.tag && (
          <EditTagModal
            isOpen={modalState.isOpen}
            tag={modalState.tag}
            onClose={closeModal}
            onSubmit={async (data) => {
              await handleModalSubmit(data);
              handleModalSuccess();
            }}
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
