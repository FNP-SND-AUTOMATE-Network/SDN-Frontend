"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faExpand } from "@fortawesome/free-solid-svg-icons";

interface TopologyCanvasProps {
    selectedSiteId?: string | null;
}

export default function TopologyCanvas({ selectedSiteId }: TopologyCanvasProps) {
    return (
        <div className="relative h-full bg-gray-50 flex items-center justify-center overflow-hidden">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <button
                    className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center"
                    title="Zoom In"
                >
                    <FontAwesomeIcon icon={faPlus} className="w-4 h-4 text-gray-600" />
                </button>
                <button
                    className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center"
                    title="Zoom Out"
                >
                    <FontAwesomeIcon icon={faMinus} className="w-4 h-4 text-gray-600" />
                </button>
                <button
                    className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center"
                    title="Fit to Screen"
                >
                    <FontAwesomeIcon icon={faExpand} className="w-4 h-4 text-gray-600" />
                </button>
            </div>

            {/* Placeholder Content */}
            <div className="text-center">
                <div className="mb-4">
                    <svg
                        className="w-24 h-24 mx-auto text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Topology Diagram
                </h3>
                <p className="text-sm text-gray-500 max-w-md">
                    {selectedSiteId
                        ? "Topology diagram will be displayed here"
                        : "Select a site from the sidebar to view its topology"}
                </p>
            </div>

            {/* Grid Background (optional) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                <defs>
                    <pattern
                        id="grid"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 20 0 L 0 0 0 20"
                            fill="none"
                            stroke="gray"
                            strokeWidth="0.5"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>
    );
}
