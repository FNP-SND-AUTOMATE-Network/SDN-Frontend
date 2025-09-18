"use client";

import { useEffect } from "react";
import { AuditAction } from "@/services/auditService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faTimes,
  faCog,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";

interface AuditLogFiltersProps {
  filters: {
    action: AuditAction | "";
    startDate: string;
    endDate: string;
  };
  showFilters: boolean;
  onFilterChange: (key: string, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  onToggleFilters: () => void;
}

export default function AuditLogFilters({
  filters,
  showFilters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  onToggleFilters,
}: AuditLogFiltersProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showFilters) {
        onToggleFilters();
      }
    };

    if (showFilters) {
      document.addEventListener("keydown", handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [showFilters, onToggleFilters]);

  return (
    <>
      {/* Filter Toggle Button */}
      <button
        onClick={onToggleFilters}
        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-sf-pro-text"
      >
        <FontAwesomeIcon icon={faFilter} className="mr-2" />
        ตัวกรอง
      </button>

      {/* Filters Modal */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onToggleFilters}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg">
                  <FontAwesomeIcon
                    icon={faFilter}
                    className="w-5 h-5 text-primary-600"
                  />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 font-sf-pro-display">
                  ตัวกรองข้อมูล Audit Log
                </h2>
              </div>
              <button
                onClick={onToggleFilters}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon
                      icon={faCog}
                      className="w-4 h-4 text-gray-600"
                    />
                    <label className="text-sm font-semibold text-gray-800 font-sf-pro-text">
                      ประเภทการกระทำ
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={filters.action}
                      onChange={(e) => onFilterChange("action", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sf-pro-text bg-white hover:border-gray-400 transition-colors"
                    >
                      <option value="">เลือกประเภทการกระทำ</option>
                      <optgroup label="การเข้าสู่ระบบ">
                        <option value="USER_LOGIN">เข้าสู่ระบบ</option>
                        <option value="USER_LOGOUT">ออกจากระบบ</option>
                      </optgroup>
                      <optgroup label="การจัดการผู้ใช้">
                        <option value="USER_CREATE">สร้างผู้ใช้</option>
                        <option value="USER_UPDATE">อัพเดทผู้ใช้</option>
                        <option value="USER_DELETE">ลบผู้ใช้</option>
                      </optgroup>
                      <optgroup label="การจัดการรหัสผ่าน">
                        <option value="PASSWORD_CHANGE">
                          เปลี่ยนรหัสผ่าน
                        </option>
                        <option value="PASSWORD_RESET">
                          รีเซ็ตรหัสผ่าน
                        </option>
                      </optgroup>
                      <optgroup label="การจัดการสิทธิ์">
                        <option value="PROMOTE_ROLE">เพิ่มสิทธิ์</option>
                        <option value="DEMOTE_ROLE">ลดสิทธิ์</option>
                      </optgroup>
                      <optgroup label="การยืนยันตัวตน">
                        <option value="ENABLE_TOTP">เปิดใช้งาน TOTP</option>
                        <option value="DISABLE_TOTP">ปิดใช้งาน TOTP</option>
                        <option value="REGISTER_PASSKEY">
                          ลงทะเบียน Passkey
                        </option>
                        <option value="REMOVE_PASSKEY">ลบ Passkey</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="w-4 h-4 text-gray-600"
                    />
                    <label className="text-sm font-semibold text-gray-800 font-sf-pro-text">
                      ช่วงเวลา
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 font-sf-pro-text">
                        วันที่เริ่มต้น
                      </label>
                      <input
                        type="datetime-local"
                        value={filters.startDate}
                        onChange={(e) =>
                          onFilterChange("startDate", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sf-pro-text bg-white hover:border-gray-400 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 font-sf-pro-text">
                        วันที่สิ้นสุด
                      </label>
                      <input
                        type="datetime-local"
                        value={filters.endDate}
                        onChange={(e) =>
                          onFilterChange("endDate", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sf-pro-text bg-white hover:border-gray-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-6 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="text-sm text-gray-600 font-sf-pro-text"></div>
              <div className="flex space-x-3">
                <button
                  onClick={onClearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 font-sf-pro-text shadow-sm hover:shadow-md"
                >
                  ล้างตัวกรอง
                </button>
                <button
                  onClick={onApplyFilters}
                  className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 font-sf-pro-text shadow-sm hover:shadow-md"
                >
                  ใช้ตัวกรอง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
