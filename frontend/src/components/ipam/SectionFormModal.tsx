"use client";

import React, { useState, useEffect } from "react";
import { Section, SectionCreateRequest, ipamService } from "@/services/ipamService";
import { useAuth } from "@/contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";

interface SectionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    section?: Section | null; // For edit mode
    parentSectionId?: string | null; // Pre-selected parent for new sub-section
    allSections?: Section[]; // All sections for parent dropdown
}

export default function SectionFormModal({
    isOpen,
    onClose,
    onSuccess,
    section,
    parentSectionId,
    allSections = [],
}: SectionFormModalProps) {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [masterSection, setMasterSection] = useState<string>("");

    const isEditMode = !!section;

    // Reset form when modal opens/closes or section changes
    useEffect(() => {
        if (isOpen) {
            if (section) {
                setName(section.name || "");
                setDescription(section.description || "");
                setMasterSection(section.master_section || "");
            } else {
                setName("");
                setDescription("");
                setMasterSection(parentSectionId || "");
            }
            setError(null);
        }
    }, [isOpen, section, parentSectionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const sectionData: SectionCreateRequest = {
                name: name.trim(),
                description: description.trim() || null,
                master_section: masterSection || null,
            };

            if (isEditMode && section) {
                await ipamService.updateSection(token, section.id, sectionData);
            } else {
                await ipamService.createSection(token, sectionData);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save section");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    // Filter out current section from parent options (can't be parent of itself)
    const availableParentSections = allSections.filter(
        (s) => s.id !== section?.id
    );

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {isEditMode ? "Edit Section" : "Add Section"}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Enter section name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Enter description (optional)"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Parent Section
                            </label>
                            <select
                                value={masterSection}
                                onChange={(e) => setMasterSection(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">-- No Parent (Root Section) --</option>
                                {availableParentSections.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                disabled={isLoading || !name.trim()}
                            >
                                {isLoading && (
                                    <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                                )}
                                {isEditMode ? "Save Changes" : "Add Section"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
