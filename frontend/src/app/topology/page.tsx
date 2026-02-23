"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown, faTable } from "@fortawesome/free-solid-svg-icons";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";
import TopologySiteTree from "@/components/topology/TopologySiteTree";
import TopologyCanvas from "@/components/topology/TopologyCanvas";
import TopologyDeviceTable from "@/components/topology/TopologyDeviceTable";
import { DeviceNetwork, deviceNetworkService } from "@/services/deviceNetworkService";
import { useAuth } from "@/contexts/AuthContext";

export default function TopologyPage() {
    const { token } = useAuth();
    const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [devices, setDevices] = useState<DeviceNetwork[]>([]);
    const [isLoadingDevices, setIsLoadingDevices] = useState(false);
    const [isTableCollapsed, setIsTableCollapsed] = useState(false);

    // Fetch devices when site is selected
    useEffect(() => {
        const fetchDevices = async () => {
            if (!token || !selectedSiteId) {
                setDevices([]);
                return;
            }

            setIsLoadingDevices(true);
            try {
                const response = await deviceNetworkService.getDevices(token, 1, 100, {
                    site_id: selectedSiteId,
                });
                setDevices(response.devices);
            } catch (err) {
                console.error("Failed to load devices:", err);
                setDevices([]);
            } finally {
                setIsLoadingDevices(false);
            }
        };

        fetchDevices();
    }, [token, selectedSiteId]);

    const handleSiteSelect = (siteId: string) => {
        setSelectedSiteId(siteId);
        setSelectedDeviceId(null); // Reset device selection
    };

    const handleDeviceSelect = (deviceId: string) => {
        setSelectedDeviceId(deviceId);
    };

    return (
        <ProtectedRoute>
            <PageLayout>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 font-sf-pro-display">
                        Topology
                    </h1>
                    {selectedSiteId && (
                        <div className="text-sm text-gray-500">
                            {devices.length} device{devices.length !== 1 ? "s" : ""} found
                        </div>
                    )}
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-12 gap-6" style={{ height: "calc(100vh - 240px)" }}>
                    {/* Left Sidebar - Sites Tree */}
                    <div className="col-span-2 h-full rounded-lg shadow-sm overflow-hidden">
                        <TopologySiteTree
                            onSiteSelect={handleSiteSelect}
                            onDeviceSelect={handleDeviceSelect}
                            selectedSiteId={selectedSiteId}
                            selectedDeviceId={selectedDeviceId}
                        />
                    </div>

                    {/* Right Side - Canvas + Table */}
                    <div className="col-span-10 flex flex-col h-full">
                        {/* Topology Canvas - Expands when table is collapsed */}
                        <div
                            className="rounded-lg shadow-sm overflow-hidden transition-all duration-300"
                            style={{ flex: isTableCollapsed ? 1 : 3 }}
                        >
                            <TopologyCanvas selectedSiteId={selectedSiteId} />
                        </div>

                        {/* Toggle Button */}
                        <div className="flex items-center py-1">
                            <button
                                onClick={() => setIsTableCollapsed(!isTableCollapsed)}
                                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            >
                                <FontAwesomeIcon
                                    icon={faTable}
                                    className="w-3 h-3"
                                />
                                Devices
                                <FontAwesomeIcon
                                    icon={isTableCollapsed ? faChevronDown : faChevronUp}
                                    className="w-3 h-3"
                                />
                            </button>
                            <div className="flex-1 h-px bg-gray-200 ml-2" />
                        </div>

                        {/* Device Table - Collapsible */}
                        <div
                            className={`overflow-hidden transition-all duration-300 ${isTableCollapsed ? "flex-none h-0" : "flex-[2]"
                                }`}
                        >
                            <div className="h-full overflow-auto">
                                <TopologyDeviceTable
                                    devices={devices}
                                    selectedDeviceId={selectedDeviceId}
                                    onDeviceSelect={handleDeviceSelect}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </PageLayout>
        </ProtectedRoute>
    );
}
