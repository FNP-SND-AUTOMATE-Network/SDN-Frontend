import { Navbar } from "@/components/ui/Navbar";
import { Sidebar } from "@/components/ui/Sidebar";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 font-sf-pro ${className}`}>
      {/* Fixed Navigation Header */}
      <Navbar />

      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area - Scrollable */}
      <main className="ml-64 pt-16 min-h-screen overflow-y-auto">
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
