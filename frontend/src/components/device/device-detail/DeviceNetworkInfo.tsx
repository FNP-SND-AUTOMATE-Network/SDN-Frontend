"use client";

import { DeviceNetwork } from "@/services/deviceNetworkService";

interface DeviceNetworkInfoProps {
  device: DeviceNetwork;
}

export default function DeviceNetworkInfo({ device }: DeviceNetworkInfoProps) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-3 font-sf-pro-display">
        Network & Location
      </h3>
      <dl className="space-y-2">
        <div>
          <dt className="text-gray-500">IP Address</dt>
          <dd className="text-gray-900">{device.ip_address || "-"}</dd>
        </div>
        <div>
          <dt className="text-gray-500">MAC Address</dt>
          <dd className="text-gray-900">{device.mac_address || "-"}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Site</dt>
          <dd className="text-gray-900">
            {device.localSite
              ? `${device.localSite.site_code} (${device.localSite.site_name || "-"})`
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Operating System</dt>
          <dd className="text-gray-900">
            {device.operatingSystem ? device.operatingSystem.os_type : "-"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
