"use client";

type TabKey = "detail" | "interfaces";

interface DeviceDetailTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export default function DeviceDetailTabs({
  activeTab,
  onTabChange,
}: DeviceDetailTabsProps) {
  return (
    <div className="border-b border-gray-200 px-4 sm:px-6">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        <button
          type="button"
          onClick={() => onTabChange("detail")}
          className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium font-sf-pro-text ${
            activeTab === "detail"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Device detail
        </button>
        <button
          type="button"
          onClick={() => onTabChange("interfaces")}
          className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium font-sf-pro-text ${
            activeTab === "interfaces"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Interfaces
        </button>
      </nav>
    </div>
  );
}
