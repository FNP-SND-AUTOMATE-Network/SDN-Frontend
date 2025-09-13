"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DevelopmentStatus } from "@/components/dashboard/DevelopmentStatus";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <DashboardHeader />
        <DevelopmentStatus />
        <FeatureGrid />
      </PageLayout>
    </ProtectedRoute>
  );
}
