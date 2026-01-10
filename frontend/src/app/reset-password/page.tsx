"use client";

import { PublicRoute } from "@/components/auth/AuthGuard";
import { AuthPageLayout } from "@/components/auth/password-reset/AuthPageLayout";
import { ResetPasswordForm } from "@/components/auth/password-reset/ResetPasswordForm";

export default function ResetPasswordPage() {
    return (
        <PublicRoute>
            <AuthPageLayout
                title="รีเซ็ตรหัสผ่าน"
                description="กรอกรหัส OTP และรหัสผ่านใหม่ของคุณ"
            >
                <ResetPasswordForm />
            </AuthPageLayout>
        </PublicRoute>
    );
}
