"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  TablePagination,
  Stack,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { useSnackbar } from "@/hooks/useSnackbar";
import { BackupHeader, BackupTable, BackupStatusOverlay, BackupJobResult, BackupJobStatus, BackupScheduleModal, BackupScheduleList } from "@/components/device/backup";
import { DeviceSkeleton } from "@/components/device/device-list";
import { $api, fetchClient } from "@/lib/apiv2/fetch";
import { paths } from "@/lib/apiv2/schema";

type FilterQuery = NonNullable<paths["/device-networks/"]["get"]["parameters"]["query"]>;

export default function DeviceBackupPage() {
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();
  const queryClient = useQueryClient();

  // --- Filter & Pagination State ---
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [deviceType, setDeviceType] = useState<FilterQuery["device_type"]>("");
  const [siteId, setSiteId] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isTriggering, setIsTriggering] = useState(false);
  const [backupResult, setBackupResult] = useState<BackupJobResult[] | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // --- Fetch devices ---
  const { data: devicesResponse, isLoading, error: devicesError } = $api.useQuery("get", "/device-networks/", {
    params: {
      query: {
        page: page + 1,
        page_size: pageSize,
        device_type: deviceType || undefined,
        site_id: siteId || undefined,
        search: debouncedSearch || undefined,
      },
    },
  });

  const devices = devicesResponse?.devices ?? [];
  const totalDevices = devicesResponse?.total ?? 0;

  // Derive status counts mapping
  const onlineCount = devices.filter(d => d.status === "ONLINE").length;

  // Fetch backup stats from the backend
  const { data: backupStatsResponse, refetch: refetchBackupStats } = $api.useQuery(
    "get",
    "/api/v1/devices/backups/stats/summary",
    {}, // fetch parameters (empty)
    { refetchInterval: 10000 } // React Query options
  );

  // Extract unique sites for the filter dropdown
  const uniqueSites = Array.from(new Map(
    devices.filter(d => d.localSite).map(d => [d.localSite?.id, { id: d.localSite?.id as string, name: d.localSite?.site_name || d.localSite?.site_code as string }])
  ).values());

  // --- Handlers ---
  const handleSearch = (searchTerm: string) => setSearch(searchTerm);

  const handleFilterChange = (filters: { type: string; site: string }) => {
    setDeviceType(filters.type as FilterQuery["device_type"]);
    setSiteId(filters.site);
    setPage(0);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(devices.map((device) => device.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  const handleRunBackup = async () => {
    if (selectedIds.length === 0) return;

    try {
      setIsTriggering(true);
      const { data, error } = await fetchClient.POST("/api/v1/devices/backups", {
        body: {
          device_ids: selectedIds,
          config_type: "RUNNING",
        }
      });

      if (error) throw error; // Reusing original HTTP client logic to catch openapi schema errors

      showSuccess("Backup triggered successfully for selected devices");

      // Initialize result with IN_PROGRESS using actual returned record IDs
      const generatedRecords: string[] = Array.isArray(data.job_info?.record_ids)
        ? data.job_info.record_ids as string[]
        : [];

      const initialJobs: BackupJobResult[] = generatedRecords.map((recordId: string, idx: number) => ({
        id: recordId,
        name: devices.find(d => d.id === selectedIds[idx])?.device_name || `Backup Job ${idx + 1}`,
        status: "IN_PROGRESS"
      }));

      setBackupResult(initialJobs);
      setShowOverlay(true);

      // Recursive polling function
      const pollStatus = async (recordsToPoll: string[]) => {
        if (recordsToPoll.length === 0) return;

        setTimeout(async () => {
          try {
            const nextPollList: string[] = [];

            for (const recordId of recordsToPoll) {
              const res = await fetchClient.GET("/api/v1/devices/backups/{record_id}", {
                params: { path: { record_id: recordId } }
              });

              if (res.data) {
                // @ts-ignore - Temporary bypass to parse Prisma dictionary properties
                const status = res.data.status || "IN_PROGRESS";

                setBackupResult(prev =>
                  prev?.map(job =>
                    job.id === recordId
                      ? { ...job, status: status as BackupJobStatus }
                      : job
                  ) || null
                );

                if (status === "IN_PROGRESS") {
                  nextPollList.push(recordId);
                }
              }
            }

            // Continue polling those that are still IN_PROGRESS
            if (nextPollList.length > 0) {
              pollStatus(nextPollList);
            } else {
              // Refresh stats when all backups complete
              refetchBackupStats();
            }
          } catch (e) {
            console.error("Polling error", e);
          }
        }, 3000); // Poll every 3 seconds
      };

      // Start polling
      pollStatus(generatedRecords);

    } catch (err: unknown) {
      console.error("Backup failed", err);
      showError(err instanceof Error ? err.message : "Failed to trigger backup");
    } finally {
      setIsTriggering(false);
    }
  };

  const handleScheduleBackup = () => {
    setIsScheduleModalOpen(true);
  };

  const selectedDeviceObjects = devices
    .filter((d) => selectedIds.includes(d.id))
    .map((d) => ({ id: d.id, device_name: d.device_name || d.id }));

  return (
    <ProtectedRoute>
      <PageLayout>
        {isLoading ? (
          <DeviceSkeleton />
        ) : (
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              {/* Page Title */}
              <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Device Backups
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage configuration backups across network devices
                  </Typography>
                </Box>
              </Box>
              <Tabs value={tabIndex} onChange={(_, nv) => setTabIndex(nv)}>
                <Tab label="Devices" sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab label="Scheduled Tasks" sx={{ textTransform: 'none', fontWeight: 600 }} />
              </Tabs>
            </Box>

            {tabIndex === 0 && (
              <Box>
                <BackupHeader
                  onSearch={handleSearch}
                  onFilterChange={handleFilterChange}
                  onRunBackup={handleRunBackup}
                  onScheduleBackup={handleScheduleBackup}
                  searchTerm={search}
                  selectedType={deviceType ?? ""}
                  selectedSite={siteId}
                  selectedCount={selectedIds.length}
                  isTriggering={isTriggering}
                  sites={uniqueSites}
                  statusCounts={{
                    total: totalDevices,
                    online: onlineCount,
                    lastSuccess: backupStatsResponse?.last_success || 0,
                    lastFailed: backupStatsResponse?.last_failed || 0,
                  }}
                />

                <BackupTable
                  devices={devices}
                  selectedIds={selectedIds}
                  onSelectAll={handleSelectAll}
                  onSelectRow={handleSelectRow}
                />

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
              </Box>
            )}

            {tabIndex === 1 && (
              <BackupScheduleList onTriggerNew={() => setIsScheduleModalOpen(true)} />
            )}
          </Box>
        )}

        <BackupStatusOverlay
          open={showOverlay}
          jobs={backupResult}
          onClose={() => setShowOverlay(false)}
        />

        <BackupScheduleModal
          open={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          selectedDevices={selectedDeviceObjects}
          onSuccess={() => {
            setSelectedIds([]);
            refetchBackupStats();
            // Invalidate the /backups/ query so BackupScheduleList refetches
            queryClient.invalidateQueries({ queryKey: ["get", "/backups/"] });
            // Switch to Schedules tab to show the new card
            setTabIndex(1);
            showSuccess("Backup schedule created successfully!");
          }}
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
