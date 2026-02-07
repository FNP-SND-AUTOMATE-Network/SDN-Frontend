"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faFilter,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/Button";

interface StatusCounts {
  online: number;
  offline: number;
  other: number;
  maintenance: number;
}

interface DeviceHeaderProps {
  onAddDevice: () => void;
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: { type: string; status: string }) => void;
  searchTerm: string;
  selectedType: string;
  selectedStatus: string;
  totalDevices: number;
  statusCounts?: StatusCounts;
}

// Status Card Component
function StatusCard({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: "green" | "red" | "yellow" | "blue";
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  const dotColors = {
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex-1 min-w-[140px]">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${dotColors[color]}`} />
        <span className="text-sm text-gray-600 font-sf-pro-text">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900 font-sf-pro-display">
          {count}
        </span>
        <span className="text-sm text-gray-500 font-sf-pro-text">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

export default function DeviceHeader({
  onAddDevice,
  onSearch,
  onFilterChange,
  searchTerm,
  selectedType,
  selectedStatus,
  totalDevices,
  statusCounts,
}: DeviceHeaderProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    onSearch("");
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ type: e.target.value, status: selectedStatus });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ type: selectedType, status: e.target.value });
  };

  return (
    <div className="mb-6">
      {/* Page Title */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 font-sf-pro-display">
          Devices
        </h1>
        <p className="text-sm text-gray-500 font-sf-pro-text">
          Manage and monitor your network devices
        </p>
      </div>

      {/* Status Cards */}
      {statusCounts && (
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <StatusCard
            label="Online"
            count={statusCounts.online}
            total={totalDevices}
            color="green"
          />
          <StatusCard
            label="Offline"
            count={statusCounts.offline}
            total={totalDevices}
            color="red"
          />
          <StatusCard
            label="Other"
            count={statusCounts.other}
            total={totalDevices}
            color="yellow"
          />
          <StatusCard
            label="Maintenance"
            count={statusCounts.maintenance}
            total={totalDevices}
            color="blue"
          />
        </div>
      )}

      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search devices..."
            value={localSearch}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sf-pro-text"
          />
          {localSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sf-pro-text bg-white"
          >
            <option value="">All Status</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="OTHER">Other</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
          <select
            value={selectedType}
            onChange={handleTypeChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sf-pro-text bg-white"
          >
            <option value="">All Types</option>
            <option value="SWITCH">Switch</option>
            <option value="ROUTER">Router</option>
            <option value="FIREWALL">Firewall</option>
            <option value="ACCESS_POINT">Access Point</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Add Button & Device Count */}
        <div className="flex items-center gap-4">
          <Button onClick={onAddDevice} className="flex items-center gap-2 whitespace-nowrap">
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
