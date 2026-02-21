"use client";

import { AuditLogResponse, AuditAction } from "@/services/auditService";
import { UserProfile } from "@/services/userService";
import UserDisplay from "./UserDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

interface AuditLogTableProps {
  auditLogs: AuditLogResponse[];
  userRole?: string;
  userCache: Record<string, UserProfile>;
  getCachedUserName: (userId: string) => string;
  getUserName: (userId: string) => Promise<string>;
  onShowDetail: (log: AuditLogResponse) => void;
}

export default function AuditLogTable({
  auditLogs,
  userRole,
  userCache,
  getCachedUserName,
  getUserName,
  onShowDetail,
}: AuditLogTableProps) {
  const getActionBadge = (action: AuditAction) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

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
      USER_REGISTER: "Register",
      USER_LOGIN: "Login",
      USER_LOGOUT: "Logout",
      USER_CREATE: "Create User",
      USER_UPDATE: "Update User",
      USER_DELETE: "Delete User",
      ENABLE_TOTP: "Enable TOTP",
      DISABLE_TOTP: "Disable TOTP",
      REGISTER_PASSKEY: "Register Passkey",
      REMOVE_PASSKEY: "Remove Passkey",
      PROMOTE_ROLE: "Promote Role",
      DEMOTE_ROLE: "Demote Role",
      PASSWORD_CHANGE: "Password Change",
      PASSWORD_RESET: "Password Reset",
    };
    return actionMap[action] || action;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              {(userRole === "ADMIN" || userRole === "OWNER") && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                </>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
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
                  {new Date(log.created_at).toLocaleString("th-TH")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getActionBadge(log.action)}>
                    {formatActionText(log.action)}
                  </span>
                </td>
                {(userRole === "ADMIN" || userRole === "OWNER") && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <UserDisplay
                        userId={log.actor_user_id}
                        userCache={userCache}
                        getCachedUserName={getCachedUserName}
                        getUserName={getUserName}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <UserDisplay
                        userId={log.target_user_id}
                        userCache={userCache}
                        getCachedUserName={getCachedUserName}
                        getUserName={getUserName}
                      />
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
                    onClick={() => onShowDetail(log)}
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
  );
}
