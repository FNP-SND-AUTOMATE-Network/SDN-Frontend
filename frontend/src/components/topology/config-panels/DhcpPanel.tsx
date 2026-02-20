"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faSpinner, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { ConfigPanelProps } from "./types";

export function DhcpPanel({ showData, isPushing, handlePush }: ConfigPanelProps) {
    const [dhcpPools, setDhcpPools] = useState<
        {
            pool_name: string;
            gateway: string;
            mask: string;
            start_ip?: string;
            end_ip?: string;
            network?: string;
            dns_servers: string;
        }[]
    >([{ pool_name: "", gateway: "", mask: "", network: "", dns_servers: "" }]);

    return (
        <div className="space-y-4">
            {dhcpPools.map((pool, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-800">
                            DHCP Pool {idx + 1}
                        </h4>
                        <div className="flex gap-2">
                            {dhcpPools.length > 1 && (
                                <button
                                    onClick={() =>
                                        setDhcpPools((prev) => prev.filter((_, i) => i !== idx))
                                    }
                                    className="text-red-500 hover:text-red-700 text-xs"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Pool Name</label>
                            <input
                                type="text"
                                value={pool.pool_name}
                                onChange={(e) => {
                                    const updated = [...dhcpPools];
                                    updated[idx].pool_name = e.target.value;
                                    setDhcpPools(updated);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="e.g. LAN_POOL_1"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Default Gateway</label>
                            <input
                                type="text"
                                value={pool.gateway}
                                onChange={(e) => {
                                    const updated = [...dhcpPools];
                                    updated[idx].gateway = e.target.value;
                                    setDhcpPools(updated);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="e.g. 192.168.1.1"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Network / Subnet</label>
                            <input
                                type="text"
                                value={pool.network}
                                onChange={(e) => {
                                    const updated = [...dhcpPools];
                                    updated[idx].network = e.target.value;
                                    setDhcpPools(updated);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="e.g. 192.168.1.0"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Subnet Mask</label>
                            <input
                                type="text"
                                value={pool.mask}
                                onChange={(e) => {
                                    const updated = [...dhcpPools];
                                    updated[idx].mask = e.target.value;
                                    setDhcpPools(updated);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="e.g. 255.255.255.0"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-gray-500 mb-1 block">DNS Servers (comma separated)</label>
                            <input
                                type="text"
                                value={pool.dns_servers}
                                onChange={(e) => {
                                    const updated = [...dhcpPools];
                                    updated[idx].dns_servers = e.target.value;
                                    setDhcpPools(updated);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="e.g. 8.8.8.8, 8.8.4.4"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={() => {
                                const params: any = {
                                    pool_name: pool.pool_name,
                                    gateway: pool.gateway,
                                    mask: pool.mask,
                                };
                                if (pool.network) {
                                    // Intent mapping might require network if start/end are not provided, or it just uses mask + gateway context. Check specific intent params but typically network is sent.
                                    params['network'] = pool.network;
                                }
                                if (pool.dns_servers) {
                                    params['dns_servers'] = pool.dns_servers.split(',').map(s => s.trim());
                                }
                                handlePush("dhcp.create_pool", params);
                            }}
                            disabled={isPushing || !pool.pool_name || !pool.gateway || !pool.mask}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                            Create DHCP Pool
                        </button>
                    </div>
                </div>
            ))}

            <button
                onClick={() =>
                    setDhcpPools((prev) => [
                        ...prev,
                        { pool_name: "", gateway: "", mask: "", network: "", dns_servers: "" },
                    ])
                }
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 text-sm rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
                + Add Another DHCP Pool
            </button>

            {/* Show Data */}
            {showData && (
                <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase">DHCP Pools</h4>
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                        {typeof showData === "string" ? showData : JSON.stringify(showData, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
