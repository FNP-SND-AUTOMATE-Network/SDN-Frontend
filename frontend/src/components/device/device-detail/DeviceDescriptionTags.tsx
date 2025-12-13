"use client";

import { DeviceNetwork } from "@/services/deviceNetworkService";

interface DeviceDescriptionTagsProps {
  device: DeviceNetwork;
}

export default function DeviceDescriptionTags({
  device,
}: DeviceDescriptionTagsProps) {
  return (
    <div className="md:col-span-2">
      <h3 className="text-base font-semibold text-gray-900 mb-3 font-sf-pro-display">
        Description & Tags
      </h3>
      <div className="space-y-3">
        <div>
          <p className="text-gray-500 mb-1">Description</p>
          <p className="text-gray-900">{device.description || "-"}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Tags</p>
          {device.tags && device.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {device.tags.map((tag) => (
                <span
                  key={tag.tag_id}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full font-sf-pro-text"
                  style={{
                    backgroundColor: tag.color,
                    color: "#FFFFFF",
                  }}
                >
                  {tag.tag_name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 font-sf-pro-text">No tags</p>
          )}
        </div>
      </div>
    </div>
  );
}
