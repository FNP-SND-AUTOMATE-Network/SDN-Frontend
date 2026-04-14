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
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// Keep backward compatibility for old references
export const getStatusBadge = getStatusConfig;
