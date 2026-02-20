"use client";

import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTerminal,
  faSync,
  faCog,
  faEllipsisH,
  faTrash,
  faEdit,
  faDownload,
  faLink,
  faBoxOpen
} from "@fortawesome/free-solid-svg-icons";
import { DeviceNetwork } from "@/services/deviceNetworkService";
import { getStatusBadge } from "./helpers";
import {
  Router as RouterIcon,
  Shield,
  Wifi,
  Box,
  Server,
} from "lucide-react";

interface DeviceDetailHeaderProps {
  device: DeviceNetwork;
  onEdit: () => void;
  onDelete: () => void;
  onMount?: () => void;
  onUnmount?: () => void;
  isMounting?: boolean;
  isUnmounting?: boolean;
}

const getTypeIcon = (type: string) => {
  const iconClass = "w-4 h-4";
  switch (type) {
    case "SWITCH":
      return <Server className={iconClass + " text-blue-500"} />;
    case "ROUTER":
      return <RouterIcon className={iconClass + " text-green-500"} />;
    case "FIREWALL":
      return <Shield className={iconClass + " text-red-500"} />;
    case "ACCESS_POINT":
      return <Wifi className={iconClass + " text-yellow-500"} />;
    default:
      return <Box className={iconClass + " text-gray-500"} />;
  }
};

export default function DeviceDetailHeader({
  device,
  onEdit,
  onDelete,
  onMount,
  onUnmount,
  isMounting,
  isUnmounting,
}: DeviceDetailHeaderProps) {
  const tags = device.tags || [];
  const statusColors = getStatusBadge(device.status);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setShowDropdown(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Left side - Device info */}
        <div className="flex items-center gap-4">
          {/* Device Icon */}
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            {getTypeIcon(device.type)}
          </div>

          {/* Device Name and Details */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900 font-sf-pro-display">
                {device.device_name}
              </h1>
              {/* Status Badge */}
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium font-sf-pro-text text-gray-900 ${statusColors.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                {device.status}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 font-sf-pro-text">
              <span>{device.device_model}</span>
              <span>•</span>
              <span>{device.vendor || "Unknown Vendor"}</span>
            </div>
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {tags.map((tagInfo) => (
                  <span
                    key={tagInfo.tag_id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: tagInfo.color ? `${tagInfo.color}20` : "#e5e7eb",
                      color: tagInfo.color || "#374151",
                    }}
                  >
                    {tagInfo.tag_name || "Tag"}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Mount / Unmount */}
          <button
            type="button"
            onClick={onUnmount}
            disabled={isUnmounting || isMounting}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FontAwesomeIcon icon={faBoxOpen} className={`w-4 h-4 ${isUnmounting ? "animate-bounce" : ""}`} />
            <span>{isUnmounting ? "Unmounting..." : "Unmount"}</span>
          </button>

          <button
            type="button"
            onClick={onMount}
            disabled={isMounting || isUnmounting}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FontAwesomeIcon icon={faLink} className={`w-4 h-4 ${isMounting ? "animate-pulse" : ""}`} />
            <span>{isMounting ? "Mounting..." : "Mount"}</span>
          </button>

          {/* More Options Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="inline-flex items-center justify-center w-9 h-9 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="More options"
            >
              <FontAwesomeIcon icon={faEllipsisH} className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => handleAction(onEdit)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FontAwesomeIcon icon={faEdit} className="w-4 h-4 text-gray-400" />
                  <span>Edit Device</span>
                </button>
                <button
                  onClick={() => handleAction(() => console.log("Export config"))}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FontAwesomeIcon icon={faDownload} className="w-4 h-4 text-gray-400" />
                  <span>Export Config</span>
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => handleAction(onDelete)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                  <span>Delete Device</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
