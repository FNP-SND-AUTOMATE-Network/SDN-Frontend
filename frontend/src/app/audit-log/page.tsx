"use client";

import { useState, useEffect, useCallback } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { auditService, AuditLogResponse, AuditLogListResponse, AuditAction, APIError } from "@/services/auditService";
import { userService, UserProfile } from "@/services/userService";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { useSnackbar } from "@/hooks/useSnackbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faFilter, faRefresh, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function AuditLogPage() {
  const { user, token } = useAuth();
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0,
    hasMore: false
  });
  const [filters, setFilters] = useState({
    action: "" as AuditAction | "",
    startDate: "",
    endDate: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [userCache, setUserCache] = useState<Record<string, UserProfile>>({});
  const [selectedLog, setSelectedLog] = useState<AuditLogResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch audit logs based on user role
  const fetchAuditLogs = useCallback(async (offset = 0, reset = true) => {
    if (!token || !user) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // For VIEWER and ENGINEER, only show their own actions
      // For ADMIN and OWNER, show all audit logs
      const auditFilters = {
        ...(user.role === "VIEWER" || user.role === "ENGINEER" ? { actor_user_id: user.id } : {}),
        ...(filters.action ? { action: filters.action } : {}),
        ...(filters.startDate ? { start_date: filters.startDate } : {}),
        ...(filters.endDate ? { end_date: filters.endDate } : {}),
        limit: pagination.limit,
        offset: offset
      };

      const response: AuditLogListResponse = await auditService.getAuditLogs(token, auditFilters);
      
      if (reset) {
        setAuditLogs(response.items);
      } else {
        setAuditLogs(prev => [...prev, ...response.items]);
      }
      
      setPagination({
        limit: response.limit,
        offset: response.offset,
        total: response.total,
        hasMore: response.has_more
      });
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('Failed to fetch audit logs');
      }
    } finally {
      setLoading(false);
    }
  }, [token, user, filters, pagination.limit]);

  useEffect(() => {
    if (token && user) {
      fetchAuditLogs(0, true);
    }
  }, [token, user, fetchAuditLogs]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchAuditLogs(0, true);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      action: "",
      startDate: "",
      endDate: ""
    });
  };

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      fetchAuditLogs(pagination.offset + pagination.limit, false);
    }
  };

  const refreshData = () => {
    fetchAuditLogs(0, true);
  };

  // Function to get user name from UUID
  const getUserName = async (userId: string): Promise<string> => {
    if (!userId) return "System";
    
    // Check cache first
    if (userCache[userId]) {
      const user = userCache[userId];
      return `${user.name || ''} ${user.surname || ''}`.trim() || user.email || userId;
    }

    try {
      const userProfile = await userService.getUserById(token!, userId);
      setUserCache(prev => ({ ...prev, [userId]: userProfile }));
      return `${userProfile.name || ''} ${userProfile.surname || ''}`.trim() || userProfile.email || userId;
    } catch (error) {
      console.error('Error fetching user:', error);
      return userId; // Fallback to UUID if user not found
    }
  };

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

  // Function to format details for display
  const formatDetails = (details: Record<string, any> | null): string => {
    if (!details) return "ไม่มีรายละเอียดเพิ่มเติม";
    
    const formattedDetails: string[] = [];
    
    Object.entries(details).forEach(([key, value]) => {
      const formattedKey = formatKey(key);
      const formattedValue = formatValue(value);
      formattedDetails.push(`${formattedKey}: ${formattedValue}`);
    });
    
    return formattedDetails.join('\n');
  };

  const formatKey = (key: string): string => {
    const keyMap: Record<string, string> = {
      'user_id': 'ID ผู้ใช้',
      'email': 'อีเมล',
      'name': 'ชื่อ',
      'surname': 'นามสกุล',
      'role': 'บทบาท',
      'old_role': 'บทบาทเดิม',
      'new_role': 'บทบาทใหม่',
      'ip_address': 'IP Address',
      'user_agent': 'User Agent',
      'timestamp': 'เวลา',
      'success': 'สถานะ',
      'reason': 'เหตุผล',
      'device_info': 'ข้อมูลอุปกรณ์',
      'location': 'ตำแหน่ง'
    };
    return keyMap[key] || key;
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'boolean') {
      return value ? 'สำเร็จ' : 'ไม่สำเร็จ';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const getActionBadge = (action: AuditAction) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (action) {
      case "USER_LOGIN":
      case "USER_REGISTER":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "USER_LOGOUT":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case "USER_CREATE":
      case "USER_UPDATE":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "USER_DELETE":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "PASSWORD_CHANGE":
      case "PASSWORD_RESET":
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case "PROMOTE_ROLE":
      case "DEMOTE_ROLE":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case "ENABLE_TOTP":
      case "DISABLE_TOTP":
      case "REGISTER_PASSKEY":
      case "REMOVE_PASSKEY":
        return `${baseClasses} bg-indigo-100 text-indigo-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatActionText = (action: AuditAction) => {
    const actionMap: Record<AuditAction, string> = {
      USER_REGISTER: "สมัครสมาชิก",
      USER_LOGIN: "เข้าสู่ระบบ",
      USER_LOGOUT: "ออกจากระบบ",
      USER_CREATE: "สร้างผู้ใช้",
      USER_UPDATE: "อัพเดทผู้ใช้",
      USER_DELETE: "ลบผู้ใช้",
      USER_VIEW: "ดูข้อมูลผู้ใช้",
      USER_LIST: "ดูรายการผู้ใช้",
      ENABLE_TOTP: "เปิดใช้งาน TOTP",
      DISABLE_TOTP: "ปิดใช้งาน TOTP",
      REGISTER_PASSKEY: "ลงทะเบียน Passkey",
      REMOVE_PASSKEY: "ลบ Passkey",
      PROMOTE_ROLE: "เพิ่มสิทธิ์",
      DEMOTE_ROLE: "ลดสิทธิ์",
      PASSWORD_CHANGE: "เปลี่ยนรหัสผ่าน",
      PASSWORD_RESET: "รีเซ็ตรหัสผ่าน"
    };
    return actionMap[action] || action;
  };

  if (loading && auditLogs.length === 0) {
    return (
      <ProtectedRoute>
        <PageLayout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-sf-pro-display">Audit Log</h1>
              <p className="text-gray-600 font-sf-pro-text mt-1">
                {user?.role === "ADMIN" || user?.role === "OWNER" 
                  ? "รายการกิจกรรมทั้งหมดในระบบ" 
                  : "รายการกิจกรรมของคุณ"
                }
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-sf-pro-text"
              >
                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                ตัวกรอง
              </button>
              <button
                onClick={refreshData}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors font-sf-pro-text"
              >
                <FontAwesomeIcon icon={faRefresh} className="mr-2" />
                รีเฟรช
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-sf-pro-display">ตัวกรองข้อมูล</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-sf-pro-text">
                    ประเภทการกระทำ
                  </label>
                  <select
                    value={filters.action}
                    onChange={(e) => handleFilterChange("action", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-sf-pro-text"
                  >
                    <option value="">ทั้งหมด</option>
                    <option value="USER_LOGIN">เข้าสู่ระบบ</option>
                    <option value="USER_LOGOUT">ออกจากระบบ</option>
                    <option value="USER_CREATE">สร้างผู้ใช้</option>
                    <option value="USER_UPDATE">อัพเดทผู้ใช้</option>
                    <option value="USER_DELETE">ลบผู้ใช้</option>
                    <option value="PASSWORD_CHANGE">เปลี่ยนรหัสผ่าน</option>
                    <option value="PASSWORD_RESET">รีเซ็ตรหัสผ่าน</option>
                    <option value="PROMOTE_ROLE">เพิ่มสิทธิ์</option>
                    <option value="DEMOTE_ROLE">ลดสิทธิ์</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-sf-pro-text">
                    วันที่เริ่มต้น
                  </label>
                  <input
                    type="datetime-local"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-sf-pro-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-sf-pro-text">
                    วันที่สิ้นสุด
                  </label>
                  <input
                    type="datetime-local"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-sf-pro-text"
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={applyFilters}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors font-sf-pro-text"
                >
                  ใช้ตัวกรอง
                </button>
                <button
                  onClick={clearFilters}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-sf-pro-text"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audit Logs Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      เวลา
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การกระทำ
                    </th>
                    {(user?.role === "ADMIN" || user?.role === "OWNER") && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ผู้กระทำ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ผู้ถูกกระทำ
                        </th>
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รายละเอียด
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.created_at).toLocaleString('th-TH')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getActionBadge(log.action)}>
                          {formatActionText(log.action)}
                        </span>
                      </td>
                      {(user?.role === "ADMIN" || user?.role === "OWNER") && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <UserDisplay userId={log.actor_user_id} userCache={userCache} getUserName={getUserName} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <UserDisplay userId={log.target_user_id} userCache={userCache} getUserName={getUserName} />
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.details ? (
                          <div className="max-w-xs truncate">
                            {JSON.stringify(log.details)}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => showDetail(log)}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                          title="ดูรายละเอียด"
                        >
                          <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Load More Button */}
          {pagination.hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sf-pro-text"
              >
                {loading ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
              </button>
            </div>
          )}

          {/* Pagination Info */}
          <div className="text-center text-sm text-gray-600 font-sf-pro-text">
            แสดง {auditLogs.length} จาก {pagination.total} รายการ
          </div>
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
        {showDetailModal && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg">
                    <FontAwesomeIcon
                      icon={faEye}
                      className="w-5 h-5 text-primary-600"
                    />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 font-sf-pro-display">
                    รายละเอียด Audit Log
                  </h2>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-sf-pro-text">
                      เวลา
                    </label>
                    <p className="text-sm text-gray-900 font-sf-pro-text">
                      {new Date(selectedLog.created_at).toLocaleString('th-TH')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-sf-pro-text">
                      การกระทำ
                    </label>
                    <span className={getActionBadge(selectedLog.action)}>
                      {formatActionText(selectedLog.action)}
                    </span>
                  </div>
                </div>

                {(user?.role === "ADMIN" || user?.role === "OWNER") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-sf-pro-text">
                        ผู้กระทำ
                      </label>
                      <p className="text-sm text-gray-900 font-sf-pro-text">
                        <UserDisplay userId={selectedLog.actor_user_id} userCache={userCache} getUserName={getUserName} />
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-sf-pro-text">
                        ผู้ถูกกระทำ
                      </label>
                      <p className="text-sm text-gray-900 font-sf-pro-text">
                        <UserDisplay userId={selectedLog.target_user_id} userCache={userCache} getUserName={getUserName} />
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-sf-pro-text">
                    รายละเอียดเพิ่มเติม
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-900 font-sf-pro-text whitespace-pre-wrap">
                      {formatDetails(selectedLog.details || null)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end p-6 border-t border-gray-200">
                <button
                  onClick={closeDetailModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-sf-pro-text"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </ProtectedRoute>
  );
}

// UserDisplay Component
interface UserDisplayProps {
  userId?: string;
  userCache: Record<string, UserProfile>;
  getUserName: (userId: string) => Promise<string>;
}

const UserDisplay: React.FC<UserDisplayProps> = ({ userId, userCache, getUserName }) => {
  const [displayName, setDisplayName] = useState<string>(userId || "System");

  useEffect(() => {
    if (userId && !userCache[userId]) {
      getUserName(userId).then(setDisplayName);
    } else if (userId && userCache[userId]) {
      const user = userCache[userId];
      setDisplayName(`${user.name || ''} ${user.surname || ''}`.trim() || user.email || userId);
    }
  }, [userId, userCache, getUserName]);

  return <span>{displayName}</span>;
};