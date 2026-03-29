"use client";

import { PublicRoute } from "@/components/auth/AuthGuard";
import { AuthPageLayout } from "@/components/auth/password-reset/AuthPageLayout";
import { ResetPasswordForm } from "@/components/auth/password-reset/ResetPasswordForm";

export default function ResetPasswordPage() {
    return (
        <PublicRoute>
            <AuthPageLayout
                title="Reset Password"
                description="Enter your OTP code and new password"
            >
                <ResetPasswordForm />
            </AuthPageLayout>
        </PublicRoute>
    );
}
