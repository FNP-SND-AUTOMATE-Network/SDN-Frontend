"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faNetworkWired,
  faEllipsisVertical,
  faEye,
  faEdit,
  faSync,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {
  Router as RouterIcon,
  Shield,
  Wifi,
  Box,
  Server,
} from "lucide-react";
import { DeviceNetwork } from "@/services/deviceNetworkService";

interface DeviceTableProps {
  devices: DeviceNetwork[];
  onEdit?: (device: DeviceNetwork) => void;
  onSync?: (device: DeviceNetwork) => void;
  onDelete?: (device: DeviceNetwork) => void;
}

const getStatusDot = (status: string) => {
  switch (status) {
    case "ONLINE":
      return "bg-green-500";
    case "OFFLINE":
      return "bg-red-500";
    case "MAINTENANCE":
      return "bg-blue-500";
    case "WARNING":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

const getTypeBadge = (type: string) => {
  const base =
    "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded whitespace-nowrap font-sf-pro-text";
  switch (type) {
    case "SWITCH":
      return `${base} bg-blue-50 text-blue-700`;
    case "ROUTER":
      return `${base} bg-purple-50 text-purple-700`;
    case "FIREWALL":
      return `${base} bg-red-50 text-red-700`;
    case "ACCESS_POINT":
      return `${base} bg-indigo-50 text-indigo-700`;
    default:
      return `${base} bg-gray-50 text-gray-700`;
  }
};

const getTypeIcon = (type: string) => {
  const iconClass = "w-4 h-4";
  switch (type) {
    case "SWITCH":
      return <Server className={iconClass} />;
    case "ROUTER":
      return <RouterIcon className={iconClass} />;
    case "FIREWALL":
      return <Shield className={iconClass} />;
    case "ACCESS_POINT":
      return <Wifi className={iconClass} />;
    default:
      return <Box className={iconClass} />;
  }
};

export default function DeviceTable({ devices, onEdit, onSync, onDelete }: DeviceTableProps) {
  const router = useRouter();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; direction: "up" | "down" }>({ top: 0, left: 0, direction: "down" });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Also check if click was on any button
        let isButtonClick = false;
        buttonRefs.current.forEach((btn) => {
          if (btn && btn.contains(event.target as Node)) {
            isButtonClick = true;
          }
        });
        if (!isButtonClick) {
          setOpenDropdownId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (deviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (openDropdownId === deviceId) {
      setOpenDropdownId(null);
      return;
    }

    // Calculate position for fixed dropdown
    const button = e.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const dropdownWidth = 176; // w-44 = 11rem = 176px
    const dropdownHeight = 180;

    // Calculate if should open up or down
    const spaceBelow = window.innerHeight - rect.bottom;
    const direction = spaceBelow < dropdownHeight ? "up" : "down";

    // Position to the left of the button
    const left = rect.left - dropdownWidth - 8;
    const top = direction === "up"
      ? rect.bottom - dropdownHeight
      : rect.top;

    setDropdownPosition({ top, left, direction });
    setOpenDropdownId(deviceId);
  };

  const handleViewDetail = (device: DeviceNetwork) => {
    router.push(`/device/device-list/${device.id}`);
    setOpenDropdownId(null);
  };

  const handleEdit = (device: DeviceNetwork) => {
    if (onEdit) {
      onEdit(device);
    } else {
      router.push(`/device/device-list/${device.id}?edit=true`);
    }
    setOpenDropdownId(null);
  };

  const handleSync = (device: DeviceNetwork) => {
    if (onSync) onSync(device);
    setOpenDropdownId(null);
  };

  const handleDelete = (device: DeviceNetwork) => {
    if (onDelete) onDelete(device);
    setOpenDropdownId(null);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider first:rounded-tl-lg">
                Device Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Serial Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP MGMT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devices.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-8 text-center text-gray-500 font-sf-pro-text"
                >
                  <FontAwesomeIcon
                    icon={faNetworkWired}
                    className="w-12 h-12 mx-auto mb-3 text-gray-300"
                  />
                  <p>No devices found</p>
                </td>
              </tr>
            ) : (
              devices.map((device) => (
                <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                  {/* Device Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/device/device-list/${device.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 font-sf-pro-text"
                    >
                      {device.device_name}
                    </Link>
                  </td>

                  {/* Serial Number */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-sf-pro-text">
                      {device.serial_number || "-"}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getTypeBadge(device.type)}>
                      <span>{getTypeIcon(device.type)}</span>
                      {device.type.replace("_", " ")}
                    </span>
                  </td>

                  {/* Model */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-sf-pro-text">
                      {device.device_model || "-"}
                    </div>
                  </td>

                  {/* IP MGMT */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-sf-pro-text">
                      {device.ip_address || "-"}
                    </div>
                  </td>

                  {/* Vendor */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-sf-pro-text">
                      {device.vendor || "-"}
                    </div>
                  </td>

                  {/* Site */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-sf-pro-text">
                      {device.localSite
                        ? device.localSite.site_name || device.localSite.site_code
                        : "-"}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${getStatusDot(device.status)}`} />
                      <span className="text-sm font-medium text-gray-700">
                        {device.status}
                      </span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Ellipsis Button */}
                    <button
                      ref={(el) => {
                        if (el) buttonRefs.current.set(device.id, el);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      onClick={(e) => toggleDropdown(device.id, e)}
                      title="Actions"
                    >
                      <FontAwesomeIcon icon={faEllipsisVertical} className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
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
          <button
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            onClick={() => {
              const device = devices.find(d => d.id === openDropdownId);
              if (device) handleViewDetail(device);
            }}
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4 text-blue-600" />
            View Details
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            onClick={() => {
              const device = devices.find(d => d.id === openDropdownId);
              if (device) handleEdit(device);
            }}
          >
            <FontAwesomeIcon icon={faEdit} className="w-4 h-4 text-green-600" />
            Edit Device
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            onClick={() => {
              const device = devices.find(d => d.id === openDropdownId);
              if (device) handleSync(device);
            }}
          >
            <FontAwesomeIcon icon={faSync} className="w-4 h-4 text-purple-600" />
            Sync Config
          </button>
          <hr className="my-1 border-gray-200" />
          <button
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            onClick={() => {
              const device = devices.find(d => d.id === openDropdownId);
              if (device) handleDelete(device);
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
