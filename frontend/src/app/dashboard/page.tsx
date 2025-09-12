import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DevelopmentStatus } from "@/components/dashboard/DevelopmentStatus";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { Navbar } from "@/components/ui/Navbar";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 font-sf-pro">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <DashboardHeader />
        <DevelopmentStatus />
        <FeatureGrid />
      </main>
    </div>
  );
}
