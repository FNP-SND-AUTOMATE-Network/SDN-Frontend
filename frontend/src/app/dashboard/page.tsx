import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DevelopmentStatus } from "@/components/dashboard/DevelopmentStatus";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";

export const Dashboard = () => {
  return (
    <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <DashboardHeader />
      <DevelopmentStatus />
      <FeatureGrid />
    </main>
  )
};
