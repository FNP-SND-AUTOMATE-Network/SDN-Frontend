"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { DeviceNetwork } from "@/services/deviceNetworkService";
import { getStatusBadge, getTypeBadge, formatDate } from "./helpers";

interface DeviceDetailHeaderProps {
  device: DeviceNetwork;
  onEdit: () => void;
  onDelete: () => void;
}

export default function DeviceDetailHeader({
  device,
  onEdit,
  onDelete,
}: DeviceDetailHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-sf-pro-display mb-2">
          {device.device_name}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 font-sf-pro-text">
          <span>Model: {device.device_model}</span>
          <span>•</span>
          <span>Type:</span>
          <span className={getTypeBadge(device.type)}>{device.type}</span>
          <span>•</span>
          <span>Status:</span>
          <span className={getStatusBadge(device.status)}>{device.status}</span>
          <span>•</span>
          <span>Updated At:</span>
          <span>{formatDate(device.updated_at)}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-white text-primary-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
          title="Edit device"
        >
          <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          title="Delete device"
        >
          <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
