"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faSpinner,
    faUpload,
    faEdit,
    faFile,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {
    configurationTemplateService,
    ConfigurationTemplate,
    TemplateType,
} from "@/services/configurationTemplateService";
import { tagService, Tag } from "@/services/tagService";
import { useAuth } from "@/contexts/AuthContext";

interface EditTemplateModalProps {
    isOpen: boolean;
    template: ConfigurationTemplate | null;
    onClose: () => void;
    onSuccess: () => void;
}

const TEMPLATE_TYPES: { value: TemplateType; label: string }[] = [
    { value: "NETWORK", label: "Network" },
    { value: "SECURITY", label: "Security" },
    { value: "OTHER", label: "Other" },
];

export default function EditTemplateModal({
    isOpen,
    template,
    onClose,
    onSuccess,
}: EditTemplateModalProps) {
    const { token } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [templateName, setTemplateName] = useState("");
    const [description, setDescription] = useState("");
    const [templateType, setTemplateType] = useState<TemplateType>("NETWORK");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [configContent, setConfigContent] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [contentMode, setContentMode] = useState<"keep" | "edit" | "upload">("keep");

    // Tags state
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoadingTags, setIsLoadingTags] = useState(false);

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize form when template changes
    useEffect(() => {
        if (isOpen && template) {
            setTemplateName(template.template_name);
            setDescription(template.description || "");
            setTemplateType(template.template_type);
            setConfigContent(template.detail?.config_content || "");
            setSelectedTags(template.tags?.map(t => t.tag_name) || []);
            setContentMode("keep");
            setSelectedFile(null);
            setError(null);
        }
    }, [isOpen, template]);

    // Fetch tags when modal opens
    useEffect(() => {
        const fetchTags = async () => {
            if (!token || !isOpen) return;

            setIsLoadingTags(true);
            try {
                const response = await tagService.getTags(token, 1, 100);
                setTags(response.tags);
            } catch (err) {
                console.error("Failed to fetch tags:", err);
            } finally {
                setIsLoadingTags(false);
            }
        };

        fetchTags();
    }, [token, isOpen]);

    const handleClose = () => {
        setError(null);
        onClose();
    };

    // File handling
    const handleFileSelect = useCallback((file: File) => {
        const validExtensions = [".txt", ".yaml", ".yml"];
        const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

        if (!validExtensions.includes(extension)) {
            setError("Only .txt, .yaml, and .yml files are allowed");
            return;
        }

        setSelectedFile(file);
        setError(null);
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token || !template) return;

        // Validation
        if (!templateName.trim()) {
            setError("Template name is required");
            return;
        }

        if (contentMode === "upload" && !selectedFile) {
            setError("Please select a file to upload");
            return;
        }

        if (contentMode === "edit" && !configContent.trim()) {
            setError("Configuration content cannot be empty");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Update template metadata
            await configurationTemplateService.updateTemplate(
                token,
                template.id,
                {
                    template_name: templateName.trim(),
                    description: description.trim() || null,
                    template_type: templateType,
                    tag_names: selectedTags.length > 0 ? selectedTags : null,
                }
            );

            // Upload new content if changed
            if (contentMode === "upload" && selectedFile) {
                await configurationTemplateService.uploadTemplateContent(
                    token,
                    template.id,
                    selectedFile
                );
            } else if (contentMode === "edit") {
                await configurationTemplateService.uploadTemplateContent(
                    token,
                    template.id,
                    configContent
                );
            }

            onSuccess();
            handleClose();
        } catch (err: unknown) {
            console.error("Failed to update template:", err);
            setError(err instanceof Error ? err.message : "Failed to update template");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !template) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 transition-opacity bg-gray-800 bg-opacity-75"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-3xl bg-white shadow-xl rounded-xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FontAwesomeIcon icon={faEdit} className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Edit Template</h3>
                            <p className="text-sm text-gray-500">Update template details and content</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
                    {/* Error message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Template Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Template Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="Enter template name"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Template Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Template Type
                            </label>
                            <select
                                value={templateType}
                                onChange={(e) => setTemplateType(e.target.value as TemplateType)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                {TEMPLATE_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter template description"
                                rows={2}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags (optional)
                        </label>
                        {isLoadingTags ? (
                            <p className="text-xs text-gray-400">Loading tags...</p>
                        ) : tags.length === 0 ? (
                            <p className="text-xs text-gray-400">
                                No tags available.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {(["tag", "group", "other"] as const).map((typeKey) => {
                                    const tagsOfType = tags.filter((t) => t.type === typeKey);
                                    if (tagsOfType.length === 0) return null;

                                    const typeLabel =
                                        typeKey === "tag"
                                            ? "Tag"
                                            : typeKey === "group"
                                                ? "Group"
                                                : "Other";

                                    return (
                                        <div key={typeKey}>
                                            <div className="text-xs font-medium text-gray-500 mb-1">
                                                {typeLabel}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {tagsOfType.map((tag) => {
                                                    const isSelected = selectedTags.includes(tag.tag_name);
                                                    return (
                                                        <button
                                                            key={tag.tag_id}
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedTags((prev) =>
                                                                    prev.includes(tag.tag_name)
                                                                        ? prev.filter((t) => t !== tag.tag_name)
                                                                        : [...prev, tag.tag_name]
                                                                )
                                                            }
                                                            disabled={isLoading}
                                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border transition-colors ${isSelected
                                                                ? "border-blue-500 bg-blue-100 text-blue-800"
                                                                : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                                                                }`}
                                                        >
                                                            <span
                                                                className="w-2 h-2 rounded-full mr-2"
                                                                style={{ backgroundColor: tag.color }}
                                                            />
                                                            {tag.tag_name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Content Mode Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Configuration Content
                        </label>
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setContentMode("keep")}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${contentMode === "keep"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                Keep Current
                            </button>
                            <button
                                type="button"
                                onClick={() => setContentMode("edit")}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${contentMode === "edit"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                                Edit Content
                            </button>
                            <button
                                type="button"
                                onClick={() => setContentMode("upload")}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${contentMode === "upload"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
                                Upload New File
                            </button>
                        </div>
                    </div>

                    {/* Content Area based on mode */}
                    {contentMode === "keep" && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-500 mb-2">Current content will be preserved:</p>
                            <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap max-h-[150px] overflow-auto">
                                {template.detail?.config_content?.slice(0, 500) || "No content"}
                                {(template.detail?.config_content?.length || 0) > 500 && "..."}
                            </pre>
                        </div>
                    )}

                    {contentMode === "edit" && (
                        <div>
                            <textarea
                                value={configContent}
                                onChange={(e) => setConfigContent(e.target.value)}
                                placeholder="Enter your configuration content here..."
                                rows={10}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-gray-50"
                            />
                        </div>
                    )}

                    {contentMode === "upload" && (
                        <div>
                            {!selectedFile ? (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragOver
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-300 hover:border-gray-400"
                                        }`}
                                >
                                    <FontAwesomeIcon
                                        icon={faUpload}
                                        className="w-8 h-8 text-gray-400 mb-3"
                                    />
                                    <p className="text-sm text-gray-600 mb-1">
                                        Drag and drop your file here, or click to browse
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Supported formats: .txt, .yaml, .yml
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".txt,.yaml,.yml"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faFile} className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {(selectedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFile(null)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        {isLoading && (
                            <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                        )}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
