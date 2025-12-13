// Helper functions for device detail components

export const getStatusBadge = (status: string) => {
  const base =
    "px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap font-sf-pro-text";
  switch (status) {
    case "ONLINE":
      return `${base} bg-green-100 text-green-800`;
    case "OFFLINE":
      return `${base} bg-red-100 text-red-800`;
    case "MAINTENANCE":
      return `${base} bg-yellow-100 text-yellow-800`;
    default:
      return `${base} bg-gray-100 text-gray-800`;
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
