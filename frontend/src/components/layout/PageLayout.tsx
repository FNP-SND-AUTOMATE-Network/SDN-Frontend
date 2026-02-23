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

      {/* Main Content Area - Responsive positioning */}
      <main className="pt-16 lg:ml-64 min-h-screen overflow-y-auto">
        <div className="w-full">
          <div className="py-6 px-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
