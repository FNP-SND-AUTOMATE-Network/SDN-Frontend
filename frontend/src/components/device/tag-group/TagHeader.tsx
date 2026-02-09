"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faTimes,
  faTags,
  faDesktop,
  faServer,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/Button";

interface StatusCardProps {
  label: string;
  count: number;
  icon: any;
  color: "blue" | "green" | "purple" | "orange";
}

function StatusCard({ label, count, icon, color }: StatusCardProps) {
  const iconColorClasses = {
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
    orange: "text-orange-500",
  };

  return (
    <div className="flex-1 min-w-[140px] p-4 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center gap-2 mb-1">
        <FontAwesomeIcon icon={icon} className={`w-4 h-4 ${iconColorClasses[color]}`} />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900 font-sf-pro-display">
        {count.toLocaleString()}
      </div>
    </div>
  );
}

interface TagHeaderProps {
  onAddTag: () => void;
  onSearch: (searchTerm: string) => void;
  onFilterChange: (type: string) => void;
  searchTerm: string;
  selectedType: string;
  totalTags: number;
  osTags: number;
  deviceTags: number;
  totalUsage: number;
}

export default function TagHeader({
  onAddTag,
  onSearch,
  onFilterChange,
  searchTerm,
  selectedType,
  totalTags,
  osTags,
  deviceTags,
  totalUsage,
}: TagHeaderProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    onSearch("");
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange(e.target.value);
  };

  return (
    <div className="mb-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-sf-pro-display">
            Tags
          </h1>
          <p className="text-sm text-gray-500 font-sf-pro-text">
            Organize your resources with tags for better management
          </p>
        </div>
      </div>

      {/* Search, Filter, and Add Button - All in one row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-6">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tags..."
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

        {/* Type Filter */}
        <select
          value={selectedType}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sf-pro-text bg-white min-w-[140px]"
        >
          <option value="">All Types</option>
          <option value="OS">OS</option>
          <option value="Device">Device</option>
        </select>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Add Tag Button */}
        <Button onClick={onAddTag} className="flex items-center gap-2 whitespace-nowrap">
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          Add Tag
        </Button>
      </div>

      {/* Status Cards */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <StatusCard
          label="Total Tags"
          count={totalTags}
          icon={faTags}
          color="blue"
        />
        <StatusCard
          label="OS Tags"
          count={osTags}
          icon={faDesktop}
          color="green"
        />
        <StatusCard
          label="Device Tags"
          count={deviceTags}
          icon={faServer}
          color="purple"
        />
        <StatusCard
          label="Total Usage"
          count={totalUsage}
          icon={faChartBar}
          color="orange"
        />
      </div>
    </div>
  );
}
