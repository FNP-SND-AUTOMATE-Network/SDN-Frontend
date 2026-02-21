"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { authApi, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/userService";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleXmark, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { PublicRoute } from "@/components/auth/AuthGuard";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // Login Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // MFA State
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [tempAuthData, setTempAuthData] = useState<{
    user: any;
    token: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Check for verified email from OTP
  useEffect(() => {
    const verifiedEmail = localStorage.getItem("verified_email");
    const registrationSuccess = localStorage.getItem("registration_success");
    const isVerified = searchParams.get("verified") === "true";
    const isRegistrationComplete =
      searchParams.get("registration") === "success";

    if (verifiedEmail && isVerified && registrationSuccess) {
      setFormData((prev) => ({ ...prev, email: verifiedEmail }));

      if (isRegistrationComplete) {
        setSuccessMessage(
          "🎉 Register Success! Please login with your password"
        );
      } else {
        setSuccessMessage("✅ Verify OTP Success! Please login");
      }

      // Cleanup
      localStorage.removeItem("verified_email");
      localStorage.removeItem("registration_success");
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    // Clear API error when user starts typing
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = "Please enter your email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      });
      // Check if MFA is required from login response
      if (response.requires_totp && response.temp_token) {
        // MFA Required - แสดงหน้ากรอก OTP
        setTempAuthData({
          user: {
            id: response.user_id,
            email: response.email,
            name: response.name,
            surname: response.surname,
            role: response.role,
          },
          token: response.temp_token // เก็บ temp_token ไม่ใช่ access_token
        });
        setShowMfaInput(true);
        setIsLoading(false);
        return;
      }

      // No MFA required - Login directly
      login(
        {
          id: response.user_id,
          email: response.email,
          name: response.name,
          surname: response.surname,
          role: response.role,
        },
        response.access_token
      );

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      setApiError(getErrorMessage(error));
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode || mfaCode.length !== 6) {
      setApiError("Please enter your 6 digit OTP code");
      return;
    }

    if (!tempAuthData?.token) {
      setApiError("No temporary login data found. Please try logging in again.");
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      // ส่ง temp_token และ otp_code ไปยัง /auth/mfa-verify-totp-login
      const response = await authApi.verifyMfaLogin(tempAuthData.token, mfaCode);

      console.log("MFA Verify Response:", response);

      // ใช้ access_token ที่ได้จาก response (ไม่ใช่ temp_token)
      if (response && response.access_token) {
        login(tempAuthData.user, response.access_token);
        router.push("/dashboard");
      } else {
        setApiError("Failed to verify identity. Please try again.");
      }
    } catch (error: any) {
      console.error("MFA Verify error:", error);
      setApiError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-primary-100">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-primary-600">
              {showMfaInput ? "Verify Identity (2FA)" : "Login"}
            </h2>
            {!showMfaInput && (
              <p className="mt-2 text-center text-sm text-gray-600">
                or{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
                >
                  Register
                </Link>
              </p>
            )}
          </div>

          {/* API Error Display */}
          {apiError && (
            <div className="rounded-md bg-danger-50 p-4 border border-danger-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faCircleXmark}
                    className="h-5 w-5 text-danger-400"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-danger-800 font-sf-pro-text">
                    {apiError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && !showMfaInput && (
            <div className="rounded-md bg-success-50 p-4 border border-success-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="h-5 w-5 text-success-400"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-success-800 font-sf-pro-text">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {showMfaInput ? (
            // MFA Form
            <form className="mt-8 space-y-6" onSubmit={handleMfaSubmit}>
              <div className="space-y-4 text-black text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-primary-50 rounded-full">
                    <FontAwesomeIcon icon={faShieldHalved} className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Please enter your 6 digit OTP code from your Authenticator app
                </p>
                <Input
                  label=""
                  name="mfaCode"
                  type="text"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center tracking-widest text-2xl font-mono"
                  maxLength={6}
                  autoFocus
                />
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading || mfaCode.length !== 6}
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => {
                    setShowMfaInput(false);
                    setMfaCode("");
                    setApiError("");
                  }}
                  disabled={isLoading}
                >
                  Back
                </Button>
              </div>
            </form>
          ) : (
            // Login Form
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4 text-black">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                />
                <PasswordInput
                  id="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
                  error={errors.password}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PublicRoute>
  );
}
