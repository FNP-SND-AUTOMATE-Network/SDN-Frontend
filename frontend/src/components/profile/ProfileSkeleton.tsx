"use client";

export default function ProfileSkeleton() {
    return (
        <div className="space-y-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-96"></div>
            </div>

            {/* Personal Information Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-40"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                        <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                        <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                        <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                        <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
                    </div>
                </div>
            </div>

            {/* Change Password Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                        <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                        <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
                    </div>

                    {/* Confirm Password */}
                    <div className="md:col-span-2 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                        <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
            </div>
        </div>
    );
}
