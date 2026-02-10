"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faPencil,
  faTrash,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { LocalSite, SiteType } from "@/services/siteService";

interface SiteTableProps {
  sites: LocalSite[];
  onEditSite: (site: LocalSite) => void;
  onDeleteSite: (siteId: string, siteName: string) => void;
}

const getSiteTypeBadge = (siteType: SiteType) => {
  const badges: Record<SiteType, { label: string; className: string }> = {
    DataCenter: { label: "Data Center", className: "bg-blue-100 text-blue-800" },
    BRANCH: { label: "Branch", className: "bg-green-100 text-green-800" },
    OTHER: { label: "Other", className: "bg-gray-100 text-gray-800" },
  };
  return badges[siteType] || badges.OTHER;
};

const formatLocation = (site: LocalSite) => {
  const parts = [];
  if (site.building_name) parts.push(site.building_name);
  if (site.floor_number !== null && site.floor_number !== undefined)
    parts.push(`Floor ${site.floor_number}`);
  if (site.rack_number !== null && site.rack_number !== undefined)
    parts.push(`Rack ${site.rack_number}`);
  return parts.length > 0 ? parts.join(", ") : "-";
};

const formatAddress = (site: LocalSite) => {
  const parts = [];
  if (site.address) parts.push(site.address);
  if (site.city) parts.push(site.city);
  if (site.country) parts.push(site.country);
  return parts.length > 0 ? parts.join(", ") : "-";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function SiteTable({
  sites,
  onEditSite,
  onDeleteSite,
}: SiteTableProps) {
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

  const handleDropdownClick = (e: React.MouseEvent, siteId: string) => {
    e.stopPropagation();

    if (openDropdownId === siteId) {
      setOpenDropdownId(null);
      return;
    }

    const button = e.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.right - 176,
    });
    setOpenDropdownId(siteId);
  };

  const handleEdit = (site: LocalSite) => {
    onEditSite(site);
    setOpenDropdownId(null);
  };

  const handleDelete = (site: LocalSite) => {
    onDeleteSite(site.id, site.site_name || site.site_code);
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
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Devices
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sites.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500 font-sf-pro-text"
                >
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="w-12 h-12 mx-auto mb-3 text-gray-300"
                  />
                  <p className="text-lg font-medium">No sites found</p>
                  <p className="text-sm text-gray-400">Add a new site to get started</p>
                </td>
              </tr>
            ) : (
              sites.map((site) => {
                const typeBadge = getSiteTypeBadge(site.site_type);
                return (
                  <tr key={site.id} className="hover:bg-gray-50 transition-colors">
                    {/* Name Column */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 font-sf-pro-text">
                          {site.site_name || site.site_code}
                        </div>
                        {site.site_name && (
                          <div className="text-xs text-gray-500 font-sf-pro-text">
                            {site.site_code}
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

                    {/* Location Column */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 font-sf-pro-text">
                        {formatLocation(site)}
                      </span>
                    </td>

                    {/* Address Column */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 font-sf-pro-text truncate max-w-xs block">
                        {formatAddress(site)}
                      </span>
                    </td>

                    {/* Devices Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900 font-sf-pro-text">
                        {site.device_count || 0}
                      </span>
                    </td>

                    {/* Updated Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 font-sf-pro-text">
                        {formatDate(site.updated_at)}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => handleDropdownClick(e, site.id)}
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

      {/* Portal Dropdown Menu */}
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
              const site = sites.find(s => s.id === openDropdownId);
              if (site) handleEdit(site);
            }}
          >
            <FontAwesomeIcon icon={faPencil} className="w-4 h-4 text-blue-600" />
            Edit
          </button>
          <hr className="my-1 border-gray-200" />
          <button
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            onClick={() => {
              const site = sites.find(s => s.id === openDropdownId);
              if (site) handleDelete(site);
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
