"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileCode,
    faNetworkWired,
    faEye,
    faCopy,
    faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { DeviceNetwork } from "@/services/deviceNetworkService";

interface DeviceConfigurationTabProps {
    device: DeviceNetwork;
    onPreviewTemplate?: (templateId: string) => void;
}

// Helper component for copyable text
function CopyableText({ value, label }: { value: string; label?: string }) {
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
                title={`Copy ${label || "value"}`}
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
function InfoRow({
    label,
    value,
    copyable = false,
    action,
}: {
    label: string;
    value: string | null | undefined;
    copyable?: boolean;
    action?: React.ReactNode;
}) {
    const displayValue = value || "-";
    return (
        <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-gray-500 font-sf-pro-text">{label}</span>
            <div className="flex items-center gap-3">
                {copyable && value ? (
                    <CopyableText value={value} label={label} />
                ) : (
                    <span className="text-gray-900 text-right font-sf-pro-text">
                        {displayValue}
                    </span>
                )}
                {action}
            </div>
        </div>
    );
}

// Helper component for card header
function CardHeader({ icon, title }: { icon: any; title: string }) {
    return (
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
            <FontAwesomeIcon icon={icon} className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 font-sf-pro-text">
                {title}
            </h3>
        </div>
    );
}

export default function DeviceConfigurationTab({
    device,
    onPreviewTemplate,
}: DeviceConfigurationTabProps) {
    const template = device.configuration_template;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Template Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
                <CardHeader icon={faFileCode} title="Configuration Template" />
                <div className="text-sm space-y-1">
                    <InfoRow
                        label="Template Name"
                        value={template?.template_name}
                    />
                    <InfoRow
                        label="Template Type"
                        value={template?.template_type}
                    />
                    <InfoRow
                        label="Template ID"
                        value={template?.id}
                        copyable
                        action={
                            template?.id && onPreviewTemplate ? (
                                <button
                                    onClick={() => onPreviewTemplate(template.id)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                                    Preview
                                </button>
                            ) : null
                        }
                    />
                </div>

                {!template && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-500 text-center">
                        No configuration template assigned
                    </div>
                )}
            </div>

            {/* NETCONF Setting Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
                <CardHeader icon={faNetworkWired} title="NETCONF Setting" />
                <div className="text-sm space-y-1">
                    <InfoRow
                        label="Host"
                        value={device.netconf_host}
                        copyable
                    />
                    <InfoRow
                        label="Port"
                        value={device.netconf_port?.toString()}
                    />
                </div>

                {!device.netconf_host && !device.netconf_port && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-500 text-center">
                        NETCONF not configured
                    </div>
                )}
            </div>
        </div>
    );
}
