"use client";

import { PublicRoute } from "@/components/auth/AuthGuard";
import { AuthPageLayout } from "@/components/auth/password-reset/AuthPageLayout";
import { ForgotPasswordForm } from "@/components/auth/password-reset/ForgotPasswordForm";

export default function ForgotPasswordPage() {
    return (
        <PublicRoute>
            <AuthPageLayout
                title="Forgot Password"
                description="Enter your email to receive an OTP code to reset your password"
            >
                <ForgotPasswordForm />
            </AuthPageLayout>
        </PublicRoute>
    );
}
