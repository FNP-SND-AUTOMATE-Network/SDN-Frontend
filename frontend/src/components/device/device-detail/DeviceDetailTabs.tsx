"use client";

import { Tabs, Tab } from "@mui/material";

type TabKey = "overview" | "interfaces" | "configuration" | "backup";

interface DeviceDetailTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "interfaces", label: "Interfaces" },
  { key: "configuration", label: "Configuration" },
  { key: "backup", label: "Backup" },
];

export default function DeviceDetailTabs({
  activeTab,
  onTabChange,
}: DeviceDetailTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onChange={(_, value) => onTabChange(value as TabKey)}
      sx={{ px: { xs: 2, sm: 3 }, borderBottom: 1, borderColor: "divider" }}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.key}
          value={tab.key}
          label={tab.label}
          sx={{ textTransform: "none", fontWeight: 500, fontSize: 14 }}
        />
      ))}
    </Tabs>
  );
}
