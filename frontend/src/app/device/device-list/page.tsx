"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";

export default function DevicePage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <h1 className="text-3xl font-bold text-gray-900 mb-8 font-sf-pro-display">
          Device
        </h1>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-600 font-sf-pro-text">
            หน้านี้กำลังพัฒนา
          </p>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
