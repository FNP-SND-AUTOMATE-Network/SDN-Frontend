"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faInfoCircle,
    faNetworkWired,
    faMapMarkerAlt,
    faServer,
    faShieldAlt,
    faClock,
    faCopy,
    faCheck,
    faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { DeviceNetwork } from "@/services/deviceNetworkService";

interface DeviceDetailCardsProps {
    device: DeviceNetwork;
}

// Helper component for copyable text
function CopyableText({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <span className="inline-flex items-center gap-2 group">
            <span className="font-sf-pro-text">{value}</span>
            <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy"
            >
                <FontAwesomeIcon
                    icon={copied ? faCheck : faCopy}
                    className={`w-3 h-3 ${copied ? "text-green-500" : ""}`}
                />
            </button>
        </span>
    );
}

// Helper component for info row
function InfoRow({ label, value, copyable = false }: { label: string; value: string | null | undefined; copyable?: boolean }) {
    const displayValue = value || "-";
    return (
        <div className="flex justify-between py-2 border-b border-gray-50 last:border-b-0">
            <span className="text-gray-500 font-sf-pro-text">{label}</span>
            {copyable && value ? (
                <CopyableText value={value} />
            ) : (
                <span className="text-gray-900 text-right font-sf-pro-text">{displayValue}</span>
            )}
        </div>
    );
}

// Helper component for card header
function CardHeader({ icon, title }: { icon: any; title: string }) {
    return (
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <FontAwesomeIcon icon={icon} className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 font-sf-pro-text">
                {title}
            </h3>
        </div>
    );
}

// Status Badge component
function StatusBadge({ status, label }: { status: boolean | string | null | undefined; label?: string }) {
    const isActive = status === true || status === "connected" || status === "ONLINE";
    const displayLabel = label || (isActive ? "Yes" : "No");

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium`}>
            <FontAwesomeIcon icon={faCircleCheck} className={`${isActive ? "text-green-500" : "text-gray-400"}`} />
            {displayLabel}
        </span>
    );
}

// Format date helper
function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

export default function DeviceDetailCards({ device }: DeviceDetailCardsProps) {
    return (
        <div className="space-y-6">
            {/* Row 1: Basic Info, Network Details, Location & Site */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <CardHeader icon={faInfoCircle} title="Basic Information" />
                    <div className="text-sm font-sf-pro-text space-y-1">
                        <InfoRow label="Serial Number" value={device.serial_number} copyable />
                        <InfoRow label="Device Model" value={device.device_model} />
                        <InfoRow label="Vendor" value={device.vendor} />
                        <InfoRow label="Type" value={device.type} />
                        <InfoRow label="Description" value={device.description} />
                    </div>
                </div>

                {/* Network Details */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <CardHeader icon={faNetworkWired} title="Network Details" />
                    <div className="text-sm font-sf-pro-text space-y-1">
                        <InfoRow label="IP Address" value={device.ip_address} copyable />
                        <InfoRow label="MAC Address" value={device.mac_address} copyable />
                        <InfoRow label="NETCONF Host" value={device.netconf_host} />
                        <InfoRow label="NETCONF Port" value={device.netconf_port?.toString()} />
                    </div>
                </div>

                {/* Location & Site */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <CardHeader icon={faMapMarkerAlt} title="Location & Site" />
                    <div className="text-sm font-sf-pro-text space-y-1">
                        <InfoRow label="Site Name" value={device.localSite?.site_name} />
                        <InfoRow label="Site Code" value={device.localSite?.site_code} />
                        <InfoRow label="Node ID" value={device.node_id} />
                    </div>
                </div>
            </div>

            {/* Row 2: Operating System, Policy & Security, Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Operating System */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <CardHeader icon={faServer} title="Operating System" />
                    <div className="text-sm font-sf-pro-text space-y-1">

                        <InfoRow label="OS Type" value={device.operatingSystem?.os_type} />
                        <InfoRow label="Default Strategy" value={device.default_strategy} />
                    </div>
                </div>

                {/* Policy & Security */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <CardHeader icon={faShieldAlt} title="Policy & Security" />
                    <div className="text-sm font-sf-pro-text space-y-1">
                        <InfoRow label="Policy Name" value={device.policy?.policy_name} />
                        <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-gray-500">ODL Mounted</span>
                            <StatusBadge status={device.odl_mounted} />
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-gray-500">ODL Status</span>
                            <span className="text-gray-900 font-sf-pro-text text-right">
                                {device.odl_connection_status || "-"}
                            </span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-500">Ready for Intent</span>
                            <StatusBadge status={device.ready_for_intent} />
                        </div>
                    </div>
                </div>

                {/* Activity */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <CardHeader icon={faClock} title="Activity" />
                    <div className="text-sm font-sf-pro-text space-y-1">
                        <InfoRow label="Created" value={formatDate(device.created_at)} />
                        <InfoRow label="Last Updated" value={formatDate(device.updated_at)} />
                        <InfoRow label="Last Synced" value={formatDate(device.last_synced_at)} />
                    </div>
                </div>
            </div>

            {/* Supported Intents */}
            {device.oc_supported_intents && Object.keys(device.oc_supported_intents).length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <CardHeader icon={faNetworkWired} title="Supported Intents" />
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(device.oc_supported_intents).map(([intent, supported]) => (
                            supported && (
                                <span
                                    key={intent}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    {intent}
                                </span>
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
