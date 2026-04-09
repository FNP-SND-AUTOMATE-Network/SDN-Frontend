"use client";

import { useEffect, useState } from "react";
import { TablePagination, Alert } from "@mui/material";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { useSnackbar } from "@/hooks/useSnackbar";
import {
  DeviceHeader,
  DeviceTable,
  DeviceSkeleton,
  CreateDeviceModal,
  EditDeviceModal,
} from "@/components/device/device-list";

import { $api, fetchClient } from "@/lib/apiv2/fetch";
import { paths } from "@/lib/apiv2/schema";

type DeviceNetwork =
  paths["/device-networks/"]["get"]["responses"]["200"]["content"]["application/json"]["devices"][number];
type FilterQuery = NonNullable<
  paths["/device-networks/"]["get"]["parameters"]["query"]
>;

type Tag = paths["/tags/"]["get"]["responses"]["200"]["content"]["application/json"]["tags"][number];
type LocalSite = paths["/local-sites/"]["get"]["responses"]["200"]["content"]["application/json"]["sites"][number];
type OperatingSystem = paths["/operating-systems/"]["get"]["responses"]["200"]["content"]["application/json"]["operating_systems"][number];

export default function DevicePage() {
  const { isAuthenticated, user } = useAuth();
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();

  // --- Filter & Pagination State ---
  const [page, setPage] = useState(0); // MUI TablePagination is 0-indexed
  const [pageSize, setPageSize] = useState(20);
  const [deviceType, setDeviceType] = useState<FilterQuery["device_type"]>("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search — wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // --- Modal State ---
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDevice, setEditDevice] = useState<DeviceNetwork | null>(null);

  // --- Reference Data for Modal ---
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allSites, setAllSites] = useState<LocalSite[]>([]);
  const [allOperatingSystems, setAllOperatingSystems] = useState<
    OperatingSystem[]
  >([]);

  // --- Fetch devices via openapi-react-query ---
  const {
    data: devicesResponse,
    isLoading,
    error: devicesError,
  } = $api.useQuery("get", "/device-networks/", {
    params: {
      query: {
        page: page + 1, // API is 1-indexed, MUI pagination is 0-indexed
        page_size: pageSize,
        device_type: deviceType || undefined,
        status: status || undefined,
        search: debouncedSearch || undefined,
      },
    },
  });

  const devices = devicesResponse?.devices ?? [];
  const totalDevices = devicesResponse?.total ?? 0;

  const canCreateOrEdit =
    user?.role === "ENGINEER" || user?.role === "ADMIN" || user?.role === "OWNER";

  // --- Load reference data (tags, sites, OS) for modal once ---
  useEffect(() => {
    const fetchReferenceData = async () => {
      if (!isAuthenticated) return;
      try {
        const [tagsRes, sitesRes, osRes] = await Promise.all([
          fetchClient.GET("/tags/", { params: { query: { page: 1, page_size: 100, include_usage: false } } }),
          fetchClient.GET("/local-sites/", { params: { query: { page: 1, page_size: 100 } } }),
          fetchClient.GET("/operating-systems/", { params: { query: { page: 1, page_size: 100 } } }),
        ]);

        if (tagsRes.error || sitesRes.error || osRes.error) {
          throw new Error("Failed to load reference data");
        }

        setAllTags(tagsRes.data?.tags ?? []);
        setAllSites(sitesRes.data?.sites ?? []);
        setAllOperatingSystems(osRes.data?.operating_systems ?? []);
      } catch (err: any) {
        showError(err?.message || "Failed to load reference data");
      }
    };
    fetchReferenceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // --- Handlers ---
  const handleSearch = (searchTerm: string) => setSearch(searchTerm);

  const handleFilterChange = (filters: { type: string; status: string }) => {
    setDeviceType(filters.type as FilterQuery["device_type"]);
    setStatus(filters.status);
    setPage(0); // Reset to first page on filter change
  };

  const openAddModal = () => {
    if (!canCreateOrEdit) return;
    setAddModalOpen(true);
  };

  const openEditModal = (device: DeviceNetwork) => {
    if (!canCreateOrEdit) return;
    setEditDevice(device);
    setEditModalOpen(true);
  };

  const handleAddSuccess = () => {
    setAddModalOpen(false);
    showSuccess("Device created successfully");
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setEditDevice(null);
    showSuccess("Device updated successfully");
  };

  return (
    <ProtectedRoute>
      <PageLayout>
        {isLoading ? (
          <DeviceSkeleton />
        ) : (
          <>
            <DeviceHeader
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              onAddDevice={openAddModal}
              searchTerm={search}
              selectedType={deviceType ?? ""}
              selectedStatus={status}
              totalDevices={totalDevices}
              statusCounts={{
                online: devices.filter((d) => d.status === "ONLINE").length,
                offline: devices.filter((d) => d.status === "OFFLINE").length,
                other: devices.filter((d) => d.status === "OTHER").length,
                maintenance: devices.filter((d) => d.status === "MAINTENANCE")
                  .length,
              }}
            />

            {devicesError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load devices. Please try again.
              </Alert>
            )}

            <DeviceTable
              devices={devices}
              onEdit={openEditModal}
              onSync={(device) => {
                // TODO: Implement sync functionality
                console.log("Sync device:", device.device_name);
              }}
            />

            {/* MUI Pagination */}
            <TablePagination
              component="div"
              count={totalDevices}
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

        {/* Create Device Modal */}
        {canCreateOrEdit && (
          <CreateDeviceModal
            open={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            onSuccess={handleAddSuccess}
            allTags={allTags}
            allSites={allSites}
            allOperatingSystems={allOperatingSystems}
          />
        )}

        {/* Edit Device Modal */}
        {canCreateOrEdit && editDevice && (
          <EditDeviceModal
            open={editModalOpen}
            device={editDevice}
            onClose={() => {
              setEditModalOpen(false);
              setEditDevice(null);
            }}
            onSuccess={handleEditSuccess}
            allTags={allTags}
            allSites={allSites}
            allOperatingSystems={allOperatingSystems}
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
