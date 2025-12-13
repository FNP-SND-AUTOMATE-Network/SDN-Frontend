"use client";

interface TagPaginationProps {
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function TagPagination({
  currentPage,
  pageSize,
  total,
  onPageChange,
}: TagPaginationProps) {
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-gray-600 font-sf-pro-text">
      <div>
        Showing{" "}
        {total === 0
          ? 0
          : (currentPage - 1) * pageSize + 1}{" "}
        to{" "}
        {Math.min(
          currentPage * pageSize,
          total
        )}{" "}
        of {total} results
      </div>
      <div className="flex gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`px-3 py-1 rounded border ${
            currentPage === 1
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          Previous
        </button>
        <button
          disabled={
            currentPage * pageSize >= total
          }
          onClick={() => onPageChange(currentPage + 1)}
          className={`px-3 py-1 rounded border ${
            currentPage * pageSize >= total
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
