import { Navbar } from "@/components/ui/Navbar";
import { Sidebar } from "@/components/ui/Sidebar";

export default function DeviceTagGroupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 font-sf-pro">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Layout with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 font-sf-pro-display">
              Device - Tag/Group
            </h1>
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-600 font-sf-pro-text">
                หน้านี้กำลังพัฒนา
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
