"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ZabbixDashboardView } from "@/components/dashboard/zabbix/ZabbixDashboardView";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <DashboardHeader />
        <ZabbixDashboardView />
      </PageLayout>
    </ProtectedRoute>
  );
}
