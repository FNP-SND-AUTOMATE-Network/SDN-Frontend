"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import {
  deviceNetworkService,
  DeviceNetwork,
} from "@/services/deviceNetworkService";
import { tagService, Tag } from "@/services/tagService";
import { siteService, LocalSite } from "@/services/siteService";
import {
  operatingSystemService,
  OperatingSystem,
} from "@/services/operatingSystemService";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { DeviceModal } from "@/components/device/device-list";
import {
  DeviceDetailBreadcrumb,
  DeviceDetailHeader,
  DeviceDetailTabs,
  DeviceDetailCards,
  DeviceConfigurationTab,
} from "@/components/device/device-detail";

type TabKey = "overview" | "interfaces" | "configuration" | "backup";

export default function DeviceDetailPage() {
  const params = useParams();
  const deviceId = params?.id as string | undefined;

  const { token } = useAuth();
  const { snackbar, hideSnackbar, showError, showSuccess } = useSnackbar();
  const router = useRouter();

  const [device, setDevice] = useState<DeviceNetwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    isDeleting: boolean;
  }>({
    isOpen: false,
    isDeleting: false,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allSites, setAllSites] = useState<LocalSite[]>([]);
  const [allOperatingSystems, setAllOperatingSystems] = useState<
    OperatingSystem[]
  >([]);

  useEffect(() => {
    const fetchDevice = async () => {
      if (!token || !deviceId) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await deviceNetworkService.getDeviceById(token, deviceId);
        setDevice(data);
      } catch (err: any) {
        const message = err?.message || "Unable to load device detail";
        setError(message);
        showError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, deviceId]);

  // โหลด Tag ทั้งหมดสำหรับใช้ใน Edit Modal (ครั้งเดียว)
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

  // โหลด Local Sites สำหรับใช้ใน Edit Modal (ครั้งเดียว)
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

  // โหลด Operating Systems สำหรับใช้ใน Edit Modal (ครั้งเดียว)
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

  const openDeleteConfirm = () => {
    if (!device) return;
    setConfirmModal({
      isOpen: true,
      isDeleting: false,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      isDeleting: false,
    });
  };

  const handleDeleteDevice = async () => {
    if (!token || !device) return;
    try {
      setConfirmModal((prev) => ({ ...prev, isDeleting: true }));
      await deviceNetworkService.deleteDevice(token, device.id);
      router.push("/device/device-list");
    } catch (err: any) {
      const message = err?.message || "Unable to delete device";
      showError(message);
      setConfirmModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeviceUpdate = (updated: DeviceNetwork) => {
    setDevice(updated);
  };

  const handleEditDevice = () => {
    if (!device) return;
    setIsEditModalOpen(true);
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
            onEdit={handleEditDevice}
            onDelete={openDeleteConfirm}
            onSync={() => {
              // TODO: Implement sync
              console.log("Sync device:", device.device_name);
            }}
          />
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <DeviceDetailTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="text-sm text-gray-500 font-sf-pro-text">
                Loading device detail...
              </div>
            ) : error ? (
              <div className="text-sm text-red-600 font-sf-pro-text">
                {error}
              </div>
            ) : !device ? (
              <div className="text-sm text-gray-500 font-sf-pro-text">
                Device not found.
              </div>
            ) : activeTab === "overview" ? (
              <DeviceDetailCards device={device} />
            ) : activeTab === "configuration" ? (
              <DeviceConfigurationTab
                device={device}
                onPreviewTemplate={(templateId) => {
                  // TODO: Implement template preview modal
                  console.log("Preview template:", templateId);
                }}
              />
            ) : (
              <div className="text-sm text-gray-500 font-sf-pro-text">
                This tab is under development.
              </div>
            )}
          </div>
        </div>

        <MuiSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={hideSnackbar}
          title={snackbar.title}
        />

        <DeviceModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleDeviceUpdate}
          mode="edit"
          device={device}
          allTags={allTags}
          allSites={allSites}
          allOperatingSystems={allOperatingSystems}
          onSubmit={async (data, tagIds) => {
            if (!token || !device) return Promise.reject();

            // อัปเดตข้อมูลพื้นฐานของ Device
            const res = await deviceNetworkService.updateDevice(
              token,
              device.id,
              data
            );

            // จัดการ Tags
            const existingTagIds = device.tags?.map((t) => t.tag_id) ?? [];
            const toAdd = tagIds.filter((id) => !existingTagIds.includes(id));
            const toRemove = existingTagIds.filter(
              (id) => !tagIds.includes(id)
            );

            if (toAdd.length > 0) {
              await deviceNetworkService.assignTagsToDevice(
                token,
                device.id,
                toAdd
              );
            }
            if (toRemove.length > 0) {
              await deviceNetworkService.removeTagsFromDevice(
                token,
                device.id,
                toRemove
              );
            }

            // ดึงข้อมูลล่าสุดกลับมา
            const refreshed = await deviceNetworkService.getDeviceById(
              token,
              device.id
            );
            showSuccess("Device updated successfully");
            return refreshed;
          }}
        />

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title="Confirm Delete Device"
          message={
            device
              ? `Are you sure you want to delete device "${device.device_name}"?`
              : "Are you sure you want to delete this device?"
          }
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={confirmModal.isDeleting}
          onClose={closeConfirmModal}
          onConfirm={handleDeleteDevice}
        />
      </PageLayout>
    </ProtectedRoute>
  );
}