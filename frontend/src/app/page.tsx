"use client";

import {
  faNetworkWired,
  faShieldAlt,
  faChartLine,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Navbar } from "@/components/ui/Navbar";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { PublicRoute } from "@/components/auth/AuthGuard";

export default function HomePage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-100 font-sf-pro">
      <Navbar />

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2361B4E8' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Hero Content */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mb-8 shadow-lg animate-pulse">
              <FontAwesomeIcon
                icon={faNetworkWired}
                className="w-16 h-16 text-white"
              />
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-sf-pro-display leading-tight">
              ยินดีต้อนรับสู่
              <span className="block text-transparent bg-clip-text mt-4 bg-gradient-to-r from-primary-600 to-secondary-600">
                CMNS-SDN
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 font-sf-pro-text max-w-3xl mx-auto leading-relaxed">
              ระบบจัดการข้อมูลเครือข่ายที่ทันสมัยและปลอดภัย
              <br />
              <span className="text-primary-600 font-semibold">
                Control and Management Network System
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/login">
                <Button
                  variant="primary"
                  className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  เข้าสู่ระบบ
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="ml-2 w-4 h-4"
                  />
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="px-8 py-4 text-lg font-semibold border-2 hover:bg-primary-50 transition-all duration-300"
                >
                  สมัครสมาชิก
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-primary-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-6">
                <FontAwesomeIcon
                  icon={faNetworkWired}
                  className="w-8 h-8 text-blue-600"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-sf-pro-display">
                Network Management
              </h3>
              <p className="text-gray-600 font-sf-pro-text leading-relaxed">
                จัดการเครือข่ายแบบครบวงจร
                ตั้งแต่การตั้งค่าไปจนถึงการตรวจสอบประสิทธิภาพ
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-primary-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-6">
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className="w-8 h-8 text-green-600"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-sf-pro-display">
                Security & Policies
              </h3>
              <p className="text-gray-600 font-sf-pro-text leading-relaxed">
                ระบบรักษาความปลอดภัยขั้นสูงและการจัดการนโยบายเครือข่าย
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-primary-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-xl mb-6">
                <FontAwesomeIcon
                  icon={faChartLine}
                  className="w-8 h-8 text-orange-600"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-sf-pro-display">
                Analytics & Monitoring
              </h3>
              <p className="text-gray-600 font-sf-pro-text leading-relaxed">
                ติดตามและวิเคราะห์ข้อมูลเครือข่ายแบบเรียลไทม์
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2 font-sf-pro-display">
                  N/A%
                </div>
                <div className="text-primary-100 font-sf-pro-text">Uptime</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2 font-sf-pro-display">
                  24/7
                </div>
                <div className="text-primary-100 font-sf-pro-text">
                  Monitoring
                </div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2 font-sf-pro-display">
                  N/A
                </div>
                <div className="text-primary-100 font-sf-pro-text">Devices</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2 font-sf-pro-display">
                  N/A
                </div>
                <div className="text-primary-100 font-sf-pro-text">
                  Networks
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </PublicRoute>
  );
}
