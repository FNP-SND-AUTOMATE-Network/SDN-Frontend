"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNetworkWired } from "@fortawesome/free-solid-svg-icons";
import { DeviceNetwork } from "@/services/deviceNetworkService";
import { RelatedTagInfo } from "@/services/operatingSystemService";

interface DeviceTableProps {
  devices: DeviceNetwork[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const getStatusBadge = (status: string) => {
  const base =
    "px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap font-sf-pro-text";
  switch (status) {
    case "ONLINE":
      return `${base} bg-green-100 text-green-800`;
    case "OFFLINE":
      return `${base} bg-red-100 text-red-800`;
    case "MAINTENANCE":
      return `${base} bg-yellow-100 text-yellow-800`;
    default:
      return `${base} bg-gray-100 text-gray-800`;
  }
};

const getTypeBadge = (type: string) => {
  const base =
    "px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap font-sf-pro-text";
  switch (type) {
    case "SWITCH":
      return `${base} bg-blue-100 text-blue-800`;
    case "ROUTER":
      return `${base} bg-purple-100 text-purple-800`;
    case "FIREWALL":
      return `${base} bg-red-100 text-red-800`;
    case "ACCESS_POINT":
      return `${base} bg-indigo-100 text-indigo-800`;
    default:
      return `${base} bg-gray-100 text-gray-800`;
  }
};

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

export default function DeviceTable({
  devices,
}: DeviceTableProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devices.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
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
                <tr key={device.id} className="hover:bg-gray-50">
                  {/* Device Name (link to detail page) */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/device/device-list/${device.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 font-sf-pro-text"
                    >
                      {device.device_name}
                    </Link>
                  </td>

                  {/* Model */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-sf-pro-text">
                      {device.device_model}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getTypeBadge(device.type)}>
                      {device.type}
                    </span>
                  </td>

                  {/* IP */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-sf-pro-text">
                      {device.ip_address || "-"}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(device.status)}>
                      {device.status}
                    </span>
                  </td>

                  {/* Site */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-sf-pro-text">
                      {device.localSite
                        ? `${device.localSite.site_code} (${device.localSite.site_name || "-"})`
                        : "-"}
                    </div>
                  </td>

                  {/* Tags */}
                  <td className="px-6 py-4">
                    {device.tags && device.tags.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {/* Group tags by type */}
                        {(() => {
                          // Group tags by their type
                          const tagsByType: Record<string, RelatedTagInfo[]> = {};
                          device.tags.forEach((tag) => {
                            if (!tagsByType[tag.type]) {
                              tagsByType[tag.type] = [];
                            }
                            tagsByType[tag.type].push(tag);
                          });

                          // Only show groups that have tags
                          return Object.entries(tagsByType).map(([type, tags]) => {
                            const displayTags = tags.slice(0, 3); // Show max 3 tags
                            const hasMore = tags.length > 3;

                            return (
                              <div key={type} className="flex flex-col gap-1">
                                {/* Group name */}
                                <span className="text-xs font-medium text-gray-600 uppercase">
                                  {type}:
                                </span>
                                {/* Tags in this group */}
                                <div className="flex flex-wrap gap-1 items-center">
                                  {displayTags.map((tag) => (
                                    <span
                                      key={tag.tag_id}
                                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full font-sf-pro-text"
                                      style={{
                                        backgroundColor: tag.color,
                                        color: getTagTextColor(tag.color),
                                      }}
                                    >
                                      {tag.tag_name}
                                    </span>
                                  ))}
                                  {hasMore && (
                                    <span className="text-xs text-gray-500 font-medium">
                                      +{tags.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        No tags
                      </span>
                    )}
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


