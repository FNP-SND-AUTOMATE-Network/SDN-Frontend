// Helper functions for device detail components

export const getStatusBadge = (status: string) => {
  const base =
    "px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap font-sf-pro-text";
  switch (status) {
    case "ONLINE":
      return { dot: "bg-green-500", bg: "bg-green-100" };
    case "OFFLINE":
      return { dot: "bg-red-500", bg: "bg-red-100" };
    case "MAINTENANCE":
      return { dot: "bg-blue-500", bg: "bg-blue-100" };
    default:
      return { dot: "bg-gray-400", bg: "bg-gray-100" };
  }
};

export const getTypeBadge = (type: string) => {
  const base =
    "px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap font-sf-pro-text";
  switch (type) {
    case "SWITCH":
      return `${base} bg-blue-100 text-blue-800`;
    case "ROUTER":
      return `${base} bg-purple-100 text-purple-800`;
    case "FIREWALL":
      return `${base} bg-red-100 text-red-800`;
    case "ACCESS_POINT":
      return `${base} bg-indigo-100 text-indigo-800`;
    default:
      return `${base} bg-gray-100 text-gray-800`;
  }
};

export const formatDate = (dateString: string) => {
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