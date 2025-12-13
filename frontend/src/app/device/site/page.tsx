"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import {
  siteService,
  LocalSite,
  LocalSiteCreateRequest,
  LocalSiteUpdateRequest,
} from "@/services/siteService";
import {
  SiteHeader,
  SiteTable,
  SiteModal,
  SiteSkeleton,
  SiteTableSkeleton,
  SitePagination,
} from "@/components/device/site";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

export default function DeviceSitePage() {
  const { token, user } = useAuth();
  const {
    snackbar,
    hideSnackbar,
    showSuccess,
    showError,
  } = useSnackbar();

  const [sites, setSites] = useState<LocalSite[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFirstLoadRef = useRef(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    site_type: "",
  });

  // Debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500); // รอ 500ms หลังจากผู้ใช้หยุดพิมพ์

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    site: LocalSite | null;
  }>({
    isOpen: false,
    mode: "add",
    site: null,
  });

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    siteId: string | null;
    siteName: string;
  }>({
    isOpen: false,
    siteId: null,
    siteName: "",
  });

  // Fetch sites
  const fetchSites = useCallback(async () => {
    if (!token) return;

    try {
      if (isFirstLoadRef.current) {
        setIsInitialLoading(true);
      } else {
        setIsDataLoading(true);
      }
      setError(null);
      const response = await siteService.getLocalSites(
        token,
        pagination.page,
        pagination.pageSize,
        {
          search: debouncedSearch || undefined,
          site_type: filters.site_type || undefined,
        }
      );
      setSites(response.sites);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
      
      // Mark first load as complete
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
      }
    } catch (err) {
      console.error("Error fetching sites:", err);
      setError("Unable to load site data");
    } finally {
      setIsInitialLoading(false);
      setIsDataLoading(false);
    }
  }, [token, pagination.page, pagination.pageSize, debouncedSearch, filters.site_type]);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  // Modal handlers
  const openAddModal = () => {
    setModalState({
      isOpen: true,
      mode: "add",
      site: null,
    });
  };

  const openEditModal = (site: LocalSite) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      site: site,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: "add",
      site: null,
    });
  };

  const handleModalSuccess = () => {
    fetchSites();
  };

  // CRUD operations
  const handleCreateSite = async (data: LocalSiteCreateRequest) => {
    if (!token) return;

    try {
      await siteService.createLocalSite(token, data);
      showSuccess("Site created successfully");
      await fetchSites();
    } catch (err: any) {
      console.error("Error creating site:", err);
      showError(err.message || "Unable to create site");
      throw err;
    }
  };

  const handleUpdateSite = async (data: LocalSiteUpdateRequest) => {
    if (!token || !modalState.site) return;

    try {
      await siteService.updateLocalSite(token, modalState.site.id, data);
      showSuccess("Site updated successfully");
      await fetchSites();
    } catch (err: any) {
      console.error("Error updating site:", err);
      showError(err.message || "Unable to update site");
      throw err;
    }
  };

  const handleModalSubmit = async (
    data: LocalSiteCreateRequest | LocalSiteUpdateRequest
  ) => {
    if (modalState.mode === "add") {
      await handleCreateSite(data as LocalSiteCreateRequest);
    } else {
      await handleUpdateSite(data as LocalSiteUpdateRequest);
    }
  };

  // Delete handlers
  const openDeleteConfirm = (siteId: string, siteName: string) => {
    setConfirmModal({
      isOpen: true,
      siteId: siteId,
      siteName: siteName,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      siteId: null,
      siteName: "",
    });
  };

  const deleteSite = async () => {
    if (!token || !confirmModal.siteId) return;

    try {
      await siteService.deleteLocalSite(token, confirmModal.siteId);
      showSuccess("Site deleted successfully");
      closeConfirmModal();
      await fetchSites();
    } catch (err: any) {
      console.error("Error deleting site:", err);
      showError(err.message || "Unable to delete site");
    }
  };

  // Filter handlers
  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (siteType: string) => {
    setFilters((prev) => ({ ...prev, site_type: siteType }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Pagination handler
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Check permissions
  const canCreateOrEdit =
    user?.role === "ENGINEER" ||
    user?.role === "ADMIN" ||
    user?.role === "OWNER";
  const canDelete = user?.role === "ADMIN" || user?.role === "OWNER";

  return (
    <ProtectedRoute>
      <PageLayout>
        {isInitialLoading ? (
          <SiteSkeleton />
        ) : (
          <>
            <SiteHeader
              onAddSite={openAddModal}
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              searchTerm={filters.search}
              selectedSiteType={filters.site_type}
              totalSites={pagination.total}
            />

            {isDataLoading ? (
              <SiteTableSkeleton />
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-red-600 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <FontAwesomeIcon icon={faCircleXmark} />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 font-sf-pro-display">
                  Error Occurred
                </h3>
                <p className="text-gray-600 font-sf-pro-text">{error}</p>
              </div>
            ) : (
              <>
                <SiteTable
                  sites={sites}
                  onEditSite={canCreateOrEdit ? openEditModal : () => {}}
                  onDeleteSite={canDelete ? openDeleteConfirm : () => {}}
                />

                {pagination.total > pagination.pageSize && (
                  <SitePagination
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

        {/* Site Modal */}
        {canCreateOrEdit && (
          <SiteModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            onSuccess={handleModalSuccess}
            mode={modalState.mode}
            site={modalState.site}
            onSubmit={handleModalSubmit}
          />
        )}

        {/* Confirm Delete Modal */}
        {canDelete && (
          <ConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={closeConfirmModal}
            onConfirm={deleteSite}
            title="Confirm Delete Site"
            message={`Are you sure you want to delete site "${confirmModal.siteName}"?`}
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
