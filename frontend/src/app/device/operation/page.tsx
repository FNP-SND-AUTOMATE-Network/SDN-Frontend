"use client";

import { useEffect, useState } from "react";
import {
  TablePagination,
  Alert,
} from "@mui/material";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { $api } from "@/lib/apiv2/fetch";
import { paths } from "@/lib/apiv2/schema";
import { Tag, tagService } from "@/services/tagService";
import {
  OperationHeader,
  OperationTable,
  OperationSkeleton,
  CreateOperationModal,
  EditOperationModal,
  DeleteOperationModal,
} from "@/components/device/operation";

type OperatingSystemItem =
  paths["/operating-systems/"]["get"]["responses"][200]["content"]["application/json"]["operating_systems"][number];
type FilterQuery = NonNullable<
  paths["/operating-systems/"]["get"]["parameters"]["query"]
>;

export default function DeviceOperationPage() {
  const { isAuthenticated, user } = useAuth();
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();

  // --- Filter & Pagination State ---
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [osType, setOsType] = useState<FilterQuery["os_type"]>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const [editModal, setEditModal] = useState<OperatingSystemItem | null>(null);
  const [deleteOsId, setDeleteOsId] = useState<string | null>(null);
  const [deleteOsName, setDeleteOsName] = useState<string | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  // --- Fetch OS list via React Query ---
  const {
    data: osResponse,
    isLoading,
    error: osError,
  } = $api.useQuery("get", "/operating-systems/", {
    params: {
      query: {
        page: page + 1,
        page_size: pageSize,
        os_type: osType || undefined,
        search: debouncedSearch || undefined,
        include_usage: true,
      },
    },
  });

  // Derive data from query
  const operatingSystems = osResponse?.operating_systems ?? [];
  const totalOs = osResponse?.total ?? 0;


  // --- Role permissions ---
  const canCreateOrEdit =
    user?.role === "ENGINEER" || user?.role === "ADMIN" || user?.role === "OWNER";
  const canDelete = user?.role === "ADMIN" || user?.role === "OWNER";

  // --- Tags ---
  const [allTags, setAllTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await tagService.getTags(1, 100, { include_usage: false });
        setAllTags(response.tags);
      } catch (err: any) {
        showError(err?.message || "Unable to load tags");
      }
    };
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // --- Handlers ---
  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    setPage(0);
  };

  const handleFilterChange = (filters: { os_type: string }) => {
    setOsType(filters.os_type as FilterQuery["os_type"]);
    setPage(0);
  };

  const handleAddModalOpen = () => {
    if (!canCreateOrEdit) return;
    setAddModalOpen(true);
  };

  const handleEditOs = (os: OperatingSystemItem) => {
    if (!canCreateOrEdit) return;
    setEditModal(os);
    setEditModalOpen(true);
  };

  const handleDeleteOs = (osId: string, osName: string) => {
    if (!canDelete) return;
    setDeleteOsId(osId);
    setDeleteOsName(osName);
    setDeleteModalOpen(true);
  };

  return (
    <ProtectedRoute>
      <PageLayout>
        {isLoading ? (
          <OperationSkeleton />
        ) : (
          <>
            <OperationHeader
              onAddOs={handleAddModalOpen}
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              searchTerm={search}
              selectedOsType={osType ?? ""}
              totalOs={totalOs}
              totalDevices={operatingSystems.reduce(
                (sum, os) => sum + (os.device_count || 0),
                0
              )}
              totalBackups={operatingSystems.reduce(
                (sum, os) => sum + (os.backup_count || 0),
                0
              )}
              totalUsage={operatingSystems.reduce(
                (sum, os) => sum + (os.total_usage || 0),
                0
              )}
            />

            {osError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load operating systems. Please try again.
              </Alert>
            )}

            <OperationTable
              operatingSystems={operatingSystems}
              onEditOs={handleEditOs}
              onDeleteOs={handleDeleteOs}
            />

            <TablePagination
              component="div"
              count={totalOs}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50]}
              sx={{ borderTop: 1, borderColor: "divider" }}
            />
          </>
        )}

        {/* Create Modal */}
        {canCreateOrEdit && (
          <CreateOperationModal
            open={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            onSuccess={() => {
              showSuccess("Operating system created successfully");
              setAddModalOpen(false);
            }}
            allTags={allTags}
          />
        )}

        {/* Edit Modal */}
        {canCreateOrEdit && (
          <EditOperationModal
            open={editModalOpen}
            os={editModal}
            onClose={() => {
              setEditModal(null);
              setEditModalOpen(false);
            }}
            onSuccess={() => {
              showSuccess("Operating system updated successfully");
              setEditModal(null);
              setEditModalOpen(false);
            }}
            allTags={allTags}
          />
        )}

        {canDelete && (
          <DeleteOperationModal
            open={deleteModalOpen}
            osId={deleteOsId}
            osName={deleteOsName}
            onClose={() => {
              setDeleteModalOpen(false);
              setDeleteOsId(null);
              setDeleteOsName(null);
            }}
            onSuccess={() => {
              showSuccess("Operating system deleted successfully");
              setDeleteOsId(null);
              setDeleteOsName(null);
            }}
          />
        )}

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
