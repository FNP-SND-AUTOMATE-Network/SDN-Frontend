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
import { $api } from "@/lib/apiv2/fetch";
import { paths } from "@/lib/apiv2/schema";
import { tagService, Tag } from "@/services/tagService";
import { siteService, LocalSite } from "@/services/siteService";
import {
  operatingSystemService,
  OperatingSystem,
} from "@/services/operatingSystemService";
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
} from "@/components/device/device-detail";

type DeviceNetwork =
  paths["/device-networks/{device_id}"]["get"]["responses"]["200"]["content"]["application/json"];
type TabKey = "overview" | "interfaces" | "configuration" | "backup";

export default function DeviceDetailPage() {
  const params = useParams();
  const deviceId = params?.id as string | undefined;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { snackbar, hideSnackbar, showError, showSuccess } = useSnackbar();

  // --- Tab State ---
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // --- Mount/Unmount loading ---
  const [isMounting, setIsMounting] = useState(false);
  const [isUnmounting, setIsUnmounting] = useState(false);

  // --- Modal State ---
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // --- Reference Data ---
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allSites, setAllSites] = useState<LocalSite[]>([]);
  const [allOperatingSystems, setAllOperatingSystems] = useState<OperatingSystem[]>([]);

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
    }
  );

  // --- Load reference data once ---
  useEffect(() => {
    const fetchReferenceData = async () => {
      if (!token) return;
      try {
        const [tagsRes, sitesRes, osRes] = await Promise.all([
          tagService.getTags(token, 1, 100, { include_usage: false }),
          siteService.getLocalSites(token, 1, 100),
          operatingSystemService.getOperatingSystems(token, 1, 100),
        ]);
        setAllTags(tagsRes.tags);
        setAllSites(sitesRes.sites);
        setAllOperatingSystems(osRes.operating_systems);
      } catch (err: any) {
        showError(err?.message || "Failed to load reference data");
      }
    };
    fetchReferenceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // --- Mount Device ---
  const handleMount = async () => {
    if (!device?.node_id) {
      showError("Device does not have a valid Node ID to mount.");
      return;
    }
    try {
      setIsMounting(true);
      const { fetchClient } = await import("@/lib/apiv2/fetch");
      const { data: res, error } = await fetchClient.POST(
        "/api/v1/nbi/devices/{node_id}/mount",
        { params: { path: { node_id: device.node_id } } }
      );
      if (error) throw error;
      showSuccess(res?.message || "Device mounted successfully");
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
                onPreviewTemplate={(templateId) => {
                  console.log("Preview template:", templateId);
                }}
              />
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