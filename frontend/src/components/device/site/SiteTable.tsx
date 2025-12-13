"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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

export default function SiteTable({
  sites,
  onEditSite,
  onDeleteSite,
}: SiteTableProps) {
  const getSiteTypeBadge = (siteType: SiteType) => {
    const baseClasses =
      "px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap";
    switch (siteType) {
      case "DataCenter":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "BRANCH":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "OTHER":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getSiteTypeText = (siteType: SiteType) => {
    switch (siteType) {
      case "DataCenter":
        return "Data Center";
      case "BRANCH":
        return "Branch";
      case "OTHER":
        return "Other";
      default:
        return siteType;
    }
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
    if (site.sub_district) parts.push(site.sub_district);
    if (site.district) parts.push(site.district);
    if (site.city) parts.push(site.city);
    if (site.zip_code) parts.push(site.zip_code);
    return parts.length > 0 ? parts.join(", ") : "-";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Site Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Site Name
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Devices
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sites.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-gray-500 font-sf-pro-text"
                >
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="w-12 h-12 mx-auto mb-3 text-gray-300"
                  />
                  <p>No sites found</p>
                </td>
              </tr>
            ) : (
              sites.map((site) => (
                <tr key={site.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 font-sf-pro-text">
                      {site.site_code}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-sf-pro-text">
                      {site.site_name || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getSiteTypeBadge(site.site_type)}>
                      {getSiteTypeText(site.site_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 font-sf-pro-text max-w-xs">
                      {formatLocation(site)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 font-sf-pro-text max-w-md">
                      {formatAddress(site)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {site.device_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-sf-pro-text">
                      {formatDate(site.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => onEditSite(site)}
                        className="text-blue-600 hover:text-blue-900"
                        title="แก้ไข"
                      >
                        <FontAwesomeIcon icon={faPencil} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          onDeleteSite(
                            site.id,
                            site.site_name || site.site_code
                          )
                        }
                        className="text-red-600 hover:text-red-900"
                        title="ลบ"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

