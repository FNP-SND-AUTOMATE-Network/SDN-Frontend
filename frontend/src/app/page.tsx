import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/ui/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 font-sf-pro">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-100 rounded-full mb-6">
            <svg
              className="w-12 h-12 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-sf-pro-display">
            ยินดีต้อนรับ
          </h1>
          <p className="text-xl text-gray-600 mb-8 font-sf-pro-text">
            ระบบจัดการข้อมูลเครือข่าย
          </p>

          
        </div>
      </main>
    </div>
  );
}
