"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import {
  auditService,
  AuditLogResponse,
  AuditLogListResponse,
  AuditAction,
  APIError,
} from "@/services/auditService";
import { userService, UserProfile } from "@/services/userService";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { useSnackbar } from "@/hooks/useSnackbar";

// Import components
import {
  AuditLogHeader,
  AuditLogFilters,
  AuditLogTable,
  AuditLogDetailModal,
  AuditLogPagination,
  ErrorMessage,
  AuditLogSkeleton,
} from "@/components/audit";

export default function AuditLogPage() {
  const { user, token } = useAuth();
  const { snackbar, hideSnackbar } = useSnackbar();
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    limit: 20, // ลดจำนวนรายการต่อหน้าเพื่อโหลดเร็วขึ้น
    offset: 0,
    total: 0,
    hasMore: false,
  });
  const [filters, setFilters] = useState({
    action: "" as AuditAction | "",
    startDate: "",
    endDate: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);
  const [userCache, setUserCache] = useState<Record<string, UserProfile>>({});
  const [selectedLog, setSelectedLog] = useState<AuditLogResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isPreloadingUsers, setIsPreloadingUsers] = useState(false);
  const [auditLogsCache, setAuditLogsCache] = useState<Record<string, AuditLogResponse[]>>({});

  // Fetch audit logs based on user role
  const fetchAuditLogs = useCallback(
    async (
      offset = 0,
      reset = true,
      currentFilters = filters,
      currentLimit = 20
    ) => {
      if (!token || !user) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      // Create cache key
      const cacheKey = `${user.role}-${currentFilters.action}-${currentFilters.startDate}-${currentFilters.endDate}-${offset}-${currentLimit}`;
      
      // Check cache first
      if (auditLogsCache[cacheKey] && offset === 0) {
        setAuditLogs(auditLogsCache[cacheKey]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // For VIEWER and ENGINEER, only show their own actions
        // For ADMIN and OWNER, show all audit logs
        const auditFilters = {
          ...(user.role === "VIEWER" || user.role === "ENGINEER"
            ? { actor_user_id: user.id }
            : {}),
          ...(currentFilters.action ? { action: currentFilters.action } : {}),
          ...(currentFilters.startDate
            ? { start_date: currentFilters.startDate }
            : {}),
          ...(currentFilters.endDate
            ? { end_date: currentFilters.endDate }
            : {}),
          limit: currentLimit,
          offset: offset,
        };

        const response: AuditLogListResponse = await auditService.getAuditLogs(
          token,
          auditFilters
        );

        if (reset) {
          setAuditLogs(response.items);
          // Cache the first page
          if (offset === 0) {
            setAuditLogsCache((prev) => ({ ...prev, [cacheKey]: response.items }));
          }
        } else {
          setAuditLogs((prev) => [...prev, ...response.items]);
        }

        setPagination({
          limit: response.limit,
          offset: response.offset,
          total: response.total,
          hasMore: response.has_more,
        });

        // Preload user data for all unique user IDs in the response
        const userIds = new Set<string>();
        response.items.forEach((log) => {
          if (log.actor_user_id) userIds.add(log.actor_user_id);
          if (log.target_user_id) userIds.add(log.target_user_id);
        });

        // Fetch user data for all unique IDs that aren't in cache
        const uncachedUserIds = Array.from(userIds).filter(id => !userCache[id]);
        if (uncachedUserIds.length > 0 && token) {
          preloadUserData(uncachedUserIds);
        }
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        if (err instanceof APIError) {
          setError(err.message);
        } else {
          setError("Failed to fetch audit logs");
        }
      } finally {
        setLoading(false);
      }
    },
    [token, user]
  );

  // Debounce filters to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    if (token && user) {
      fetchAuditLogs(0, true, debouncedFilters, pagination.limit);
    }
  }, [
    token,
    user,
    debouncedFilters.action,
    debouncedFilters.startDate,
    debouncedFilters.endDate,
    fetchAuditLogs,
  ]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchAuditLogs(0, true, filters, pagination.limit);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      action: "",
      startDate: "",
      endDate: "",
    });
  };

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      fetchAuditLogs(
        pagination.offset + pagination.limit,
        false,
        filters,
        pagination.limit
      );
    }
  };

  const refreshData = () => {
    fetchAuditLogs(0, true, filters, pagination.limit);
  };

  // Function to preload user data
  const preloadUserData = useCallback(async (userIds: string[]) => {
    if (!token || userIds.length === 0) return;

    setIsPreloadingUsers(true);
    try {
      // Fetch all user data in parallel
      const userPromises = userIds.map(async (userId) => {
        try {
          const userProfile = await userService.getUserById(token, userId);
          return { userId, userProfile };
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
          return null;
        }
      });

      const results = await Promise.all(userPromises);
      
      // Update cache with all successful results
      const newCacheEntries: Record<string, UserProfile> = {};
      results.forEach((result) => {
        if (result) {
          newCacheEntries[result.userId] = result.userProfile;
        }
      });

      if (Object.keys(newCacheEntries).length > 0) {
        setUserCache((prev) => ({ ...prev, ...newCacheEntries }));
      }
    } catch (error) {
      console.error("Error preloading user data:", error);
    } finally {
      setIsPreloadingUsers(false);
    }
  }, [token]);

  // Memoized function to get user name from UUID
  const getUserName = useCallback(
    async (userId: string): Promise<string> => {
      if (!userId) return "System";

      // Check cache first
      if (userCache[userId]) {
        const user = userCache[userId];
        return (
          `${user.name || ""} ${user.surname || ""}`.trim() ||
          user.email ||
          userId
        );
      }

      if (!token) {
        return userId;
      }

      try {
        const userProfile = await userService.getUserById(token, userId);

        // Update cache without causing re-renders
        setUserCache((prev) => ({ ...prev, [userId]: userProfile }));

        const displayName =
          `${userProfile.name || ""} ${userProfile.surname || ""}`.trim() ||
          userProfile.email ||
          userId;

        return displayName;
      } catch (error) {
        console.error("Error fetching user:", error);
        return userId; // Fallback to UUID if user not found
      }
    },
    [token, userCache]
  );

  // Function to get cached user name
  const getCachedUserName = useCallback(
    (userId: string): string => {
      if (!userId) return "System";

      if (userCache[userId]) {
        const user = userCache[userId];
        return (
          `${user.name || ""} ${user.surname || ""}`.trim() ||
          user.email ||
          userId
        );
      }

      return userId; // Return userId if not in cache
    },
    [] // Remove userCache dependency to prevent infinite re-renders
  );

  // Function to show detail modal
  const showDetail = (log: AuditLogResponse) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  // Function to close detail modal
  const closeDetailModal = () => {
    setSelectedLog(null);
    setShowDetailModal(false);
  };

  if (loading && auditLogs.length === 0) {
    return (
      <ProtectedRoute>
        <PageLayout>
          <div className="space-y-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
              <div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
            </div>
            
            {/* Table Skeleton */}
            <AuditLogSkeleton />
          </div>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="space-y-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <AuditLogHeader userRole={user?.role} onRefresh={refreshData}>
            <AuditLogFilters
              filters={filters}
              showFilters={showFilters}
              onFilterChange={handleFilterChange}
              onApplyFilters={applyFilters}
              onClearFilters={clearFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />
          </AuditLogHeader>

          {/* Error Message */}
          <ErrorMessage error={error} />

          {/* Audit Logs Table */}
          {loading && auditLogs.length === 0 ? (
            <AuditLogSkeleton />
          ) : (
            <AuditLogTable
              auditLogs={auditLogs}
              userRole={user?.role}
              userCache={userCache}
              getCachedUserName={getCachedUserName}
              getUserName={getUserName}
              onShowDetail={showDetail}
            />
          )}

          {/* Pagination */}
          <AuditLogPagination
            hasMore={pagination.hasMore}
            loading={loading}
            auditLogsLength={auditLogs.length}
            total={pagination.total}
            onLoadMore={loadMore}
          />

          {/* Loading Indicators */}
          {loading && auditLogs.length > 0 && (
            <div className="text-center text-sm text-gray-500 font-sf-pro-text">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span>กำลังโหลดข้อมูลเพิ่มเติม...</span>
              </div>
            </div>
          )}
          
          {isPreloadingUsers && (
            <div className="text-center text-sm text-gray-500 font-sf-pro-text">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span>กำลังโหลดข้อมูลผู้ใช้...</span>
              </div>
            </div>
          )}
        </div>

        {/* MuiSnackbar for notifications */}
        <MuiSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          title={snackbar.title}
          onClose={hideSnackbar}
          autoHideDuration={6000}
        />

        {/* Detail Modal */}
        <AuditLogDetailModal
          selectedLog={selectedLog}
          showDetailModal={showDetailModal}
          userRole={user?.role}
          userCache={userCache}
          getCachedUserName={getCachedUserName}
          getUserName={getUserName}
          onClose={closeDetailModal}
        />
      </PageLayout>
    </ProtectedRoute>
  );
}
