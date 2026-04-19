"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Paper, Box, Typography, Alert, Skeleton } from "@mui/material";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { useQueryClient } from "@tanstack/react-query";
import { $api, fetchClient } from "@/lib/apiv2/fetch";
import { paths } from "@/lib/apiv2/schema";
import {
  EditDeviceModal,
  DeleteDeviceModal,
} from "@/components/device/device-list";
import {
  DeviceDetailBreadcrumb,
  DeviceDetailHeader,
  DeviceDetailTabs,
  DeviceDetailCards,
  DeviceConfigurationTab,
  DeviceInterfacesTab,
  DeviceBackupTab,
} from "@/components/device/device-detail";

type DeviceNetwork =
  paths["/device-networks/{device_id}"]["get"]["responses"]["200"]["content"]["application/json"];
type TabKey = "overview" | "interfaces" | "configuration" | "backup";

type Tag = paths["/tags/"]["get"]["responses"]["200"]["content"]["application/json"]["tags"][number];
type LocalSite = paths["/local-sites/"]["get"]["responses"]["200"]["content"]["application/json"]["sites"][number];
type OperatingSystem = paths["/operating-systems/"]["get"]["responses"]["200"]["content"]["application/json"]["operating_systems"][number];


export default function DeviceDetailPage() {
  const params = useParams();
  const deviceId = params?.id as string | undefined;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { snackbar, hideSnackbar, showError, showSuccess, showInfo } = useSnackbar();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [prevConnStatus, setPrevConnStatus] = useState<string | undefined>(undefined);

  // --- Mount/Unmount loading ---
  const [isMounting, setIsMounting] = useState(false);
  const [isUnmounting, setIsUnmounting] = useState(false);

  // --- Modal State ---
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // --- Reference Data ---
  const [allTags, setAllTags] = useState<Tag[]>([]);
    const [allSites, setAllSites] = useState<LocalSite[]>([]);
    const [allOperatingSystems, setAllOperatingSystems] = useState<
      OperatingSystem[]
    >([]);

  // --- Fetch device via React Query ---
  const {
    data: device,
    isLoading,
    error: deviceError,
  } = $api.useQuery(
    "get",
    "/device-networks/{device_id}",
    {
      params: {
        path: { device_id: deviceId! },
      },
    },
    {
      enabled: !!deviceId,
      refetchInterval: (query) => {
        const data = query.state?.data as DeviceNetwork | undefined;
        return data?.odl_connection_status?.toLowerCase() === "connecting" ? 3000 : false;
      },
    }
  );

  // --- Watch Connection Status Transitions ---
  useEffect(() => {
    if (device?.odl_connection_status) {
      const currentStatus = device.odl_connection_status.toLowerCase();
      if (prevConnStatus === "connecting" && currentStatus === "connected") {
        hideSnackbar();
        showSuccess(`Device ${device.device_name || device.node_id} mounted successfully`);
        // Auto-sync interfaces on successful mount
        import("@/lib/apiv2/fetch").then(({ fetchClient }) => {
            fetchClient.GET("/interfaces/odl/{node_id}/sync", {
                params: { path: { node_id: device.node_id! } }
            }).catch(console.error);
        });
      } else if (prevConnStatus === "connecting" && currentStatus !== "connected" && currentStatus !== "connecting") {
        hideSnackbar();
        showError(`Device failed to mount. Status: ${device.odl_connection_status}`);
      }
      setPrevConnStatus(currentStatus);
    } else if (device && !device.odl_connection_status && prevConnStatus) {
      setPrevConnStatus(undefined);
    }
  }, [device?.odl_connection_status, device?.device_name, device?.node_id, prevConnStatus, hideSnackbar, showSuccess, showError]);

  // --- Load reference data once ---
  useEffect(() => {
    const fetchReferenceData = async () => {
      if (!isAuthenticated) return;
      try {
        const [tagsRes, sitesRes, osRes] = await Promise.all([
          fetchClient.GET("/tags/", { params: { query: { page: 1, page_size: 100, include_usage: false } } }),
          fetchClient.GET("/local-sites/", { params: { query: { page: 1, page_size: 100 } } }),
          fetchClient.GET("/operating-systems/", { params: { query: { page: 1, page_size: 100 } } }),
        ]);
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

  // --- Mount Device ---
  const handleMount = async () => {
    if (!device?.node_id) {
      showError("Device does not have a valid Node ID to mount.");
      return;
    }
    try {
      setIsMounting(true);
      const { fetchClient } = await import("@/lib/apiv2/fetch");
      const { data: res, error, response } = await fetchClient.POST(
        "/api/v1/nbi/devices/{node_id}/mount",
        { params: { path: { node_id: device.node_id } } }
      );
      
      const status = response?.status;
      if (status === 200) {
        const code = (res as any)?.code;
        const readyForIntent = Boolean((res as any)?.ready_for_intent);
        if (code === "DEVICE_ALREADY_MOUNTED") {
          showSuccess(`Device ${device.device_name || device.node_id} is already connected`);
          fetchClient.GET("/interfaces/odl/{node_id}/sync", {
            params: { path: { node_id: device.node_id } }
          }).catch(console.error);
        } else if (readyForIntent) {
          showSuccess(res?.message || `Device ${device.device_name || device.node_id} is connected successfully`);
          fetchClient.GET("/interfaces/odl/{node_id}/sync", {
            params: { path: { node_id: device.node_id } }
          }).catch(console.error);
        } else {
          showInfo(
            res?.message ||
            `Device ${device.device_name || device.node_id} is mounting... Please wait.`
          );
        }
      } else if (status === 400) {
        const detail = (error as any)?.detail || "";
        showError(typeof detail === "string" ? detail : JSON.stringify(detail));
      } else if (status === 404) {
        showError("Device not found");
      } else if (status === 502) {
        const detail = (error as any)?.detail || {};
        showError(detail.message || "Mount successful but cannot connect to device");
        if (detail.suggestion) {
          showInfo(detail.suggestion);
        }
      } else if (status === 504) {
        showError("Connection timeout (120s)");
      } else if (error) {
        throw error;
      }

      queryClient.invalidateQueries({
        queryKey: ["get", "/device-networks/{device_id}"],
      });
    } catch (err: any) {
      showError(`Mount failed: ${err?.detail || err?.message || "Unknown error"}`);
    } finally {
      setIsMounting(false);
    }
  };

  // --- Unmount Device ---
  const handleUnmount = async () => {
    if (!device?.node_id) {
      showError("Device does not have a valid Node ID to unmount.");
      return;
    }
    try {
      setIsUnmounting(true);
      const { fetchClient } = await import("@/lib/apiv2/fetch");
      const { data: res, error } = await fetchClient.DELETE(
        "/api/v1/nbi/devices/{node_id}/mount",
        { params: { path: { node_id: device.node_id } } }
      );
      if (error) throw error;
      showSuccess(res?.message || "Device unmounted successfully");
      queryClient.invalidateQueries({
        queryKey: ["get", "/device-networks/{device_id}"],
      });
    } catch (err: any) {
      showError(`Unmount failed: ${err?.detail || err?.message || "Unknown error"}`);
    } finally {
      setIsUnmounting(false);
    }
  };

  // --- Handlers ---
  const handleEditSuccess = () => {
    setEditModalOpen(false);
    queryClient.invalidateQueries({
      queryKey: ["get", "/device-networks/{device_id}"],
    });
    showSuccess("Device updated successfully");
  };

  const handleDeleteSuccess = () => {
    setDeleteModalOpen(false);
    showSuccess("Device deleted successfully");
    router.push("/device/device-list");
  };

  return (
    <ProtectedRoute>
      <PageLayout>
        {/* Breadcrumb */}
        <DeviceDetailBreadcrumb
          deviceName={device ? device.device_name : "..."}
        />

        {/* Header */}
        {device && (
          <DeviceDetailHeader
            device={device}
            onEdit={() => setEditModalOpen(true)}
            onDelete={() => setDeleteModalOpen(true)}
            onMount={handleMount}
            onUnmount={handleUnmount}
            isMounting={isMounting}
            isUnmounting={isUnmounting}
          />
        )}

        {/* Tabs + Content */}
        <Paper variant="outlined" sx={{ borderRadius: 0.5 }}>
          <DeviceDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <Box p={{ xs: 2, sm: 3 }}>
            {isLoading ? (
              <Box>
                <Skeleton variant="text" width="40%" height={28} />
                <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
                <Skeleton variant="rounded" width="100%" height={200} sx={{ mt: 2 }} />
              </Box>
            ) : deviceError ? (
              <Alert severity="error">
                Failed to load device details. Please try again.
              </Alert>
            ) : !device ? (
              <Typography color="text.secondary">Device not found.</Typography>
            ) : activeTab === "overview" ? (
              <DeviceDetailCards device={device} />
            ) : activeTab === "interfaces" ? (
              <DeviceInterfacesTab device={device} />
            ) : activeTab === "configuration" ? (
              <DeviceConfigurationTab
                device={device}
              />
            ) : activeTab === "backup" ? (
              <DeviceBackupTab device={device} />
            ) : (
              <Typography color="text.secondary">
                This tab is under development.
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Edit Device Modal */}
        {device && (
          <EditDeviceModal
            open={editModalOpen}
            device={device}
            onClose={() => setEditModalOpen(false)}
            onSuccess={handleEditSuccess}
            allTags={allTags}
            allSites={allSites}
            allOperatingSystems={allOperatingSystems}
          />
        )}

        {/* Delete Device Modal */}
        {device && (
          <DeleteDeviceModal
            open={deleteModalOpen}
            device={device}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDeleteSuccess}
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