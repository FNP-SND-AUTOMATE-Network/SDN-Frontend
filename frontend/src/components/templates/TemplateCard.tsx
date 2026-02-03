"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { ConfigurationTemplate } from "@/services/configurationTemplateService";

interface TemplateCardProps {
    template: ConfigurationTemplate;
    onClick?: (template: ConfigurationTemplate) => void;
}

export default function TemplateCard({ template, onClick }: TemplateCardProps) {
    // Get config content lines for preview (max 6 lines)
    const configLines = React.useMemo(() => {
        const configContent = template.detail?.config_content;
        if (configContent) {
            return configContent.split('\n').slice(0, 6);
        }
        return [];
    }, [template.detail?.config_content]);

    const hasContent = configLines.length > 0;

    const getTagColor = (tagName?: string | null) => {
        if (!tagName) return { bg: "bg-gray-100", text: "text-gray-600" };

        const colors: Record<string, { bg: string; text: string }> = {
            "Routing": { bg: "bg-blue-100", text: "text-blue-700" },
            "Security": { bg: "bg-red-100", text: "text-red-700" },
            "VLAN": { bg: "bg-purple-100", text: "text-purple-700" },
            "Backup": { bg: "bg-orange-100", text: "text-orange-700" },
        };

        return colors[tagName] || { bg: "bg-green-100", text: "text-green-700" };
    };

    // Get first tag for display
    const firstTag = template.tags?.[0];
    const tagColors = getTagColor(firstTag?.tag_name);

    return (
        <div
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden"
            onClick={() => onClick?.(template)}
        >
            {/* Header */}
            <div className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900 truncate flex-1">
                        {template.template_name}
                    </h3>
                    <FontAwesomeIcon
                        icon={faCircle}
                        className="w-2.5 h-2.5 text-green-500 mt-1.5 flex-shrink-0"
                    />
                </div>
                <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                    Description : {template.description || "No description"}
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Tag :</span>
                    {firstTag?.tag_name && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${tagColors.bg} ${tagColors.text}`}>
                            {firstTag.tag_name}
                        </span>
                    )}
                </div>
            </div>

            {/* Config Preview Area */}
            <div className="mx-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[100px]">
                {hasContent ? (
                    <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap overflow-hidden leading-relaxed">
                        {configLines.map((line, index) => (
                            <div key={index} className="truncate">
                                {line || " "}
                            </div>
                        ))}
                    </pre>
                ) : (
                    <div className="space-y-1.5">
                        {/* Placeholder lines when no content */}
                        {Array(6).fill(null).map((_, index) => (
                            <div
                                key={index}
                                className="h-2 bg-gray-300 rounded-sm"
                                style={{ width: `${70 + Math.random() * 25}%` }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
