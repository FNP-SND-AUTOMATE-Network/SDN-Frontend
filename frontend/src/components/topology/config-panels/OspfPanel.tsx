"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faSpinner, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { ConfigPanelProps } from "./types";

export function OspfPanel({ isPushing, handlePush }: ConfigPanelProps) {
    const [ospfProcessId, setOspfProcessId] = useState("1");
    const [ospfRouterId, setOspfRouterId] = useState("");
    const [ospfNetworks, setOspfNetworks] = useState<
        { network: string; wildcard: string; area: string }[]
    >([{ network: "", wildcard: "", area: "0" }]);

    return (
        <div className="space-y-4">
            {/* OSPF Process */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">OSPF Process</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Process ID</label>
                        <input
                            type="number"
                            value={ospfProcessId}
                            onChange={(e) => setOspfProcessId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Router ID</label>
                        <input
                            type="text"
                            value={ospfRouterId}
                            onChange={(e) => setOspfRouterId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="e.g. 1.1.1.1"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => handlePush("routing.ospf.enable", { process_id: parseInt(ospfProcessId) })}
                        disabled={isPushing || !ospfProcessId}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Enable OSPF
                    </button>
                    {ospfRouterId && (
                        <button
                            onClick={() => handlePush("routing.ospf.set_router_id", { process_id: parseInt(ospfProcessId), router_id: ospfRouterId })}
                            disabled={isPushing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Set Router ID
                        </button>
                    )}
                    <button
                        onClick={() => handlePush("routing.ospf.disable", { process_id: parseInt(ospfProcessId) })}
                        disabled={isPushing || !ospfProcessId}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Disable OSPF
                    </button>
                </div>
            </div>

            {/* OSPF Networks */}
            {ospfNetworks.map((net, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-800">Network {idx + 1}</h4>
                        {ospfNetworks.length > 1 && (
                            <button onClick={() => setOspfNetworks((prev) => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                                <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <input
                            type="text"
                            value={net.network}
                            onChange={(e) => { const u = [...ospfNetworks]; u[idx].network = e.target.value; setOspfNetworks(u); }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Network"
                        />
                        <input
                            type="text"
                            value={net.wildcard}
                            onChange={(e) => { const u = [...ospfNetworks]; u[idx].wildcard = e.target.value; setOspfNetworks(u); }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Wildcard"
                        />
                        <input
                            type="text"
                            value={net.area}
                            onChange={(e) => { const u = [...ospfNetworks]; u[idx].area = e.target.value; setOspfNetworks(u); }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Area"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => handlePush("routing.ospf.remove_network", { process_id: parseInt(ospfProcessId), network: net.network, wildcard: net.wildcard, area: parseInt(net.area) })}
                            disabled={isPushing || !net.network || !net.wildcard}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Remove
                        </button>
                        <button
                            onClick={() => handlePush("routing.ospf.add_network", { process_id: parseInt(ospfProcessId), network: net.network, wildcard: net.wildcard, area: parseInt(net.area) })}
                            disabled={isPushing || !net.network || !net.wildcard}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                            Add Network
                        </button>
                    </div>
                </div>
            ))}

            <button
                onClick={() => setOspfNetworks((prev) => [...prev, { network: "", wildcard: "", area: "0" }])}
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 text-sm rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
                + Add OSPF Network
            </button>
        </div>
    );
}
