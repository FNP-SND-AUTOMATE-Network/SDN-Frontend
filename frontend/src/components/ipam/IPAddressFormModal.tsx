"use client";

import React, { useState, useEffect } from "react";
import { IPAddress, ipamService } from "@/services/ipamService";
import { useAuth } from "@/contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";

interface IPAddressFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    address?: IPAddress | null; // For edit mode
    subnetId: string;
}

export default function IPAddressFormModal({
    isOpen,
    onClose,
    onSuccess,
    address,
    subnetId,
}: IPAddressFormModalProps) {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [ip, setIp] = useState("");
    const [hostname, setHostname] = useState("");
    const [description, setDescription] = useState("");
    const [mac, setMac] = useState("");
    const [isGateway, setIsGateway] = useState(false);

    const isEditMode = !!address;

    // Reset form when modal opens/closes or address changes
    useEffect(() => {
        if (isOpen) {
            if (address) {
                setIp((address as any).ip || "");
                setHostname(address.hostname || "");
                setDescription(address.description || "");
                setMac(address.mac || "");
                setIsGateway((address as any).is_gateway === "1" || (address as any).is_gateway === 1);
            } else {
                setIp("");
                setHostname("");
                setDescription("");
                setMac("");
                setIsGateway(false);
            }
            setError(null);
        }
    }, [isOpen, address]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            if (isEditMode && address) {
                await ipamService.updateIPAddress(token, address.id, {
                    hostname: hostname.trim() || null,
                    description: description.trim() || null,
                    mac: mac.trim() || null,
                    is_gateway: isGateway,
                });
            } else {
                await ipamService.createIPAddress(token, {
                    subnet_id: subnetId,
                    ip: ip.trim(),
                    hostname: hostname.trim() || null,
                    description: description.trim() || null,
                    mac: mac.trim() || null,
                    is_gateway: isGateway,
                });
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save IP address");
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
                            {isEditMode ? "Edit IP Address" : "Add IP Address"}
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
                                IP Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={ip}
                                onChange={(e) => setIp(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                                placeholder="e.g. 192.168.1.1"
                                required
                                disabled={isEditMode}
                            />
                            {isEditMode && (
                                <p className="text-xs text-gray-500 mt-1">IP address cannot be changed. Delete and create a new one if needed.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hostname
                            </label>
                            <input
                                type="text"
                                value={hostname}
                                onChange={(e) => setHostname(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="e.g. server01.example.com"
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
                                rows={2}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                MAC Address
                            </label>
                            <input
                                type="text"
                                value={mac}
                                onChange={(e) => setMac(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="e.g. 00:1A:2B:3C:4D:5E"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_gateway"
                                checked={isGateway}
                                onChange={(e) => setIsGateway(e.target.checked)}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="is_gateway" className="text-sm text-gray-700">
                                This is a Gateway
                            </label>
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
                                disabled={isLoading || (!isEditMode && !ip.trim())}
                            >
                                {isLoading && (
                                    <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                                )}
                                {isEditMode ? "Save Changes" : "Add IP Address"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
