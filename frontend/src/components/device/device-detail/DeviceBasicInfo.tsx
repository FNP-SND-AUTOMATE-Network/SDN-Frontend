"use client";

import { DeviceNetwork } from "@/services/deviceNetworkService";
import { getStatusBadge, getTypeBadge } from "./helpers";

interface DeviceBasicInfoProps {
  device: DeviceNetwork;
}

export default function DeviceBasicInfo({ device }: DeviceBasicInfoProps) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-3 font-sf-pro-display">
        Basic Information
      </h3>
      <dl className="space-y-2">
        <div>
          <dt className="text-gray-500">Device Name</dt>
          <dd className="text-gray-900">{device.device_name}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Serial Number</dt>
          <dd className="text-gray-900">{device.serial_number}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Model</dt>
          <dd className="text-gray-900">{device.device_model}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Type</dt>
          <dd className="text-gray-900">
            <span className={getTypeBadge(device.type)}>{device.type}</span>
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Status</dt>
          <dd className="text-gray-900">
            <span className={getStatusBadge(device.status)}>
              {device.status}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
