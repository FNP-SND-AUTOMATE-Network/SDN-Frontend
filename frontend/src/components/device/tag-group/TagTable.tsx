"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faTrash,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { Tag, TypeTag } from "@/services/tagService";

interface TagTableProps {
  tags: Tag[];
  onEditTag: (tag: Tag) => void;
  onDeleteTag: (tagId: string, tagName: string) => void;
}

export default function TagTable({
  tags,
  onEditTag,
  onDeleteTag,
}: TagTableProps) {
  // Function to calculate brightness of a hex color
  const getColorBrightness = (hexColor: string): number => {
    // Remove # if present
    const hex = hexColor.replace("#", "");
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate brightness using relative luminance formula
    // https://www.w3.org/TR/WCAG20/#relativeluminancedef
    return (r * 299 + g * 587 + b * 114) / 1000;
  };

  // Function to get text color based on background brightness
  const getTextColor = (backgroundColor: string): string => {
    const brightness = getColorBrightness(backgroundColor);
    // If brightness > 128, use dark text; otherwise use white text
    return brightness > 128 ? "#000000" : "#FFFFFF"; // gray-700 : white
  };

  const getTypeBadge = (type: TypeTag) => {
    const baseClasses =
      "px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap";
    switch (type) {
      case "tag":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "group":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case "other":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getTypeText = (type: TypeTag) => {
    switch (type) {
      case "tag":
        return "Tag";
      case "group":
        return "Group";
      case "other":
        return "Other";
      default:
        return type;
    }
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

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tag Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
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
            {tags.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-gray-500 font-sf-pro-text"
                >
                  <FontAwesomeIcon
                    icon={faTag}
                    className="w-12 h-12 mx-auto mb-3 text-gray-300"
                  />
                  <p>No tags found</p>
                </td>
              </tr>
            ) : (
              tags.map((tag) => (
                <tr key={tag.tag_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="inline-block px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap font-sf-pro-text"
                      style={{
                        backgroundColor: tag.color,
                        color: getTextColor(tag.color),
                      }}
                    >
                      {tag.tag_name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 font-sf-pro-text max-w-xs truncate">
                      {tag.description || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getTypeBadge(tag.type)}>
                      {getTypeText(tag.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>Devices: {tag.device_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>OS: {tag.os_count || 0}</span>
                        <span>|</span>
                        <span>Templates: {tag.template_count || 0}</span>
                      </div>
                      <div className="text-xs font-medium text-gray-900">
                        Total: {tag.total_usage || 0}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-sf-pro-text">
                      {formatDate(tag.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => onEditTag(tag)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faPencil} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTag(tag.tag_id, tag.tag_name)}
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

