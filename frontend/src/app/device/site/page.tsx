"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { $api } from "@/lib/apiv2/fetch";
import { fetchClient } from "@/lib/apiv2/fetch";
import { components } from "@/lib/apiv2/schema";

type LocalSiteResponse = components["schemas"]["LocalSiteResponse"];
type LocalSiteCreate = components["schemas"]["LocalSiteCreate"];
type LocalSiteUpdate = components["schemas"]["LocalSiteUpdate"];
import SiteHeader from "@/components/device/site/SiteHeader";
import SiteTable from "@/components/device/site/SiteTable";
import SitePagination from "@/components/device/site/SitePagination";
import CreateSiteModal from "@/components/device/site/CreateSiteModal";
import EditSiteModal from "@/components/device/site/EditSiteModal";
import {
  SiteSkeleton,
  SiteTableSkeleton,
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

  const [isDataLoading, setIsDataLoading] = useState(false);

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
    site: LocalSiteResponse | null;
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

  const { data, isLoading: isInitialLoading, error, refetch } = $api.useQuery(
    "get",
    "/local-sites/",
    {
      params: {
        query: {
          page: pagination.page,
          page_size: pagination.pageSize,
          search: debouncedSearch || undefined,
          site_type: filters.site_type || undefined,
        },
      },
    }
  );

  const sites = data?.sites || [];

  useEffect(() => {
    if (data?.total !== undefined) {
      setPagination((prev) => ({ ...prev, total: data.total }));
    }
  }, [data?.total]);

  // Modal handlers
  const openAddModal = () => {
    setModalState({
      isOpen: true,
      mode: "add",
      site: null,
    });
  };

  const openEditModal = (site: LocalSiteResponse) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      site: site as any, // Temporary cast until modals are refactored
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
    refetch();
  };

  // CRUD operations
  const handleCreateSite = async (data: LocalSiteCreate) => {
    if (!token) return;

    try {
      const { error } = await fetchClient.POST("/local-sites/", {
        body: data,
      });

      if (error) throw error;

      showSuccess("Site created successfully");
      refetch();
    } catch (err: any) {
      console.error("Error creating site:", err);
      showError(err.message || "Unable to create site");
      throw err;
    }
  };

  const handleUpdateSite = async (data: LocalSiteUpdate) => {
    if (!token || !modalState.site) return;

    try {
      const { error } = await fetchClient.PUT("/local-sites/{site_id}", {
        params: {
          path: {
            site_id: modalState.site.site_code, // Assuming site.id maps to site_code based on schema
          },
        },
        body: data,
      });

      if (error) throw error;

      showSuccess("Site updated successfully");
      refetch();
    } catch (err: any) {
      console.error("Error updating site:", err);
      showError(err.message || "Unable to update site");
      throw err;
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
      const { error } = await fetchClient.DELETE("/local-sites/{site_id}", {
        params: {
          path: {
            site_id: confirmModal.siteId,
          },
        },
      });

      if (error) throw error;

      showSuccess("Site deleted successfully");
      closeConfirmModal();
      refetch();
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
              dataCenters={sites.filter(s => s.site_type === "DataCenter").length}
              branches={sites.filter(s => s.site_type === "BRANCH").length}
              totalDevices={sites.reduce((sum, s) => sum + (s.device_count || 0), 0)}
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
                <p className="text-gray-600 font-sf-pro-text">{error instanceof Error ? error.message : "An error occurred"}</p>
              </div>
            ) : (
              <>
                <SiteTable
                  sites={sites as any}
                  onEditSite={canCreateOrEdit ? openEditModal : () => { }}
                  onDeleteSite={canDelete ? openDeleteConfirm : () => { }}
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

        {/* Create Site Modal */}
        {canCreateOrEdit && (
          <CreateSiteModal
            isOpen={modalState.isOpen && modalState.mode === "add"}
            onClose={closeModal}
            onSubmit={handleCreateSite}
          />
        )}

        {/* Edit Site Modal */}
        {canCreateOrEdit && (
          <EditSiteModal
            isOpen={modalState.isOpen && modalState.mode === "edit"}
            site={modalState.site}
            onClose={closeModal}
            onSubmit={handleUpdateSite}
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
