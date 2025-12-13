"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faTrash,
  faMicrochip,
} from "@fortawesome/free-solid-svg-icons";
import {
  OperatingSystem,
  OsType,
  RelatedTagInfo,
} from "@/services/operatingSystemService";

interface OperationTableProps {
  operatingSystems: OperatingSystem[];
  onEditOs: (os: OperatingSystem) => void;
  onDeleteOs: (osId: string, osName: string) => void;
}

const getOsTypeBadge = (osType: OsType) => {
  const baseClasses =
    "px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap";
  switch (osType) {
    case "CISCO_IOS":
      return `${baseClasses} bg-green-100 text-green-800`;
    case "CISCO_NXOS":
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case "CISCO_ASA":
      return `${baseClasses} bg-gray-100 text-gray-800`;
    case "CISCO_Nexus":
      return `${baseClasses} bg-purple-100 text-purple-800`;
    case "CISCO_IOS_XR":
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case "CISCO_IOS_XE":
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

const getOsTypeText = (osType: OsType) => {
  switch (osType) {
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
      return osType;
  }
};

// คำนวณความสว่างของสี (เอามาตัดสินใจว่าใช้ตัวหนังสือสีขาวหรือดำ)
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
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function OperationTable({
  operatingSystems,
  onEditOs,
  onDeleteOs,
}: OperationTableProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                OS Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tag
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
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
            {operatingSystems.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-gray-500 font-sf-pro-text"
                >
                  <FontAwesomeIcon
                    icon={faMicrochip}
                    className="w-12 h-12 mx-auto mb-3 text-gray-300"
                  />
                  <p>No operating systems found</p>
                </td>
              </tr>
            ) : (
              operatingSystems.map((os) => (
                <tr key={os.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 font-sf-pro-text">
                      {os.os_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getOsTypeBadge(os.os_type)}>
                      {getOsTypeText(os.os_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 font-sf-pro-text max-w-xs truncate">
                      {os.description || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {os.tags && os.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {os.tags.map((tag: RelatedTagInfo) => (
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
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        No tags
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 text-xs text-gray-600 font-sf-pro-text">
                      <span>Devices: {os.device_count || 0}</span>
                      <span>Backups: {os.backup_count || 0}</span>
                      <span className="font-semibold text-gray-900">
                        Total: {os.total_usage || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-sf-pro-text">
                      {formatDate(os.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => onEditOs(os)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faPencil} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteOs(os.id, os.os_name)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
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


