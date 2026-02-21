"use client";

import { AuditLogResponse, AuditAction } from "@/services/auditService";
import { UserProfile } from "@/services/userService";
import UserDisplay from "./UserDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTimes } from "@fortawesome/free-solid-svg-icons";

interface AuditLogDetailModalProps {
  selectedLog: AuditLogResponse | null;
  showDetailModal: boolean;
  userRole?: string;
  userCache: Record<string, UserProfile>;
  getCachedUserName: (userId: string) => string;
  getUserName: (userId: string) => Promise<string>;
  onClose: () => void;
}

export default function AuditLogDetailModal({
  selectedLog,
  showDetailModal,
  userRole,
  userCache,
  getCachedUserName,
  getUserName,
  onClose,
}: AuditLogDetailModalProps) {
  if (!showDetailModal || !selectedLog) return null;

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

  const formatDetails = (details: Record<string, any> | null): string => {
    if (!details) return "No additional details";

    const formattedDetails: string[] = [];

    Object.entries(details).forEach(([key, value]) => {
      const formattedKey = formatKey(key);
      const formattedValue = formatValue(value);
      formattedDetails.push(`${formattedKey}: ${formattedValue}`);
    });

    return formattedDetails.join("\n");
  };

  const formatKey = (key: string): string => {
    const keyMap: Record<string, string> = {
      user_id: "User ID",
      email: "Email",
      name: "Name",
      surname: "Surname",
      role: "Role",
      old_role: "Old Role",
      new_role: "New Role",
      ip_address: "IP Address",
      user_agent: "User Agent",
      timestamp: "Time",
      success: "Status",
      reason: "Reason",
      device_info: "Device Info",
      location: "Location",
    };
    return keyMap[key] || key;
  };

  const formatValue = (value: any): string => {
    if (typeof value === "boolean") {
      return value ? "Success" : "Failed";
    }
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
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
            onClick={onClose}
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
                {new Date(selectedLog.created_at).toLocaleString("th-TH")}
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

          {(userRole === "ADMIN" || userRole === "OWNER") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-sf-pro-text">
                  ผู้กระทำ
                </label>
                <p className="text-sm text-gray-900 font-sf-pro-text">
                  <UserDisplay
                    userId={selectedLog.actor_user_id}
                    userCache={userCache}
                    getCachedUserName={getCachedUserName}
                    getUserName={getUserName}
                  />
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-sf-pro-text">
                  ผู้ถูกกระทำ
                </label>
                <p className="text-sm text-gray-900 font-sf-pro-text">
                  <UserDisplay
                    userId={selectedLog.target_user_id}
                    userCache={userCache}
                    getCachedUserName={getCachedUserName}
                    getUserName={getUserName}
                  />
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
            onClick={onClose}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-sf-pro-text"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
