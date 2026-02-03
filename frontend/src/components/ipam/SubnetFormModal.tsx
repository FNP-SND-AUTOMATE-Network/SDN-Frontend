"use client";

import React, { useState, useEffect } from "react";
import { Subnet, SubnetCreateRequest, Section, ipamService } from "@/services/ipamService";
import { useAuth } from "@/contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";

interface SubnetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    subnet?: Subnet | null; // For edit mode
    sectionId: string; // Required section ID
    parentSubnetId?: string | null; // For creating child subnet
    allSections?: Section[]; // For section dropdown
}

export default function SubnetFormModal({
    isOpen,
    onClose,
    onSuccess,
    subnet,
    sectionId,
    parentSubnetId,
    allSections = [],
}: SubnetFormModalProps) {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [subnetAddress, setSubnetAddress] = useState("");
    const [mask, setMask] = useState("");
    const [description, setDescription] = useState("");
    const [selectedSectionId, setSelectedSectionId] = useState(sectionId);
    const [vlanId, setVlanId] = useState("");

    const isEditMode = !!subnet;

    // Reset form when modal opens/closes or subnet changes
    useEffect(() => {
        if (isOpen) {
            if (subnet) {
                setSubnetAddress(subnet.subnet || "");
                setMask(subnet.mask || "");
                setDescription(subnet.description || "");
                setSelectedSectionId((subnet as any).section_id || sectionId);
                setVlanId(subnet.vlan_id || "");
            } else {
                setSubnetAddress("");
                setMask("");
                setDescription("");
                setSelectedSectionId(sectionId);
                setVlanId("");
            }
            setError(null);
        }
    }, [isOpen, subnet, sectionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            // Build request with only non-null values
            const subnetData: SubnetCreateRequest = {
                subnet: subnetAddress.trim(),
                mask: mask.trim(),
                section_id: selectedSectionId,
            };

            // Only add optional fields if they have values
            if (description.trim()) {
                subnetData.description = description.trim();
            }
            if (vlanId.trim()) {
                subnetData.vlan_id = vlanId.trim();
            }
            if (parentSubnetId) {
                subnetData.master_subnet_id = parentSubnetId;
            }

            if (isEditMode && subnet) {
                await ipamService.updateSubnet(token, subnet.id, subnetData);
            } else {
                await ipamService.createSubnet(token, subnetData);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save subnet");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

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
                            {isEditMode ? "Edit Subnet" : parentSubnetId ? "Add Child Subnet" : "Add Subnet"}
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subnet <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={subnetAddress}
                                    onChange={(e) => setSubnetAddress(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="e.g. 10.0.0.0"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mask <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={mask}
                                    onChange={(e) => setMask(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="e.g. 24"
                                    required
                                />
                            </div>
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
                                rows={2}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Section <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedSectionId}
                                onChange={(e) => setSelectedSectionId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                required
                            >
                                {allSections.length === 0 ? (
                                    <option value={sectionId}>Current Section</option>
                                ) : (
                                    allSections.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                VLAN ID
                            </label>
                            <input
                                type="text"
                                value={vlanId}
                                onChange={(e) => setVlanId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Enter VLAN ID (optional)"
                            />
                        </div>

                        {parentSubnetId && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                                This subnet will be created as a child of the parent subnet.
                            </div>
                        )}

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
                                disabled={isLoading || !subnetAddress.trim() || !mask.trim()}
                            >
                                {isLoading && (
                                    <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                                )}
                                {isEditMode ? "Save Changes" : "Add Subnet"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
