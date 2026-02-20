"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faSpinner, faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { ConfigPanelProps } from "./types";

export function InterfacePanel({ showData, isPushing, handlePush }: ConfigPanelProps) {
    const defaultFormState = { interface: "", ip: "", prefix: "24", description: "" };
    const [interfaces, setInterfaces] = useState<typeof defaultFormState[]>([defaultFormState]);

    const existingInterfaces = showData?.interfaces || [];

    const handleSelectExisting = (iface: any) => {
        setInterfaces([
            {
                interface: iface.interface || iface.name || "",
                ip: iface.ip || "",
                prefix: "24",
                description: iface.description || "",
            },
        ]);
    };

    return (
        <div className="space-y-4">
            {/* Existing Interface List */}
            {existingInterfaces.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Interface List</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                        {existingInterfaces.map((iface: any, idx: number) => {
                            const isSelected = interfaces[0]?.interface === (iface.interface || iface.name);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectExisting(iface)}
                                    className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${isSelected
                                            ? "bg-blue-100 text-blue-700"
                                            : "hover:bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    <span className="font-medium">{iface.interface || iface.name}</span>
                                    {iface.ip && <span className="ml-2 text-gray-500">{iface.ip}</span>}
                                    {iface.status && (
                                        <span
                                            className={`ml-2 text-xs ${iface.status === "up" ? "text-green-600" : "text-red-500"
                                                }`}
                                        >
                                            {iface.status}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {interfaces.map((intf, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-800">
                            Interface {idx + 1}
                        </h4>
                        <div className="flex gap-2">
                            {interfaces.length > 1 && (
                                <button
                                    onClick={() =>
                                        setInterfaces((prev) => prev.filter((_, i) => i !== idx))
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
                            <label className="text-xs text-gray-500 mb-1 block">Interface Name</label>
                            <input
                                type="text"
                                value={intf.interface}
                                onChange={(e) => {
                                    const updated = [...interfaces];
                                    updated[idx].interface = e.target.value;
                                    setInterfaces(updated);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="e.g. GigabitEthernet1 or eth0"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Description</label>
                            <input
                                type="text"
                                value={intf.description}
                                onChange={(e) => {
                                    const updated = [...interfaces];
                                    updated[idx].description = e.target.value;
                                    setInterfaces(updated);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="Optional description"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">IP Address</label>
                            <input
                                type="text"
                                value={intf.ip}
                                onChange={(e) => {
                                    const updated = [...interfaces];
                                    updated[idx].ip = e.target.value;
                                    setInterfaces(updated);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="e.g. 192.168.1.1"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Prefix Length</label>
                            <input
                                type="number"
                                value={intf.prefix}
                                onChange={(e) => {
                                    const updated = [...interfaces];
                                    updated[idx].prefix = e.target.value;
                                    setInterfaces(updated);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="e.g. 24"
                                min="1"
                                max="32"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={() => handlePush("interface.disable", { interface: intf.interface })}
                            disabled={isPushing || !intf.interface}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <FontAwesomeIcon icon={faArrowDown} className="w-3 h-3" />
                            Shutdown
                        </button>
                        <button
                            onClick={() => handlePush("interface.enable", { interface: intf.interface })}
                            disabled={isPushing || !intf.interface}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <FontAwesomeIcon icon={faArrowUp} className="w-3 h-3" />
                            No Shutdown
                        </button>
                        <button
                            onClick={() => {
                                if (intf.description) {
                                    handlePush("interface.set_description", { interface: intf.interface, description: intf.description });
                                }
                                handlePush("interface.set_ipv4", { interface: intf.interface, ip: intf.ip, prefix: parseInt(intf.prefix) || 24, ...(intf.description && { description: intf.description }) });
                            }}
                            disabled={isPushing || !intf.interface || !intf.ip}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <FontAwesomeIcon icon={isPushing ? faSpinner : faArrowUp} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                            Set IP & Enable
                        </button>
                    </div>
                </div>
            ))}

            <button
                onClick={() =>
                    setInterfaces((prev) => [
                        ...prev,
                        { interface: "", ip: "", prefix: "24", description: "" },
                    ])
                }
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 text-sm rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
                + Add Another Interface
            </button>

            {/* Show Data */}
            {showData && (
                <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase">Interface Status</h4>
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                        {typeof showData === "string" ? showData : JSON.stringify(showData, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
