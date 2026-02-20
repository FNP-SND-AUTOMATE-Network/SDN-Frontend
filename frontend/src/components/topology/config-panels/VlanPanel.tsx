"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faSpinner, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { ConfigPanelProps } from "./types";

export function VlanPanel({ showData, isPushing, handlePush }: ConfigPanelProps) {
    const defaultFormState = { vlanId: "", name: "", intf: "", mode: "access" as "access" | "trunk" };
    const [vlans, setVlans] = useState<typeof defaultFormState[]>([defaultFormState]);

    const existingVlans = showData?.vlans || [];

    return (
        <div className="space-y-4">
            {/* Existing VLANs */}
            {existingVlans.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Current VLANs</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="text-gray-500 uppercase">
                                <tr>
                                    <th className="text-left py-1 px-2">ID</th>
                                    <th className="text-left py-1 px-2">Name</th>
                                    <th className="text-left py-1 px-2">Status</th>
                                    <th className="text-right py-1 px-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {existingVlans.map((vlan: any, idx: number) => (
                                    <tr key={idx} className="border-t border-gray-200">
                                        <td className="py-1.5 px-2 font-medium">{vlan.vlan_id || vlan.id}</td>
                                        <td className="py-1.5 px-2">{vlan.name || "-"}</td>
                                        <td className="py-1.5 px-2">{vlan.status || "-"}</td>
                                        <td className="py-1.5 px-2 text-right">
                                            <button
                                                onClick={() =>
                                                    handlePush("vlan.delete", { vlan_id: vlan.vlan_id || vlan.id })
                                                }
                                                disabled={isPushing}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {vlans.map((vlan, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-800">
                            VLAN Configuration {idx + 1}
                        </h4>
                        <div className="flex gap-2">
                            {vlans.length > 1 && (
                                <button
                                    onClick={() =>
                                        setVlans((prev) => prev.filter((_, i) => i !== idx))
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
                            <label className="text-xs text-gray-500 mb-1 block">VLAN ID</label>
                            <input
                                type="number"
                                value={vlan.vlanId}
                                onChange={(e) => {
                                    const updated = [...vlans];
                                    updated[idx].vlanId = e.target.value;
                                    setVlans(updated);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="e.g. 10"
                                min="1"
                                max="4094"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">VLAN Name</label>
                            <input
                                type="text"
                                value={vlan.name}
                                onChange={(e) => {
                                    const updated = [...vlans];
                                    updated[idx].name = e.target.value;
                                    setVlans(updated);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="Optional naming"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => handlePush("vlan.delete", { vlan_id: parseInt(vlan.vlanId) })}
                            disabled={isPushing || !vlan.vlanId}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Delete VLAN
                        </button>
                        <button
                            onClick={() => handlePush("vlan.create", { vlan_id: parseInt(vlan.vlanId), ...(vlan.name && { name: vlan.name }) })}
                            disabled={isPushing || !vlan.vlanId}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                            Create VLAN
                        </button>
                    </div>

                    <div className="border-t border-gray-200 mt-3 pt-3">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Assign to Interface</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Interface</label>
                                <input
                                    type="text"
                                    value={vlan.intf}
                                    onChange={(e) => {
                                        const updated = [...vlans];
                                        updated[idx].intf = e.target.value;
                                        setVlans(updated);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    placeholder="e.g. GigabitEthernet1/0/1"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Mode</label>
                                <select
                                    value={vlan.mode}
                                    onChange={(e) => {
                                        const updated = [...vlans];
                                        updated[idx].mode = e.target.value as "access" | "trunk";
                                        setVlans(updated);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="access">Access</option>
                                    <option value="trunk">Trunk</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={() => handlePush("vlan.assign_port", { interface: vlan.intf, vlan_id: parseInt(vlan.vlanId), mode: vlan.mode })}
                                disabled={isPushing || !vlan.vlanId || !vlan.intf}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                                Assign Interface
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={() =>
                    setVlans((prev) => [
                        ...prev,
                        { vlanId: "", name: "", intf: "", mode: "access" },
                    ])
                }
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 text-sm rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
                + Add Another VLAN configuration
            </button>

            {/* Show Data */}
            {showData && (
                <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase">VLAN Database</h4>
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                        {typeof showData === "string" ? showData : JSON.stringify(showData, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
