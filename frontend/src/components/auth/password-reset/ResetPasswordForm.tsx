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
            newErrors.email = "กรุณากรอกอีเมล";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
        }

        if (!otpCode) {
            newErrors.otpCode = "กรุณากรอกรหัส OTP";
        } else if (otpCode.length !== 6) {
            newErrors.otpCode = "รหัส OTP ต้องมี 6 หลัก";
        }

        if (!newPassword) {
            newErrors.newPassword = "กรุณากรอกรหัสผ่านใหม่";
        } else if (newPassword.length < 8) {
            newErrors.newPassword = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
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

            setSuccessMessage(response.message || "รีเซ็ตรหัสผ่านสำเร็จ");

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
                    label="อีเมล"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="กรอกอีเมลของคุณ"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        handleInputChange("email", e.target.value);
                    }}
                    error={errors.email}
                    disabled={isLoading || !!successMessage}
                />

                <Input
                    label="รหัส OTP (6 หลัก)"
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
                    label="รหัสผ่านใหม่"
                    placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
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
                    label="ยืนยันรหัสผ่านใหม่"
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
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
                    additionalInfo="กำลังนำคุณไปยังหน้าเข้าสู่ระบบ..."
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
                    {isLoading ? "กำลังรีเซ็ตรหัสผ่าน..." : "รีเซ็ตรหัสผ่าน"}
                </Button>

                <Link href="/forgot-password">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isLoading || !!successMessage}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        ส่งรหัส OTP ใหม่
                    </Button>
                </Link>

                <Link href="/login">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isLoading}
                    >
                        กลับไปหน้าเข้าสู่ระบบ
                    </Button>
                </Link>
            </div>
        </form>
    );
}
