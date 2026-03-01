"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authApi, getErrorMessage } from "@/lib/api";
import { MessageDisplay } from "./MessageDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export function ForgotPasswordForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [expiresAt, setExpiresAt] = useState<string>("");

    const validateEmail = () => {
        if (!email) {
            setError("Please enter your email");
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Invalid email format");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!validateEmail()) return;

        setIsLoading(true);

        try {
            const response = await authApi.forgotPassword({ email });

            setSuccessMessage(response.message);
            setExpiresAt(response.expires_at);

            // Store email for reset password page
            localStorage.setItem("reset_password_email", email);

            // Redirect to reset password page after 2 seconds
            setTimeout(() => {
                router.push("/reset-password");
            }, 2000);
        } catch (err: any) {
            console.error("Forgot password error:", err);
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
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
                        setError("");
                    }}
                    error={error}
                    disabled={isLoading || !!successMessage}
                />
            </div>

            {/* Success Message */}
            {successMessage && (
                <MessageDisplay
                    type="success"
                    message={successMessage}
                    additionalInfo={
                        expiresAt
                            ? `OTP will expire at: ${new Date(expiresAt).toLocaleString('th-TH')}\nRedirecting to reset password page...`
                            : "Redirecting to reset password page..."
                    }
                />
            )}

            {/* Error Message */}
            {error && !successMessage && (
                <MessageDisplay type="error" message={error} />
            )}

            <div className="space-y-3">
                <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={isLoading}
                    disabled={isLoading || !!successMessage}
                >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                </Button>

                <Link href="/login">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isLoading}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Return to Login
                    </Button>
                </Link>
            </div>
        </form>
    );
}
