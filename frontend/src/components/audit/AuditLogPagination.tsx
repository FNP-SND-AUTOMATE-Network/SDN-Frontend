"use client";

interface AuditLogPaginationProps {
  hasMore: boolean;
  loading: boolean;
  auditLogsLength: number;
  total: number;
  onLoadMore: () => void;
}

export default function AuditLogPagination({
  hasMore,
  loading,
  auditLogsLength,
  total,
  onLoadMore,
}: AuditLogPaginationProps) {
  return (
    <>
      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sf-pro-text"
          >
            {loading ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
          </button>
        </div>
      )}

      {/* Pagination Info */}
      <div className="text-center text-sm text-gray-600 font-sf-pro-text">
        แสดง {auditLogsLength} จาก {total} รายการ
      </div>
    </>
  );
}
