"use client";

import { useState, useCallback, useEffect } from "react";
import { TablePagination, Alert } from "@mui/material";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { $api } from "@/lib/apiv2/fetch";
import { paths } from "@/lib/apiv2/schema";
import { userService, UserProfile } from "@/services/userService";

// Import components
import {
  AuditLogHeader,
  AuditLogFilters,
  AuditLogTable,
  AuditLogDetailModal,
  AuditLogSkeleton,
} from "@/components/audit";

type AuditLogResponse =
  paths["/audit/logs"]["get"]["responses"]["200"]["content"]["application/json"]["items"][number];
type FilterQuery = NonNullable<
  paths["/audit/logs"]["get"]["parameters"]["query"]
>;

export default function AuditLogPage() {
  const { user, isAuthenticated } = useAuth();

  // States
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [filters, setFilters] = useState({
    action: "",
    startDate: "",
    endDate: "",
  });

  const [selectedLog, setSelectedLog] = useState<AuditLogResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userCache, setUserCache] = useState<Record<string, UserProfile>>({});

  // Parse start/end dates
  const parsedStart = filters.startDate ? new Date(filters.startDate) : null;
  const isoStart =
    parsedStart && !isNaN(parsedStart.getTime())
      ? parsedStart.toISOString()
      : undefined;

  const parsedEnd = filters.endDate ? new Date(filters.endDate) : null;
  const isoEnd =
    parsedEnd && !isNaN(parsedEnd.getTime())
      ? parsedEnd.toISOString()
      : undefined;

  // UseQuery to fetch logs
  const {
    data: auditLogsResponse,
    isLoading,
    error,
    refetch,
  } = $api.useQuery(
    "get",
    "/audit/logs",
    {
      params: {
        query: {
          limit: pageSize,
          offset: page * pageSize,
          action: (filters.action as FilterQuery["action"]) || undefined,
          start_date: isoStart,
          end_date: isoEnd,
        },
      },
    },
    {
      enabled: isAuthenticated,
    }
  );

  const auditLogs = auditLogsResponse?.items ?? [];
  const totalLogs = auditLogsResponse?.total ?? 0;

  // Preload Users for actor/target displaying
  useEffect(() => {
    if (!isAuthenticated || auditLogs.length === 0) return;

    const userIds = new Set<string>();
    auditLogs.forEach((log) => {
      if (log.actor_user_id) userIds.add(log.actor_user_id);
      if (log.target_user_id) userIds.add(log.target_user_id);
    });

    const uncachedUserIds = Array.from(userIds).filter((id) => !userCache[id]);

    if (uncachedUserIds.length > 0) {
      Promise.all(
        uncachedUserIds.map(async (userId) => {
          try {
            const userProfile = await userService.getUserById(userId);
            return { userId, userProfile };
          } catch {
            return null;
          }
        })
      ).then((results) => {
        const newCacheEntries: Record<string, UserProfile> = {};
        results.forEach((res) => {
          if (res) newCacheEntries[res.userId] = res.userProfile;
        });
        if (Object.keys(newCacheEntries).length > 0) {
          setUserCache((prev) => ({ ...prev, ...newCacheEntries }));
        }
      });
    }
  }, [auditLogs, isAuthenticated, userCache]);

  const getUserName = useCallback(
    async (userId: string): Promise<string> => {
      if (!userId) return "System";
      if (userCache[userId]) {
        const u = userCache[userId];
        return `${u.name || ""} ${u.surname || ""}`.trim() || u.email || userId;
      }
      try {
        const u = await userService.getUserById(userId);
        setUserCache((prev) => ({ ...prev, [userId]: u }));
        return `${u.name || ""} ${u.surname || ""}`.trim() || u.email || userId;
      } catch {
        return userId;
      }
    },
    [userCache]
  );

  const getCachedUserName = useCallback(
    (userId: string): string => {
      if (!userId) return "System";
      if (userCache[userId]) {
        const u = userCache[userId];
        return `${u.name || ""} ${u.surname || ""}`.trim() || u.email || userId;
      }
      return userId;
    },
    [userCache]
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({ action: "", startDate: "", endDate: "" });
    setPage(0);
  };

  if (user?.role === "VIEWER") {
    return (
      <ProtectedRoute>
        <PageLayout>
          <Alert severity="error" sx={{ m: 4 }}>
            You do not have permission to access this page.
          </Alert>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageLayout>
        <AuditLogHeader
          userRole={user?.role}
          onRefresh={() => refetch()}
          totalLogs={totalLogs}
        >
          <AuditLogFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        </AuditLogHeader>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load audit logs. Please try again.
          </Alert>
        )}

        {isLoading ? (
          <AuditLogSkeleton />
        ) : (
          <>
            <AuditLogTable
              auditLogs={auditLogs}
              userRole={user?.role}
              userCache={userCache}
              getCachedUserName={getCachedUserName}
              getUserName={getUserName}
              onShowDetail={(log) => {
                setSelectedLog(log);
                setShowDetailModal(true);
              }}
            />

            <TablePagination
              component="div"
              count={totalLogs}
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

        <AuditLogDetailModal
          selectedLog={selectedLog}
          showDetailModal={showDetailModal}
          userRole={user?.role}
          userCache={userCache}
          getCachedUserName={getCachedUserName}
          getUserName={getUserName}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedLog(null);
          }}
        />
      </PageLayout>
    </ProtectedRoute>
  );
}
