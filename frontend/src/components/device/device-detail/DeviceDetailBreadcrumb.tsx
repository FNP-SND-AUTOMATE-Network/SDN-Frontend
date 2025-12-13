"use client";

import Link from "next/link";

interface DeviceDetailBreadcrumbProps {
  deviceName: string;
}

export default function DeviceDetailBreadcrumb({
  deviceName,
}: DeviceDetailBreadcrumbProps) {
  return (
    <div className="mb-4 text-sm text-gray-500 font-sf-pro-text">
      <Link
        href="/device/device-list"
        className="text-blue-600 hover:text-blue-800 hover:underline font-sf-pro-text"
      >
        Device
      </Link>
      {" / "}
      <span className="text-gray-800 font-medium">{deviceName}</span>
    </div>
  );
}
