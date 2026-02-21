"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { OTPInput } from "@/components/ui/OTPInput";
import { authApi, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function OTPPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState("");

  // Get email from localStorage on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("registration_email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email found, redirect to register
      router.push("/register");
    }
  }, []); // Empty dependency array since we only want this to run once

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOTPComplete = (otpValue: string) => {
    setOtp(otpValue);
    setError("");
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    if (!email) {
      setError("No email found. Please register again.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await authApi.verifyOtp({
        email: email,
        otp_code: otp,
      });

      // OTP verification successful - email is now verified
      if (response.email_verified) {
        // Clear registration email
        localStorage.removeItem("registration_email");

        // Store verified email and success status for login page
        localStorage.setItem("verified_email", response.email);
        localStorage.setItem("registration_success", "true");

        // Show success message briefly before redirect
        setOtp("");
        setError("");
        setSuccess("OTP verification successful! Redirecting to login... ");

        // Redirect to login page with success parameters
        setTimeout(() => {
          router.push("/login?verified=true&registration=success");
        }, 1500);

        // Show success state in OTP page
        return;
      } else {
        setError("Email verification failed");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !email) return;

    setIsResending(true);
    setError("");

    try {
      const response = await authApi.resendOtp({
        email: email,
      });

      setTimeLeft(600); // Reset timer
      setCanResend(false);
      setOtp("");
      setError("");
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      setError(getErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-primary-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-primary-600">
            Verify OTP
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter the 6-digit OTP sent to your email
          </p>
          {email && (
            <p className="mt-1 text-sm font-medium text-primary-600 font-sf-pro-text">
              {email}
            </p>
          )}
        </div>

        <div className="mt-8 space-y-6 text-black">
          <div className="space-y-4">
            <OTPInput
              length={6}
              onComplete={handleOTPComplete}
              error={error}
              disabled={isLoading}
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {timeLeft > 0 ? (
                <>
                  OTP will expire in{" "}
                  <span className="font-semibold text-red-600">
                    {formatTime(timeLeft)}
                  </span>
                </>
              ) : (
                <span className="text-red-600">OTP has expired</span>
              )}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <FontAwesomeIcon 
                  icon={faCircleCheck} 
                  className="h-5 w-5 text-green-400 mr-2"
                />
                <p className="text-green-600 text-sm font-medium font-sf-pro-text">
                  {success}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleVerify}
              variant="success"
              className="w-full"
              loading={isLoading}
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            <Button
              variant="outline"
              onClick={handleResendOTP}
              className="w-full"
              disabled={!canResend || isResending}
              loading={isResending}
            >
              {isResending
                ? "Sending..."
                : canResend
                ? "Send OTP again"
                : `Send again in ${formatTime(timeLeft)}`}
            </Button>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push("/register")}
              className="text-sm text-primary-600 hover:text-primary-500 transition-colors duration-200"
            >
              Back to registration page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
