// Helper functions for device detail components

/**
 * Get MUI-compatible status config
 */
export const getStatusConfig = (
  status: string,
): { color: "success" | "error" | "info" | "default"; label: string } => {
  switch (status) {
    case "ONLINE":
      return { color: "success", label: "Online" };
    case "OFFLINE":
      return { color: "error", label: "Offline" };
    case "MAINTENANCE":
      return { color: "info", label: "Maintenance" };
    default:
      return { color: "default", label: status || "Unknown" };
  }
};

/**
 * Get type color for inline text
 */
export const getTypeColor = (type: string): string => {
  switch (type) {
    case "SWITCH":
      return "#2563EB";
    case "ROUTER":
      return "#7C3AED";
    case "FIREWALL":
      return "#DC2626";
    case "ACCESS_POINT":
      return "#0891B2";
    default:
      return "#6B7280";
  }
};

/**
 * Format date string to localized display
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";

  const hasTimezone = /(?:[zZ]|[+\-]\d{2}(?::?\d{2})?)$/.test(dateString);
  const normalizedDateString = hasTimezone ? dateString : `${dateString}Z`;
  const date = new Date(normalizedDateString);
  if (Number.isNaN(date.getTime())) return "-";

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";

  const day = getPart("day");
  const month = getPart("month");
  const year = getPart("year");
  const hour = getPart("hour");
  const minute = getPart("minute");

  return `${day} ${month} ${year}, ${hour}.${minute}`;
};

// Keep backward compatibility for old references
export const getStatusBadge = getStatusConfig;
