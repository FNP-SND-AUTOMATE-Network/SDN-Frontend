"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Tag,
  TagCreateRequest,
  TagUpdateRequest,
  TypeTag,
} from "@/services/tagService";

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "add" | "edit";
  tag?: Tag | null;
  onSubmit: (data: TagCreateRequest | TagUpdateRequest) => Promise<void>;
}

interface FormErrors {
  tag_name?: string;
  description?: string;
  color?: string;
}

export default function TagModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  tag,
  onSubmit,
}: TagModalProps) {
  const [formData, setFormData] = useState<TagCreateRequest>({
    tag_name: "",
    description: "",
    type: "other",
    color: "#3B82F6",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && tag) {
        setFormData({
          tag_name: tag.tag_name || "",
          description: tag.description || "",
          type: tag.type || "other",
          color: tag.color || "#3B82F6",
        });
      } else {
        setFormData({
          tag_name: "",
          description: "",
          type: "other",
          color: "#3B82F6",
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, tag]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.tag_name?.trim()) {
      newErrors.tag_name = "Please enter tag name";
    } else if (formData.tag_name.length > 100) {
      newErrors.tag_name = "Tag name must not exceed 100 characters";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must not exceed 500 characters";
    }

    if (formData.color && !/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      newErrors.color = "Invalid color format (use #RRGGBB)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting tag:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-900 font-sf-pro-display">
            {mode === "add" ? "Add New Tag" : "Edit Tag Information"}
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
          {/* Tag Name */}
          <div>
            <Input
              label="Tag Name"
              name="tag_name"
              value={formData.tag_name || ""}
              onChange={handleChange}
              error={errors.tag_name || ""}
              required
              disabled={isLoading}
              placeholder="e.g. Production, Development"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-sf-pro-text"
              placeholder="Enter tag description..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Type and Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="tag">Tag</option>
                <option value="group">Group</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-10 w-16 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed"
                />
                <Input
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  error={errors.color || ""}
                  disabled={isLoading}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
                  ? "Add Tag"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

