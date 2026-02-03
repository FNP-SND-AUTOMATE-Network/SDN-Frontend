"use client";

import React from "react";

interface TemplateCardSkeletonProps {
    count?: number;
}

function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
            {/* Header */}
            <div className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="w-2.5 h-2.5 bg-gray-200 rounded-full mt-1.5 flex-shrink-0" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="flex items-center gap-2">
                    <div className="h-3 bg-gray-200 rounded w-8" />
                    <div className="h-5 bg-gray-200 rounded-full w-16" />
                </div>
            </div>

            {/* Config Preview Area */}
            <div className="mx-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[100px]">
                <div className="space-y-1.5">
                    <div className="h-2 bg-gray-300 rounded-sm w-[90%]" />
                    <div className="h-2 bg-gray-300 rounded-sm w-[75%]" />
                    <div className="h-2 bg-gray-300 rounded-sm w-[85%]" />
                    <div className="h-2 bg-gray-300 rounded-sm w-[60%]" />
                    <div className="h-2 bg-gray-300 rounded-sm w-[80%]" />
                    <div className="h-2 bg-gray-300 rounded-sm w-[70%]" />
                </div>
            </div>
        </div>
    );
}

export default function TemplateCardSkeleton({ count = 8 }: TemplateCardSkeletonProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );
}
