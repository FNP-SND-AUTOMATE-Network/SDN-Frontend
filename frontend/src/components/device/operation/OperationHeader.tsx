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
import { OsType } from "@/services/operatingSystemService";

interface OperationHeaderProps {
  onAddOs: () => void;
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: { os_type: string; tag_filter: string }) => void;
  searchTerm: string;
  selectedOsType: string;
  selectedTagFilter: string;
  totalOperatingSystems: number;
}

export default function OperationHeader({
  onAddOs,
  onSearch,
  onFilterChange,
  searchTerm,
  selectedOsType,
  selectedTagFilter,
  totalOperatingSystems,
}: OperationHeaderProps) {
  const [showFilters, setShowFilters] = useState(false);
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

  const handleOsTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ os_type: e.target.value, tag_filter: selectedTagFilter });
  };

  const handleTagFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ os_type: selectedOsType, tag_filter: e.target.value });
  };

  const handleClearFilters = () => {
    onFilterChange({ os_type: "", tag_filter: "" });
    setLocalSearch("");
    onSearch("");
  };

  const hasActiveFilters =
    selectedOsType !== "" || selectedTagFilter !== "" || searchTerm !== "";

  const getOsTypeLabel = (value: string) => {
    switch (value as OsType) {
      case "CISCO_IOS":
        return "Cisco IOS";
      case "CISCO_NXOS":
        return "Cisco NX-OS";
      case "CISCO_ASA":
        return "Cisco ASA";
      case "CISCO_Nexus":
        return "Cisco Nexus";
      case "CISCO_IOS_XR":
        return "Cisco IOS-XR";
      case "CISCO_IOS_XE":
        return "Cisco IOS-XE";
      default:
        return value;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-sf-pro-display">
            Operating System Management
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-sf-pro-text">
            Total Operating Systems: {totalOperatingSystems}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                !
              </span>
            )}
          </Button>
          <Button onClick={onAddOs} className="flex items-center gap-2">
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            <span>Add</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FontAwesomeIcon
            icon={faSearch}
            className="w-5 h-5 text-gray-400"
          />
        </div>
        <input
          type="text"
          placeholder="Search by OS name, description..."
          value={localSearch}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sf-pro-text"
        />
        {localSearch && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 font-sf-pro-display">
              Advanced Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OS Type
              </label>
              <select
                value={selectedOsType}
                onChange={handleOsTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sf-pro-text"
              >
                <option value="">All</option>
                <option value="CISCO_IOS">Cisco IOS</option>
                <option value="CISCO_NXOS">Cisco NX-OS</option>
                <option value="CISCO_ASA">Cisco ASA</option>
                <option value="CISCO_Nexus">Cisco Nexus</option>
                <option value="CISCO_IOS_XR">Cisco IOS-XR</option>
                <option value="CISCO_IOS_XE">Cisco IOS-XE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag Filter
              </label>
              <select
                value={selectedTagFilter}
                onChange={handleTagFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sf-pro-text"
              >
                <option value="">All</option>
                <option value="with_tag">Only with Tag</option>
                <option value="without_tag">Without Tag</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-600 font-medium">
                  Active Filters:
                </span>
                {selectedOsType && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Type: {getOsTypeLabel(selectedOsType)}
                    <button
                      onClick={() =>
                        onFilterChange({
                          os_type: "",
                          tag_filter: selectedTagFilter,
                        })
                      }
                      className="ml-1 hover:text-blue-900"
                    >
                      <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedTagFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    Tag:{" "}
                    {selectedTagFilter === "with_tag"
                      ? "Has Tag"
                      : "No Tag"}
                    <button
                      onClick={() =>
                        onFilterChange({
                          os_type: selectedOsType,
                          tag_filter: "",
                        })
                      }
                      className="ml-1 hover:text-purple-900"
                    >
                      <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Search: {searchTerm}
                    <button
                      onClick={handleClearSearch}
                      className="ml-1 hover:text-green-900"
                    >
                      <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


