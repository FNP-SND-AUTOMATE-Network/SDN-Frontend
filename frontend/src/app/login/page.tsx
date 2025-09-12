"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { authApi, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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
          "🎉 สมัครสมาชิกสำเร็จ! ยืนยันอีเมล OTP เรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านที่สมัครไว้"
        );
      } else {
        setSuccessMessage("✅ ยืนยัน OTP เรียบร้อยแล้ว กรุณาเข้าสู่ระบบ");
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
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!formData.password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
    } else if (formData.password.length < 6) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
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

      // Login successful
      console.log("Login successful:", response);

      // Use auth hook to store user data
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

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      setApiError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-primary-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary-600">
            เข้าสู่ระบบ
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            หรือ{" "}
            <Link
              href="/register"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
            >
              สมัครสมาชิกใหม่
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 text-black">
            <Input
              label="อีเมล"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="กรอกอีเมลของคุณ"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
            />
            <PasswordInput
              id="password"
              label="รหัสผ่าน"
              placeholder="กรอกรหัสผ่านของคุณ"
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
                จดจำการเข้าสู่ระบบ
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
              >
                ลืมรหัสผ่าน?
              </a>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
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

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
