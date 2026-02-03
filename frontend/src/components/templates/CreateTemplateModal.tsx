"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
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
    TemplateType,
} from "@/services/configurationTemplateService";
import { tagService, Tag } from "@/services/tagService";
import { useAuth } from "@/contexts/AuthContext";

interface CreateTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultMode?: "upload" | "write";
}

const TEMPLATE_TYPES: { value: TemplateType; label: string }[] = [
    { value: "NETWORK", label: "Network" },
    { value: "SECURITY", label: "Security" },
    { value: "OTHER", label: "Other" },
];

export default function CreateTemplateModal({
    isOpen,
    onClose,
    onSuccess,
    defaultMode = "write",
}: CreateTemplateModalProps) {
    const { token } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [templateName, setTemplateName] = useState("");
    const [description, setDescription] = useState("");
    const [templateType, setTemplateType] = useState<TemplateType>("NETWORK");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [mode, setMode] = useState<"upload" | "write">(defaultMode);

    // Tags state
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoadingTags, setIsLoadingTags] = useState(false);

    // Content state
    const [configContent, setConfigContent] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const resetForm = () => {
        setTemplateName("");
        setDescription("");
        setTemplateType("NETWORK");
        setSelectedTags([]);
        setConfigContent("");
        setSelectedFile(null);
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith("text/") || file.name.match(/\.(txt|yaml|yml)$/i)) {
                setSelectedFile(file);
            } else {
                setError("Please upload a text file (.txt, .yaml, .yml)");
            }
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
            setError(null);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        // Validation
        if (!templateName.trim()) {
            setError("Template name is required");
            return;
        }

        if (mode === "upload" && !selectedFile) {
            setError("Please select a file to upload");
            return;
        }

        if (mode === "write" && !configContent.trim()) {
            setError("Please enter configuration content");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Step 1: Create the template
            // Single API call - createTemplate now accepts content directly
            const content = mode === "upload" ? selectedFile! : configContent;

            await configurationTemplateService.createTemplate(
                token,
                {
                    template_name: templateName.trim(),
                    description: description.trim() || null,
                    template_type: templateType,
                    tag_name: selectedTags.length > 0 ? selectedTags.join(",") : null,
                },
                content
            );

            onSuccess();
            handleClose();
        } catch (err: unknown) {
            console.error("Failed to create template:", err);
            setError(err instanceof Error ? err.message : "Failed to create template");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 transition-opacity bg-gray-800 bg-opacity-75"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl p-6 overflow-hidden bg-white shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Create New Template
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => setMode("write")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${mode === "write"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                            Write Content
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("upload")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${mode === "upload"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
                            Upload File
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4 mb-6">
                        {/* Template Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Template Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="e.g., OSPF Basic Config"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of this template"
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

                        {/* Tag */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tag (optional)
                            </label>
                            {isLoadingTags ? (
                                <p className="text-xs text-gray-400">Loading tags...</p>
                            ) : tags.length === 0 ? (
                                <p className="text-xs text-gray-400">
                                    No tags available. You can create tags in Tag Group page.
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
                    </div>

                    {/* Content Area */}
                    {mode === "write" ? (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Configuration Content <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={configContent}
                                onChange={(e) => setConfigContent(e.target.value)}
                                placeholder="Enter your configuration content here..."
                                rows={12}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-gray-50"
                            />
                        </div>
                    ) : (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload File <span className="text-red-500">*</span>
                            </label>
                            {!selectedFile ? (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragOver
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                        }`}
                                >
                                    <FontAwesomeIcon
                                        icon={faUpload}
                                        className="w-10 h-10 text-gray-400 mx-auto mb-3"
                                    />
                                    <p className="text-sm text-gray-600 mb-1">
                                        Drag and drop your file here, or click to browse
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Supported: .txt, .yaml, .yml
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".txt,.yaml,.yml,text/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <FontAwesomeIcon
                                                icon={faFile}
                                                className="w-5 h-5 text-blue-600"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(selectedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading && (
                                <FontAwesomeIcon
                                    icon={faSpinner}
                                    className="w-4 h-4 animate-spin"
                                />
                            )}
                            Create Template
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
