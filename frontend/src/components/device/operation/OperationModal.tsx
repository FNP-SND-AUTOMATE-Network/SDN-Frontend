"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faDownload } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  OperatingSystem,
  OperatingSystemCreateRequest,
  OperatingSystemUpdateRequest,
  OsType,
  OSFile,
} from "@/services/operatingSystemService";
import { Tag } from "@/services/tagService";

interface OperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "add" | "edit";
  os?: OperatingSystem | null;
  onSubmit: (params: {
    osData: OperatingSystemCreateRequest | OperatingSystemUpdateRequest;
    file?: File | null;
    version?: string | null;
    tagIds: string[];
  }) => Promise<void>;
  files?: OSFile[];
  isFilesLoading?: boolean;
  onDeleteFile?: (fileId: string) => void;
  allTags: Tag[];
  onDownloadFile?: (file: OSFile) => void;
}

interface FormErrors {

  os_type?: string;
  description?: string;
  file?: string;
  version?: string;
}

export default function OperationModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  os,
  onSubmit,
  files = [],
  isFilesLoading = false,
  onDeleteFile,
  allTags,
  onDownloadFile,
}: OperationModalProps) {
  const [formData, setFormData] = useState<OperatingSystemCreateRequest>({
    os_type: "OTHER" as OsType,
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && os) {
        setFormData({
          os_type: os.os_type,
          description: os.description || "",
        });
        setSelectedTagIds(
          os.tags ? os.tags.map((t) => t.tag_id) : []
        );
      } else {
        setFormData({
          os_type: "OTHER" as OsType,
          description: "",
        });
        setSelectedTagIds([]);
      }
      setFile(null);
      setVersion("");
      setErrors({});
    }
  }, [isOpen, mode, os]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (errors.file) {
      setErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isLoading) return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (errors.file) {
        setErrors((prev) => ({ ...prev, file: "" }));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleBrowseClick = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVersion(e.target.value);
    if (errors.version) {
      setErrors((prev) => ({ ...prev, version: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must not exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleTagSelection = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        osData: formData,
        file,
        version: version || null,
        tagIds: selectedTagIds,
      });
      onSuccess();
      onClose();
    } catch (error) {
      // Error จะถูก handle โดย parent component
      console.error("Error submitting operating system:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-900 font-sf-pro-display">
            {mode === "add" ? "Add Operating System" : "Edit Operating System"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto flex-1"
        >
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 font-sf-pro-display">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OS Type
                </label>
                <select
                  name="os_type"
                  value={formData.os_type || "OTHER"}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-sf-pro-text"
                >
                  <option value="CISCO_IOS">Cisco IOS</option>
                  <option value="CISCO_NXOS">Cisco NX-OS</option>
                  <option value="CISCO_ASA">Cisco ASA</option>
                  <option value="CISCO_Nexus">Cisco Nexus</option>
                  <option value="CISCO_IOS_XR">Cisco IOS-XR</option>
                  <option value="CISCO_IOS_XE">Cisco IOS-XE</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sf-pro-text min-h-[80px]"
                placeholder="Short description about this OS"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (optional)
              </label>
              {allTags.length === 0 ? (
                <p className="text-xs text-gray-400 font-sf-pro-text">
                  No tags available. You can create tags in Tag/Group page.
                </p>
              ) : (
                <div className="space-y-3">
                  {(["tag", "group", "other"] as const).map((typeKey) => {
                    const tagsOfType = allTags.filter((t) => t.type === typeKey);
                    if (tagsOfType.length === 0) return null;

                    const typeLabel =
                      typeKey === "tag"
                        ? "Tag"
                        : typeKey === "group"
                          ? "Group"
                          : "Other";

                    return (
                      <div key={typeKey}>
                        <div className="text-xs font-medium text-gray-500 mb-1 font-sf-pro-text">
                          {typeLabel}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tagsOfType.map((tag) => {
                            const isSelected = selectedTagIds.includes(tag.tag_id);
                            return (
                              <button
                                key={tag.tag_id}
                                type="button"
                                onClick={() => toggleTagSelection(tag.tag_id)}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border transition-colors font-sf-pro-text ${isSelected
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

          {/* File Upload - Dropzone */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 font-sf-pro-display">
              OS File (optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OS File
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                    } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                  onClick={handleBrowseClick}
                >
                  <div className="text-sm font-medium text-gray-800 font-sf-pro-text">
                    Drag and drop OS file here
                  </div>
                  <div className="mt-1 text-xs text-gray-500 font-sf-pro-text">
                    Or click to browse (single file)
                  </div>
                  {file && (
                    <div className="mt-3 px-3 py-2 rounded-md bg-white border border-gray-200 w-full text-xs text-gray-700 font-sf-pro-text flex items-center justify-between">
                      <span className="truncate max-w-[220px]">
                        {file.name}
                      </span>
                      <span className="ml-2 whitespace-nowrap">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="*/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="hidden"
                />
                {errors.file && (
                  <p className="mt-1 text-xs text-red-600">{errors.file}</p>
                )}
              </div>
              <div>
                <Input
                  label="Version (optional)"
                  name="version"
                  value={version}
                  onChange={handleVersionChange}
                  error={errors.version || ""}
                  disabled={isLoading}
                  placeholder="e.g. 17.3.1"
                />
                <p className="mt-2 text-xs text-gray-500 font-sf-pro-text">
                  File will be uploaded after saving OS information. Large OS
                  images are supported.
                </p>
              </div>
            </div>
          </div>

          {/* Existing Files (Edit mode) */}
          {mode === "edit" && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 font-sf-pro-display">
                Uploaded Files
              </h3>
              {isFilesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <div className="space-y-1 w-full">
                        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : files.length === 0 ? (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-md text-sm text-gray-500 font-sf-pro-text">
                  No files uploaded for this operating system yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 font-sf-pro-text truncate">
                            {file.file_name}
                          </span>
                          {file.version && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                              v{file.version}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500 font-sf-pro-text">
                          <span>
                            {(file.file_size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                          {file.file_type && <span>{file.file_type}</span>}
                          {file.checksum && (
                            <span className="truncate max-w-[200px]">
                              checksum: {file.checksum}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-400 font-sf-pro-text">
                          Uploaded at{" "}
                          {new Date(file.created_at).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </div>
                      </div>
                      {(onDownloadFile || onDeleteFile) && (
                        <div className="ml-4 flex items-center gap-2">
                          {onDownloadFile && (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => onDownloadFile(file)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                              title="Download"
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </button>
                          )}
                          {onDeleteFile && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              disabled={isLoading}
                              onClick={() => onDeleteFile(file.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : mode === "add"
                  ? "Add Operating System"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


