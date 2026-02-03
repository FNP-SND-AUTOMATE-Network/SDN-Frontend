"use client";

import React from "react";

interface IPAMSkeletonProps {
    showStats?: boolean;
    sectionCount?: number;
}

function StatsCardSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div>
                    <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                    <div className="h-6 bg-gray-200 rounded w-12" />
                </div>
            </div>
        </div>
    );
}

function SectionRowSkeleton({ level = 0 }: { level?: number }) {
    const paddingLeft = level * 24 + 16;

    return (
        <div
            className="flex items-center gap-3 py-3 px-4 border-b border-gray-100 animate-pulse"
            style={{ paddingLeft: `${paddingLeft}px` }}
        >
            {/* Chevron placeholder */}
            <div className="w-4 h-4 bg-gray-200 rounded" />
            {/* Folder icon placeholder */}
            <div className="w-5 h-5 bg-gray-200 rounded" />
            {/* Section name */}
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-48" />
            </div>
            {/* Description */}
            <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
    );
}

export default function IPAMSkeleton({ showStats = true, sectionCount = 6 }: IPAMSkeletonProps) {
    return (
        <div className="p-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-6 animate-pulse">
                <div>
                    <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-96" />
                </div>
                <div className="h-10 bg-gray-200 rounded w-32" />
            </div>

            {/* Stats Cards Skeleton */}
            {showStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                </div>
            )}

            {/* Sections List Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-24" />
                </div>

                <div>
                    {/* Mixed levels to simulate tree structure */}
                    {Array.from({ length: sectionCount }).map((_, index) => {
                        // Alternate levels to simulate tree
                        const level = index === 0 ? 0 :
                            index === 1 || index === 2 ? 1 :
                                index === 3 ? 0 :
                                    index === 4 ? 1 : 0;
                        return <SectionRowSkeleton key={index} level={level} />;
                    })}
                </div>
            </div>
        </div>
    );
}

// Export individual components for flexibility
export { StatsCardSkeleton, SectionRowSkeleton };
