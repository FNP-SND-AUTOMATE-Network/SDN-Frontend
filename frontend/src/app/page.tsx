import { faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 font-sf-pro">
      {/* Simple Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <div className="text-2xl font-bold text-primary-600 font-sf-pro-display">
                  SDN Logo
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <button className="px-4 py-2 text-sm border-2 border-primary-500 bg-transparent text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                  เข้าสู่ระบบ
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-2 text-sm bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-colors">
                  สมัครสมาชิก
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
              <FontAwesomeIcon icon={faScrewdriverWrench} />  
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
