"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { authApi, getErrorMessage } from "@/lib/api";
import { MessageDisplay } from "./MessageDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        // Get email from localStorage or URL params
        const storedEmail = localStorage.getItem("reset_password_email");
        const emailParam = searchParams.get("email");

        if (emailParam) {
            setEmail(emailParam);
        } else if (storedEmail) {
            setEmail(storedEmail);
        }
    }, [searchParams]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!email) {
            newErrors.email = "Please enter your email";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Invalid email format";
        }

        if (!otpCode) {
            newErrors.otpCode = "Please enter OTP code";
        } else if (otpCode.length !== 6) {
            newErrors.otpCode = "OTP code must be 6 digits";
        }

        if (!newPassword) {
            newErrors.newPassword = "Please enter new password";
        } else if (newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm new password";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError("");
        setSuccessMessage("");

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await authApi.resetPassword({
                email,
                otp_code: otpCode,
                new_password: newPassword,
            });

            setSuccessMessage(response.message || "Reset password successfully");

            // Clear stored email
            localStorage.removeItem("reset_password_email");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/login?reset=success");
            }, 2000);
        } catch (err: any) {
            console.error("Reset password error:", err);
            setApiError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
        if (apiError) {
            setApiError("");
        }
    };

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 text-black">
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        handleInputChange("email", e.target.value);
                    }}
                    error={errors.email}
                    disabled={isLoading || !!successMessage}
                />

                <Input
                    label="OTP Code (6 digits)"
                    name="otpCode"
                    type="text"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtpCode(value);
                        handleInputChange("otpCode", value);
                    }}
                    error={errors.otpCode}
                    disabled={isLoading || !!successMessage}
                    maxLength={6}
                    className="text-center tracking-widest text-lg font-mono"
                />

                <PasswordInput
                    id="new-password"
                    label="New Password"
                    placeholder="Enter new password (at least 8 characters)"
                    value={newPassword}
                    onChange={(value) => {
                        setNewPassword(value);
                        handleInputChange("newPassword", value);
                    }}
                    error={errors.newPassword}
                    required
                />

                <PasswordInput
                    id="confirm-password"
                    label="Confirm New Password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(value) => {
                        setConfirmPassword(value);
                        handleInputChange("confirmPassword", value);
                    }}
                    error={errors.confirmPassword}
                    required
                />
            </div>

            {/* Success Message */}
            {successMessage && (
                <MessageDisplay
                    type="success"
                    message={successMessage}
                    additionalInfo="Redirecting to login..."
                />
            )}

            {/* Error Message */}
            {apiError && !successMessage && (
                <MessageDisplay type="error" message={apiError} />
            )}

            <div className="space-y-3">
                <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={isLoading}
                    disabled={isLoading || !!successMessage}
                >
                    {isLoading ? "Resetting password..." : "Reset Password"}
                </Button>

                <Link href="/forgot-password">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isLoading || !!successMessage}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Send new OTP
                    </Button>
                </Link>

                <Link href="/login">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isLoading}
                    >
                        Return to Login
                    </Button>
                </Link>
            </div>
        </form>
    );
}
