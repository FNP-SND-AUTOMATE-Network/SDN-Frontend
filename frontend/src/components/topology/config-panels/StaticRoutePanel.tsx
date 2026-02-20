"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faSpinner, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { ConfigPanelProps } from "./types";

export function StaticRoutePanel({ showData, isPushing, handlePush }: ConfigPanelProps) {
    const [staticRoutes, setStaticRoutes] = useState<
        { prefix: string; next_hop: string; mask: string }[]
    >([{ prefix: "", next_hop: "", mask: "" }]);

    return (
        <div className="space-y-4">
            {staticRoutes.map((route, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-800">
                            Static Route {idx + 1}
                        </h4>
                        <div className="flex gap-2">
                            {staticRoutes.length > 1 && (
                                <button
                                    onClick={() =>
                                        setStaticRoutes((prev) => prev.filter((_, i) => i !== idx))
                                    }
                                    className="text-red-500 hover:text-red-700 text-xs"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <input
                            type="text"
                            value={route.prefix}
                            onChange={(e) => {
                                const updated = [...staticRoutes];
                                updated[idx].prefix = e.target.value;
                                setStaticRoutes(updated);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Network (e.g. 10.0.0.0/24)"
                        />
                        <input
                            type="text"
                            value={route.next_hop}
                            onChange={(e) => {
                                const updated = [...staticRoutes];
                                updated[idx].next_hop = e.target.value;
                                setStaticRoutes(updated);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Next Hop"
                        />
                        <input
                            type="text"
                            value={route.mask}
                            onChange={(e) => {
                                const updated = [...staticRoutes];
                                updated[idx].mask = e.target.value;
                                setStaticRoutes(updated);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Mask (optional)"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() =>
                                handlePush("routing.static.delete", {
                                    prefix: route.prefix,
                                    next_hop: route.next_hop,
                                })
                            }
                            disabled={isPushing || !route.prefix || !route.next_hop}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Delete Route
                        </button>
                        <button
                            onClick={() =>
                                handlePush("routing.static.add", {
                                    prefix: route.prefix,
                                    next_hop: route.next_hop,
                                    ...(route.mask && { mask: route.mask }),
                                })
                            }
                            disabled={isPushing || !route.prefix || !route.next_hop}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <FontAwesomeIcon icon={isPushing ? faSpinner : faPlusCircle} className={`w-3.5 h-3.5 ${isPushing ? "animate-spin" : ""}`} />
                            Push
                        </button>
                    </div>
                </div>
            ))}

            <button
                onClick={() =>
                    setStaticRoutes((prev) => [...prev, { prefix: "", next_hop: "", mask: "" }])
                }
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 text-sm rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
                + Add Static Route
            </button>

            {/* Show Data */}
            {showData && (
                <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase">IP Route Table</h4>
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                        {typeof showData === "string" ? showData : JSON.stringify(showData, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
