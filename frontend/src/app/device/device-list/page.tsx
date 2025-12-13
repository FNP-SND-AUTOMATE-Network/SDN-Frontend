"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/hooks/useSnackbar";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import {
  deviceNetworkService,
  DeviceNetwork,
  DeviceNetworkCreateRequest,
  DeviceNetworkUpdateRequest,
} from "@/services/deviceNetworkService";
import {
  DeviceHeader,
  DeviceTable,
  DeviceSkeleton,
  DeviceModal,
} from "@/components/device/device-list";
import { tagService, Tag } from "@/services/tagService";
import { siteService, LocalSite } from "@/services/siteService";
import {
  operatingSystemService,
  OperatingSystem,
} from "@/services/operatingSystemService";

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

interface FiltersState {
  search: string;
  type: string;
  status: string;
}

export default function DevicePage() {
  const { token, user } = useAuth();
  const {
    snackbar,
    hideSnackbar,
    showSuccess,
    showError,
  } = useSnackbar();

  const [devices, setDevices] = useState<DeviceNetwork[]>([]);
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
    type: "",
    status: "",
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const isFirstLoadRef = useRef(true);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    deviceId: string | null;
    deviceName: string | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    deviceId: null,
    deviceName: null,
    isDeleting: false,
  });

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    device: DeviceNetwork | null;
  }>({
    isOpen: false,
    mode: "add",
    device: null,
  });

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allSites, setAllSites] = useState<LocalSite[]>([]);
  const [allOperatingSystems, setAllOperatingSystems] = useState<
    OperatingSystem[]
  >([]);

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

  const fetchDevices = useCallback(async () => {
    if (!token) return;

    try {
      if (isFirstLoadRef.current) {
        setIsInitialLoading(true);
      } else {
        setIsDataLoading(true);
      }
      setError(null);

      const response = await deviceNetworkService.getDevices(
        token,
        pagination.page,
        pagination.pageSize,
        {
          search: debouncedSearch || undefined,
          type: filters.type || undefined,
          status: filters.status || undefined,
        }
      );

      setDevices(response.devices);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (err: any) {
      const message = err?.message || "Unable to load devices";
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
    filters.type,
    filters.status,
    debouncedSearch,
  ]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // โหลด Tags สำหรับใช้ใน Modal (ครั้งเดียว)
  useEffect(() => {
    const fetchTags = async () => {
      if (!token) return;
      try {
        const response = await tagService.getTags(token, 1, 200, {
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

  // โหลด Local Sites สำหรับใช้ใน Modal (ครั้งเดียว)
  useEffect(() => {
    const fetchSites = async () => {
      if (!token) return;
      try {
        const response = await siteService.getLocalSites(token, 1, 100);
        setAllSites(response.sites);
      } catch (err: any) {
        const message = err?.message || "Unable to load sites";
        showError(message);
      }
    };

    fetchSites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // โหลด Operating Systems สำหรับใช้ใน Modal (ครั้งเดียว)
  useEffect(() => {
    const fetchOperatingSystems = async () => {
      if (!token) return;
      try {
        const response = await operatingSystemService.getOperatingSystems(
          token,
          1,
          100,
          {
            include_usage: false,
          }
        );
        setAllOperatingSystems(response.operating_systems);
      } catch (err: any) {
        const message = err?.message || "Unable to load operating systems";
        showError(message);
      }
    };

    fetchOperatingSystems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
    type: string;
    status: string;
  }) => {
    setFilters((prev) => ({
      ...prev,
      type: newFilters.type,
      status: newFilters.status,
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

  const openDeleteConfirm = (deviceId: string, deviceName: string) => {
    if (!canDelete) return;
    setConfirmModal({
      isOpen: true,
      deviceId,
      deviceName,
      isDeleting: false,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      deviceId: null,
      deviceName: null,
      isDeleting: false,
    });
  };

  const deleteDevice = async () => {
    if (!token || !confirmModal.deviceId) return;

    try {
      setConfirmModal((prev) => ({ ...prev, isDeleting: true }));
      await deviceNetworkService.deleteDevice(token, confirmModal.deviceId);
      showSuccess("Device deleted successfully");
      closeConfirmModal();
      fetchDevices();
    } catch (err: any) {
      const message = err?.message || "Unable to delete device";
      showError(message);
      setConfirmModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const openAddModal = () => {
    if (!canCreateOrEdit) return;
    setModalState({
      isOpen: true,
      mode: "add",
      device: null,
    });
  };

  const openEditModal = (device: DeviceNetwork) => {
    if (!canCreateOrEdit) return;
    setModalState({
      isOpen: true,
      mode: "edit",
      device,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: "add",
      device: null,
    });
  };

  const handleModalSuccess = () => {
    fetchDevices();
  };

  const handleModalSubmit = async (
    data: DeviceNetworkCreateRequest | DeviceNetworkUpdateRequest,
    tagIds: string[]
  ): Promise<DeviceNetwork> => {
    if (!token) return Promise.reject();

    if (modalState.mode === "add") {
      // Create new device
      const createData = data as DeviceNetworkCreateRequest;
      const response = await deviceNetworkService.createDevice(token, createData);
      const createdDevice = response.device;

      // Assign tags if any
      if (tagIds.length > 0) {
        await deviceNetworkService.assignTagsToDevice(
          token,
          createdDevice.id,
          tagIds
        );
      }

      // Fetch the device again to get all related data including tags
      const refreshed = await deviceNetworkService.getDeviceById(
        token,
        createdDevice.id
      );
      showSuccess("Device created successfully");
      return refreshed;
    } else if (modalState.mode === "edit" && modalState.device) {
      // Update existing device
      const updateData = data as DeviceNetworkUpdateRequest;
      await deviceNetworkService.updateDevice(
        token,
        modalState.device.id,
        updateData
      );

      // Manage tags
      const existingTagIds =
        modalState.device.tags?.map((t) => t.tag_id) ?? [];
      const toAdd = tagIds.filter((id) => !existingTagIds.includes(id));
      const toRemove = existingTagIds.filter((id) => !tagIds.includes(id));

      if (toAdd.length > 0) {
        await deviceNetworkService.assignTagsToDevice(
          token,
          modalState.device.id,
          toAdd
        );
      }
      if (toRemove.length > 0) {
        await deviceNetworkService.removeTagsFromDevice(
          token,
          modalState.device.id,
          toRemove
        );
      }

      // Fetch the device again to get all related data
      const refreshed = await deviceNetworkService.getDeviceById(
        token,
        modalState.device.id
      );
      showSuccess("Device updated successfully");
      return refreshed;
    }

    return Promise.reject();
  };

  return (
    <ProtectedRoute>
      <PageLayout>
        {isInitialLoading ? (
          <DeviceSkeleton />
        ) : (
          <>
            <DeviceHeader
              onAddDevice={openAddModal}
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              searchTerm={filters.search}
              selectedType={filters.type}
              selectedStatus={filters.status}
              totalDevices={pagination.total}
            />

            {error && (
              <div className="mb-4 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700 font-sf-pro-text">
                {error}
              </div>
            )}

            {isDataLoading ? (
              <DeviceSkeleton />
            ) : (
              <DeviceTable devices={devices} />
            )}

            {/* Simple pagination (Previous / Next) */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600 font-sf-pro-text">
              <div>
                Showing{" "}
                {devices.length === 0
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
          <DeviceModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            onSuccess={handleModalSuccess}
            mode={modalState.mode}
            device={modalState.device}
            allTags={allTags}
            allSites={allSites}
            allOperatingSystems={allOperatingSystems}
            onSubmit={handleModalSubmit}
          />
        )}

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title="Confirm Delete Device"
          message={`Are you sure you want to delete device "${confirmModal.deviceName}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={confirmModal.isDeleting}
          onClose={closeConfirmModal}
          onConfirm={deleteDevice}
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

