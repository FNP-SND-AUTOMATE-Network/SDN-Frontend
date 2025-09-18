"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";

interface AuditLogHeaderProps {
  userRole?: string;
  onRefresh: () => void;
  children?: React.ReactNode;
}

export default function AuditLogHeader({
  userRole,
  onRefresh,
  children,
}: AuditLogHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-sf-pro-display">
          Audit Log
        </h1>
        <p className="text-gray-600 font-sf-pro-text mt-1">
          {userRole === "ADMIN" || userRole === "OWNER"
            ? "รายการกิจกรรมทั้งหมดในระบบ"
            : "รายการกิจกรรมของคุณ"}
        </p>
      </div>
      <div className="flex space-x-2">
        {children}
        <button
          onClick={onRefresh}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors font-sf-pro-text"
        >
          <FontAwesomeIcon icon={faRefresh} className="mr-2" />
          รีเฟรช
        </button>
      </div>
    </div>
  );
}
