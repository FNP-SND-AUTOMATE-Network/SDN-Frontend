"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faMicrochip,
  faPencil,
  faTrash,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import {
  OperatingSystem,
  OsType,
} from "@/services/operatingSystemService";

interface OperationTableProps {
  operatingSystems: OperatingSystem[];
  onEditOs: (os: OperatingSystem) => void;
  onDeleteOs: (osId: string, osName: string) => void;
  onViewOs?: (os: OperatingSystem) => void;
}

const getOsTypeBadge = (osType: OsType) => {
  const badges: Record<OsType, { label: string; className: string }> = {
    CISCO_IOS: { label: "Cisco IOS", className: "bg-green-100 text-green-800" },
    CISCO_NXOS: { label: "Cisco NX-OS", className: "bg-blue-100 text-blue-800" },
    CISCO_ASA: { label: "Cisco ASA", className: "bg-red-100 text-red-800" },
    CISCO_Nexus: { label: "Cisco Nexus", className: "bg-purple-100 text-purple-800" },
    CISCO_IOS_XR: { label: "Cisco IOS-XR", className: "bg-yellow-100 text-yellow-800" },
    CISCO_IOS_XE: { label: "Cisco IOS-XE", className: "bg-gray-100 text-gray-800" },
    OTHER: { label: "Other", className: "bg-gray-100 text-gray-800" },
  };
  return badges[osType] || badges.OTHER;
};

// Calculate color brightness for tag text color
const getColorBrightness = (hexColor: string): number => {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
};

const getTagTextColor = (backgroundColor: string): string => {
  const brightness = getColorBrightness(backgroundColor);
  return brightness > 128 ? "#000000" : "#FFFFFF";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function OperationTable({
  operatingSystems,
  onEditOs,
  onDeleteOs,
  onViewOs,
}: OperationTableProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownClick = (e: React.MouseEvent, osId: string) => {
    e.stopPropagation();

    if (openDropdownId === osId) {
      setOpenDropdownId(null);
      return;
    }

    const button = e.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.right - 176, // 176px = w-44 (11rem)
    });
    setOpenDropdownId(osId);
  };

  const handleEdit = (os: OperatingSystem) => {
    onEditOs(os);
    setOpenDropdownId(null);
  };

  const handleDelete = (os: OperatingSystem) => {
    onDeleteOs(os.id, os.os_name);
    setOpenDropdownId(null);
  };

  const handleView = (os: OperatingSystem) => {
    if (onViewOs) {
      onViewOs(os);
    }
    setOpenDropdownId(null);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider first:rounded-tl-lg">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Devices
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Backups
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {operatingSystems.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500 font-sf-pro-text"
                >
                  <FontAwesomeIcon
                    icon={faMicrochip}
                    className="w-12 h-12 mx-auto mb-3 text-gray-300"
                  />
                  <p className="text-lg font-medium">No operating systems found</p>
                  <p className="text-sm text-gray-400">Add a new OS to get started</p>
                </td>
              </tr>
            ) : (
              operatingSystems.map((os) => {
                const typeBadge = getOsTypeBadge(os.os_type);
                return (
                  <tr key={os.id} className="hover:bg-gray-50 transition-colors">
                    {/* Name Column */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 font-sf-pro-text">
                          {os.os_name}
                        </div>
                        {os.description && (
                          <div className="text-xs text-gray-500 font-sf-pro-text truncate max-w-xs">
                            {os.description}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Type Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${typeBadge.className}`}>
                        {typeBadge.label}
                      </span>
                    </td>

                    {/* Tags Column */}
                    <td className="px-6 py-4">
                      {os.tags && os.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {os.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.tag_id}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border"
                              style={{
                                backgroundColor: `${tag.color}20`,
                                borderColor: tag.color,
                                color: tag.color,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              {tag.tag_name}
                            </span>
                          ))}
                          {os.tags.length > 3 && (
                            <span className="text-xs text-gray-500 font-medium">
                              +{os.tags.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>

                    {/* Devices Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900 font-sf-pro-text">
                        {os.device_count || 0}
                      </span>
                    </td>

                    {/* Backups Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900 font-sf-pro-text">
                        {os.backup_count || 0}
                      </span>
                    </td>

                    {/* Updated Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 font-sf-pro-text">
                        {formatDate(os.updated_at)}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => handleDropdownClick(e, os.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FontAwesomeIcon icon={faEllipsisVertical} className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Portal Dropdown Menu - Renders outside table DOM */}
      {openDropdownId && typeof window !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[9999]"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
        >
          {onViewOs && (
            <button
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              onClick={() => {
                const os = operatingSystems.find(o => o.id === openDropdownId);
                if (os) handleView(os);
              }}
            >
              <FontAwesomeIcon icon={faEye} className="w-4 h-4 text-blue-600" />
              View Details
            </button>
          )}
          <button
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            onClick={() => {
              const os = operatingSystems.find(o => o.id === openDropdownId);
              if (os) handleEdit(os);
            }}
          >
            <FontAwesomeIcon icon={faPencil} className="w-4 h-4 text-blue-600" />
            Edit
          </button>
          <hr className="my-1 border-gray-200" />
          <button
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            onClick={() => {
              const os = operatingSystems.find(o => o.id === openDropdownId);
              if (os) handleDelete(os);
            }}
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
            Delete
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
