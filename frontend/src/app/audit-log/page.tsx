"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedRoute } from "@/components/auth/AuthGuard";

export default function AuditLogPage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Audit Log</h1>
          
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}