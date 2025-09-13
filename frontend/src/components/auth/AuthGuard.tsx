"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = "/" }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // ถ้ายังกำลังโหลด ไม่ต้องทำอะไร
    if (isLoading) return;

    // ถ้าไม่มี user login ให้ redirect ไป Landing page
    if (!isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // แสดง loading state ขณะตรวจสอบ authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-600 font-sf-pro-text">
            กำลังตรวจสอบการเข้าสู่ระบบ...
          </p>
        </div>
      </div>
    );
  }

  // ถ้าไม่มี user login ไม่แสดงเนื้อหา (จะ redirect แล้ว)
  if (!isAuthenticated) {
    return null;
  }

  // ถ้ามี user login แสดงเนื้อหาปกติ
  return <>{children}</>;
}

// Component สำหรับหน้าที่ต้อง login เท่านั้น
export function ProtectedRoute({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}

// Component สำหรับหน้าที่ต้อง redirect ถ้า login แล้ว (เช่น login, register)
export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // ถ้ายังกำลังโหลด ไม่ต้องทำอะไร
    if (isLoading) return;

    // ถ้ามี user login แล้ว ให้ redirect ไป Dashboard
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // แสดง loading state ขณะตรวจสอบ authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-600 font-sf-pro-text">
            กำลังตรวจสอบการเข้าสู่ระบบ...
          </p>
        </div>
      </div>
    );
  }

  // ถ้ามี user login แล้ว ไม่แสดงเนื้อหา (จะ redirect แล้ว)
  if (isAuthenticated) {
    return null;
  }

  // ถ้าไม่มี user login แสดงเนื้อหาปกติ
  return <>{children}</>;
}
