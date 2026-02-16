"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronRight,
    faChevronDown,
    faFolder,
    faFolderOpen,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { Server, Router as RouterIcon, Shield, Wifi, Box } from "lucide-react";
import { LocalSite, siteService } from "@/services/siteService";
import { DeviceNetwork, deviceNetworkService } from "@/services/deviceNetworkService";
import { useAuth } from "@/contexts/AuthContext";

const getDeviceIcon = (type: string, className: string) => {
    switch (type) {
        case "SWITCH":
            return <Server className={className} />;
        case "ROUTER":
            return <RouterIcon className={className} />;
        case "FIREWALL":
            return <Shield className={className} />;
        case "ACCESS_POINT":
            return <Wifi className={className} />;
        default:
            return <Box className={className} />;
    }
};

interface TopologySiteTreeProps {
    onSiteSelect?: (siteId: string) => void;
    onDeviceSelect?: (deviceId: string) => void;
    selectedSiteId?: string | null;
    selectedDeviceId?: string | null;
}

interface SiteWithDevices extends LocalSite {
    devices?: DeviceNetwork[];
    isLoading?: boolean;
}

export default function TopologySiteTree({
    onSiteSelect,
    onDeviceSelect,
    selectedSiteId,
    selectedDeviceId,
}: TopologySiteTreeProps) {
    const { token } = useAuth();
    const [sites, setSites] = useState<SiteWithDevices[]>([]);
    const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all sites
    useEffect(() => {
        const fetchSites = async () => {
            if (!token) return;

            setIsLoading(true);
            setError(null);
            try {
                const response = await siteService.getLocalSites(token, 1, 100);
                setSites(response.sites);
            } catch (err: any) {
                setError(err.message || "Failed to load sites");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSites();
    }, [token]);

    // Fetch devices for a site when expanded
    const fetchDevicesForSite = async (siteId: string) => {
        if (!token) return;

        // Mark site as loading
        setSites(prev => prev.map(site =>
            site.id === siteId ? { ...site, isLoading: true } : site
        ));

        try {
            const response = await deviceNetworkService.getDevices(token, 1, 100, { site_id: siteId });
            setSites(prev => prev.map(site =>
                site.id === siteId ? { ...site, devices: response.devices, isLoading: false } : site
            ));
        } catch (err: any) {
            console.error("Failed to load devices:", err);
            setSites(prev => prev.map(site =>
                site.id === siteId ? { ...site, isLoading: false } : site
            ));
        }
    };

    // Toggle site expansion
    const toggleSite = (siteId: string) => {
        const newExpanded = new Set(expandedSites);
        if (newExpanded.has(siteId)) {
            newExpanded.delete(siteId);
        } else {
            newExpanded.add(siteId);
            // Fetch devices if not already loaded
            const site = sites.find(s => s.id === siteId);
            if (site && !site.devices) {
                fetchDevicesForSite(siteId);
            }
        }
        setExpandedSites(newExpanded);
    };

    // Group sites by city
    const sitesByCity = sites.reduce((acc, site) => {
        const city = site.city || "Other";
        if (!acc[city]) {
            acc[city] = [];
        }
        acc[city].push(site);
        return acc;
    }, {} as Record<string, SiteWithDevices[]>);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-white border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Sites
                </h2>
            </div>

            <div className="p-2">
                {Object.entries(sitesByCity).map(([city, citySites]) => (
                    <div key={city} className="mb-2">
                        {/* City Header */}
                        <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {city}
                        </div>

                        {/* Sites in this city */}
                        {citySites.map((site) => {
                            const isExpanded = expandedSites.has(site.id);
                            const isSelected = selectedSiteId === site.id;
                            const deviceCount = site.device_count || 0;

                            return (
                                <div key={site.id} className="mb-1">
                                    {/* Site Row */}
                                    <div
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${isSelected
                                            ? "bg-primary-50 text-primary-700"
                                            : "hover:bg-gray-50 text-gray-700"
                                            }`}
                                        onClick={() => {
                                            toggleSite(site.id);
                                            onSiteSelect?.(site.id);
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={isExpanded ? faChevronDown : faChevronRight}
                                            className="w-3 h-3 text-gray-400"
                                        />
                                        <FontAwesomeIcon
                                            icon={isExpanded ? faFolderOpen : faFolder}
                                            className={`w-4 h-4 ${isSelected ? "text-primary-600" : "text-blue-500"}`}
                                        />
                                        <div className="flex-1 flex items-center justify-between min-w-0">
                                            <span className="text-sm font-medium truncate">
                                                {site.site_name || site.site_code}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-2">
                                                ({deviceCount})
                                            </span>
                                        </div>
                                    </div>

                                    {/* Devices (when expanded) */}
                                    {isExpanded && (
                                        <div className="ml-6 mt-1">
                                            {site.isLoading ? (
                                                <div className="flex items-center gap-2 px-2 py-1 text-gray-500">
                                                    <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                                                    <span className="text-xs">Loading devices...</span>
                                                </div>
                                            ) : site.devices && site.devices.length > 0 ? (
                                                site.devices.map((device) => {
                                                    const isDeviceSelected = selectedDeviceId === device.id;
                                                    return (
                                                        <div
                                                            key={device.id}
                                                            className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${isDeviceSelected
                                                                ? "bg-primary-50 text-primary-700"
                                                                : "hover:bg-gray-50 text-gray-600"
                                                                }`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeviceSelect?.(device.id);
                                                            }}
                                                        >
                                                            {getDeviceIcon(
                                                                device.type,
                                                                `w-3.5 h-3.5 ${isDeviceSelected ? "text-primary-600" : "text-gray-400"}`
                                                            )}
                                                            <span className="text-sm truncate flex-1">
                                                                {device.device_name}
                                                            </span>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="px-2 py-1 text-xs text-gray-500 italic">
                                                    No devices
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}

                {sites.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No sites found
                    </div>
                )}
            </div>
        </div>
    );
}
