import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DevelopmentStatus } from "@/components/dashboard/DevelopmentStatus";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { PageLayout } from "@/components/layout/PageLayout";

export default function Dashboard() {
  return (
    <PageLayout>
      <DashboardHeader />
      <DevelopmentStatus />
      <FeatureGrid />
    </PageLayout>
  );
}
