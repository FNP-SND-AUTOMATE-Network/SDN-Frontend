"use client";

export default function DeviceSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="mb-6">
        {/* Page Title */}
        <div className="mb-4">
          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
        </div>

        {/* Status Cards Skeleton */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 flex-1 min-w-[140px]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters Row Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 9 }).map((_, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left"
                  >
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: 9 }).map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="mt-4 flex items-center justify-between">
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
