"use client";

import { useState, useEffect } from "react";
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
          <div className="col-span-3 h-full rounded-lg shadow-sm overflow-hidden">
            <TopologySiteTree
              onSiteSelect={handleSiteSelect}
              onDeviceSelect={handleDeviceSelect}
              selectedSiteId={selectedSiteId}
              selectedDeviceId={selectedDeviceId}
            />
          </div>

          {/* Right Side - Canvas + Table */}
          <div className="col-span-9 flex flex-col gap-6 h-full">
            {/* Topology Canvas - Takes 60% of height */}
            <div className="flex-[3] rounded-lg shadow-sm overflow-hidden">
              <TopologyCanvas selectedSiteId={selectedSiteId} />
            </div>

            {/* Device Table - Takes 40% of height */}
            <div className="flex-[2] overflow-y-auto">
              <TopologyDeviceTable
                devices={devices}
                selectedDeviceId={selectedDeviceId}
                onDeviceSelect={handleDeviceSelect}
              />
            </div>
          </div>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
