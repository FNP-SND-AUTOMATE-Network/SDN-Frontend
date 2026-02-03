"use client";

import { PublicRoute } from "@/components/auth/AuthGuard";
import { AuthPageLayout } from "@/components/auth/password-reset/AuthPageLayout";
import { ForgotPasswordForm } from "@/components/auth/password-reset/ForgotPasswordForm";

export default function ForgotPasswordPage() {
    return (
        <PublicRoute>
            <AuthPageLayout
                title="ลืมรหัสผ่าน"
                description="กรอกอีเมลของคุณเพื่อรับรหัส OTP สำหรับรีเซ็ตรหัสผ่าน"
            >
                <ForgotPasswordForm />
            </AuthPageLayout>
        </PublicRoute>
    );
}
