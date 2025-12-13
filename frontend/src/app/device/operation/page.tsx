"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/hooks/useSnackbar";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import {
  OperatingSystem,
  OperatingSystemCreateRequest,
  OperatingSystemUpdateRequest,
  OSFile,
  operatingSystemService,
} from "@/services/operatingSystemService";
import { Tag, tagService } from "@/services/tagService";
import {
  OperationHeader,
  OperationTable,
  OperationSkeleton,
  OperationModal,
} from "@/components/device/operation";

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

interface FiltersState {
  search: string;
  os_type: string;
  tag_filter: string;
}

export default function DeviceOperationPage() {
  const { token, user } = useAuth();
  const {
    snackbar,
    hideSnackbar,
    showSuccess,
    showError,
  } = useSnackbar();

  const [operatingSystems, setOperatingSystems] = useState<OperatingSystem[]>(
    []
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    os_type: "",
    tag_filter: "",
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const isFirstLoadRef = useRef(true);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    osId: string | null;
    osName: string | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    osId: null,
    osName: null,
    isDeleting: false,
  });

  const [osFiles, setOsFiles] = useState<OSFile[]>([]);
  const [isFilesLoading, setIsFilesLoading] = useState(false);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    os: OperatingSystem | null;
  }>({
    isOpen: false,
    mode: "add",
    os: null,
  });

  const [allTags, setAllTags] = useState<Tag[]>([]);

  const canCreateOrEdit =
    user?.role === "ENGINEER" || user?.role === "ADMIN" || user?.role === "OWNER";
  const canDelete = user?.role === "ADMIN" || user?.role === "OWNER";

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters.search]);

  // โหลดรายการ Tags ทั้งหมด (สำหรับเลือกใน Modal)
  useEffect(() => {
    const fetchTags = async () => {
      if (!token) return;
      try {
        const response = await tagService.getTags(token, 1, 100, {
          include_usage: false,
        });
        setAllTags(response.tags);
      } catch (err: any) {
        const message = err?.message || "Unable to load tags";
        showError(message);
      }
    };
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchOperatingSystems = useCallback(async () => {
    if (!token) return;

    try {
      if (isFirstLoadRef.current) {
        setIsInitialLoading(true);
      } else {
        setIsDataLoading(true);
      }
      setError(null);

      const response = await operatingSystemService.getOperatingSystems(
        token,
        pagination.page,
        pagination.pageSize,
        {
          os_type: filters.os_type || undefined,
          search: debouncedSearch || undefined,
          include_usage: true,
        }
      );

      let filteredItems = response.operating_systems;
      if (filters.tag_filter === "with_tag") {
        filteredItems = filteredItems.filter(
          (os) => os.tags && os.tags.length > 0
        );
      } else if (filters.tag_filter === "without_tag") {
        filteredItems = filteredItems.filter(
          (os) => !os.tags || os.tags.length === 0
        );
      }

      setOperatingSystems(filteredItems);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (err: any) {
      const message = err?.message || "Unable to load operating systems";
      setError(message);
      showError(message);
    } finally {
      if (isFirstLoadRef.current) {
        setIsInitialLoading(false);
        isFirstLoadRef.current = false;
      } else {
        setIsDataLoading(false);
      }
    }
  }, [
    token,
    pagination.page,
    pagination.pageSize,
    filters.os_type,
    filters.tag_filter,
    debouncedSearch,
  ]);

  useEffect(() => {
    fetchOperatingSystems();
  }, [fetchOperatingSystems]);

  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
    }));
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleFilterChange = (newFilters: {
    os_type: string;
    tag_filter: string;
  }) => {
    setFilters((prev) => ({
      ...prev,
      os_type: newFilters.os_type,
      tag_filter: newFilters.tag_filter,
    }));
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const openDeleteConfirm = (osId: string, osName: string) => {
    if (!canDelete) return;
    setConfirmModal({
      isOpen: true,
      osId,
      osName,
      isDeleting: false,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      osId: null,
      osName: null,
      isDeleting: false,
    });
  };

  const deleteOperatingSystem = async () => {
    if (!token || !confirmModal.osId) return;

    try {
      setConfirmModal((prev) => ({ ...prev, isDeleting: true }));
      await operatingSystemService.deleteOperatingSystem(token, confirmModal.osId);
      showSuccess("Operating system deleted successfully");
      closeConfirmModal();
      fetchOperatingSystems();
    } catch (err: any) {
      const message = err?.message || "Unable to delete operating system";
      showError(message);
      setConfirmModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const openAddModal = () => {
    if (!canCreateOrEdit) return;
    setModalState({
      isOpen: true,
      mode: "add",
      os: null,
    });
    setOsFiles([]);
  };

  const openEditModal = (os: OperatingSystem) => {
    if (!canCreateOrEdit) return;
    setModalState({
      isOpen: true,
      mode: "edit",
      os,
    });

    if (!token) return;

    setIsFilesLoading(true);
    operatingSystemService
      .getOsFiles(token, os.id)
      .then((response) => {
        setOsFiles(response.files);
      })
      .catch((err: any) => {
        const message =
          err?.message || "Unable to load operating system files";
        showError(message);
      })
      .finally(() => {
        setIsFilesLoading(false);
      });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: "add",
      os: null,
    });
    setOsFiles([]);
  };

  const handleModalSuccess = () => {
    fetchOperatingSystems();
  };

  const handleModalSubmit = async (params: {
    osData: OperatingSystemCreateRequest | OperatingSystemUpdateRequest;
    file?: File | null;
    version?: string | null;
    tagIds: string[];
  }) => {
    if (!token) return;

    const { osData, file, version, tagIds } = params;

    if (modalState.mode === "add") {
      // Create new OS first
      const response = await operatingSystemService.createOperatingSystem(
        token,
        osData as OperatingSystemCreateRequest
      );
      const createdOs = response.operating_system;

      // If file selected, upload it
      if (file) {
        await operatingSystemService.uploadOsFile(
          token,
          createdOs.id,
          file,
          version || null
        );
      }

       // Assign tags if selected
       if (tagIds && tagIds.length > 0) {
         await operatingSystemService.assignTagsToOs(token, createdOs.id, tagIds);
       }

      showSuccess("Operating system created successfully");
    } else if (modalState.mode === "edit" && modalState.os) {
      // Update existing OS
      await operatingSystemService.updateOperatingSystem(
        token,
        modalState.os.id,
        osData as OperatingSystemUpdateRequest
      );

      // Optional file upload on edit
      if (file) {
        await operatingSystemService.uploadOsFile(
          token,
          modalState.os.id,
          file,
          version || null
        );
      }

       // Update tags: assign new, remove removed
       const existingTagIds =
         modalState.os.tags?.map((t) => t.tag_id) ?? [];
       const toAdd = tagIds.filter((id) => !existingTagIds.includes(id));
       const toRemove = existingTagIds.filter((id) => !tagIds.includes(id));

       if (toAdd.length > 0) {
         await operatingSystemService.assignTagsToOs(
           token,
           modalState.os.id,
           toAdd
         );
       }
       if (toRemove.length > 0) {
         await operatingSystemService.removeTagsFromOs(
           token,
           modalState.os.id,
           toRemove
         );
       }

      showSuccess("Operating system updated successfully");
    }

    // refresh files list after create/update if we are in edit mode
    if (modalState.mode === "edit" && modalState.os && token) {
      try {
        const filesResponse = await operatingSystemService.getOsFiles(
          token,
          modalState.os.id
        );
        setOsFiles(filesResponse.files);
      } catch {
        // ignore file refresh error
      }
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!token || !modalState.os) return;

    try {
      await operatingSystemService.deleteOsFile(token, modalState.os.id, fileId);
      showSuccess("OS file deleted successfully");

      const filesResponse = await operatingSystemService.getOsFiles(
        token,
        modalState.os.id
      );
      setOsFiles(filesResponse.files);
    } catch (err: any) {
      const message = err?.message || "Unable to delete OS file";
      showError(message);
    }
  };

  const handleDownloadFile = async (file: OSFile) => {
    if (!token || !modalState.os) return;

    try {
      const blob = await operatingSystemService.downloadOsFile(
        token,
        modalState.os.id,
        file.id
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const message = err?.message || "Unable to download OS file";
      showError(message);
    }
  };

  return (
    <ProtectedRoute>
      <PageLayout>
        {isInitialLoading ? (
          <OperationSkeleton />
        ) : (
          <>
            <OperationHeader
              onAddOs={openAddModal}
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              searchTerm={filters.search}
              selectedOsType={filters.os_type}
              selectedTagFilter={filters.tag_filter}
              totalOperatingSystems={pagination.total}
            />

            {error && (
              <div className="mb-4 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700 font-sf-pro-text">
                {error}
              </div>
            )}

            {isDataLoading ? (
              <OperationSkeleton />
            ) : (
              <OperationTable
                operatingSystems={operatingSystems}
                onEditOs={openEditModal}
                onDeleteOs={openDeleteConfirm}
              />
            )}

            {/* Simple pagination (Previous / Next) */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600 font-sf-pro-text">
              <div>
                Showing{" "}
                {operatingSystems.length === 0
                  ? 0
                  : (pagination.page - 1) * pagination.pageSize + 1}{" "}
                to{" "}
                {Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.total
                )}{" "}
                of {pagination.total} results
              </div>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className={`px-3 py-1 rounded border ${
                    pagination.page === 1
                      ? "text-gray-400 border-gray-200 cursor-not-allowed"
                      : "text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                <button
                  disabled={
                    pagination.page * pagination.pageSize >= pagination.total
                  }
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className={`px-3 py-1 rounded border ${
                    pagination.page * pagination.pageSize >= pagination.total
                      ? "text-gray-400 border-gray-200 cursor-not-allowed"
                      : "text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {canCreateOrEdit && (
          <OperationModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            onSuccess={handleModalSuccess}
            mode={modalState.mode}
            os={modalState.os}
            onSubmit={handleModalSubmit}
            files={osFiles}
            isFilesLoading={isFilesLoading}
            onDeleteFile={handleDeleteFile}
            allTags={allTags}
            onDownloadFile={handleDownloadFile}
          />
        )}

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title="Confirm Delete Operating System"
          message={`Are you sure you want to delete operating system "${confirmModal.osName}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={confirmModal.isDeleting}
          onClose={closeConfirmModal}
          onConfirm={deleteOperatingSystem}
        />

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

