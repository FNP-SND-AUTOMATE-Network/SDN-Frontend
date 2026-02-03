"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faEdit,
    faTrash,
    faSpinner,
    faCopy,
    faCheck,
    faCalendar,
    faTag,
    faFile,
} from "@fortawesome/free-solid-svg-icons";
import { ConfigurationTemplate } from "@/services/configurationTemplateService";

interface TemplateDetailModalProps {
    isOpen: boolean;
    template: ConfigurationTemplate | null;
    onClose: () => void;
    onEdit: (template: ConfigurationTemplate) => void;
    onDelete: (template: ConfigurationTemplate) => void;
    isDeleting?: boolean;
    isLoadingContent?: boolean;
}

export default function TemplateDetailModal({
    isOpen,
    template,
    onClose,
    onEdit,
    onDelete,
    isDeleting = false,
    isLoadingContent = false,
}: TemplateDetailModalProps) {
    const [copied, setCopied] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!isOpen || !template) return null;

    const configContent = template.detail?.config_content || "";

    const handleCopyContent = async () => {
        if (!configContent) return;

        try {
            await navigator.clipboard.writeText(configContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        onDelete(template);
        setShowDeleteConfirm(false);
    };

    const handleClose = () => {
        setShowDeleteConfirm(false);
        onClose();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            NETWORK: "Network",
            SECURITY: "Security",
            OTHER: "Other",
        };
        return labels[type] || type;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 transition-opacity bg-gray-800 bg-opacity-75"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl bg-white shadow-xl rounded-xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 truncate">
                            {template.template_name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {template.description || "No description"}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-4"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                    </button>
                </div>

                {/* Meta Info */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                            <FontAwesomeIcon icon={faFile} className="w-4 h-4" />
                            <span className="font-medium">Type:</span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                {getTypeLabel(template.template_type)}
                            </span>
                        </div>
                        {template.tags && template.tags.length > 0 && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <FontAwesomeIcon icon={faTag} className="w-4 h-4" />
                                <span className="font-medium">Tags:</span>
                                <div className="flex flex-wrap gap-1">
                                    {template.tags.map((tag) => (
                                        <span
                                            key={tag.id || tag.tag_name}
                                            className="px-2 py-0.5 rounded text-xs font-medium"
                                            style={{
                                                backgroundColor: `${tag.color}20`,
                                                color: tag.color,
                                            }}
                                        >
                                            {tag.tag_name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                            <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
                            <span className="font-medium">Updated:</span>
                            <span>{formatDate(template.updated_at)}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Configuration Content</h4>
                        {configContent && (
                            <button
                                onClick={handleCopyContent}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <FontAwesomeIcon
                                    icon={copied ? faCheck : faCopy}
                                    className={`w-3 h-3 ${copied ? "text-green-500" : ""}`}
                                />
                                {copied ? "Copied!" : "Copy"}
                            </button>
                        )}
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-auto">
                        {isLoadingContent ? (
                            <div className="animate-pulse space-y-2">
                                <div className="h-3 bg-gray-700 rounded w-[85%]" />
                                <div className="h-3 bg-gray-700 rounded w-[70%]" />
                                <div className="h-3 bg-gray-700 rounded w-[90%]" />
                                <div className="h-3 bg-gray-700 rounded w-[60%]" />
                                <div className="h-3 bg-gray-700 rounded w-[80%]" />
                                <div className="h-3 bg-gray-700 rounded w-[75%]" />
                                <div className="h-3 bg-gray-700 rounded w-[65%]" />
                                <div className="h-3 bg-gray-700 rounded w-[85%]" />
                            </div>
                        ) : configContent ? (
                            <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap leading-relaxed">
                                {configContent}
                            </pre>
                        ) : (
                            <p className="text-gray-500 text-sm italic">No content available</p>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    {showDeleteConfirm ? (
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-red-600 font-medium">Are you sure you want to delete?</span>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                {isDeleting && (
                                    <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                                )}
                                Yes, Delete
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleDeleteClick}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => onEdit(template)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                            Edit Template
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
