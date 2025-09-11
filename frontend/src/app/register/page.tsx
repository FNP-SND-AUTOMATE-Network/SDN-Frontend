"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authApi, getErrorMessage } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

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

    if (!formData.name.trim()) {
      newErrors.name = "กรุณากรอกชื่อ";
    }

    if (!formData.surname.trim()) {
      newErrors.surname = "กรุณากรอกนามสกุล";
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
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
      console.log("Starting registration with data:", {
        email: formData.email,
        name: formData.name,
        surname: formData.surname,
        password: "***hidden***",
        confirm_password: "***hidden***"
      });

      const response = await authApi.register({
        email: formData.email,
        name: formData.name,
        surname: formData.surname,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });

      // Registration successful
      console.log("Registration successful:", response);
      
      // Store email for OTP verification
      localStorage.setItem('registration_email', formData.email);
      
      // Redirect to OTP page
      router.push("/otp");
      
    } catch (error: any) {
      console.error("Register error:", error);
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
            สมัครสมาชิก
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            หรือ{" "}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 text-black">
            <div className="grid grid-cols-2 gap-4 ">
              <Input
                label="ชื่อ"
                name="name"
                type="text"
                autoComplete="given-name"
                placeholder="กรอกชื่อของคุณ"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
              />
              <Input
                label="นามสกุล"
                name="surname"
                type="text"
                autoComplete="family-name"
                placeholder="กรอกนามสกุลของคุณ"
                value={formData.surname}
                onChange={handleInputChange}
                error={errors.surname}
              />
            </div>
            
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
            
            <Input
              label="รหัสผ่าน"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="กรอกรหัสผ่านของคุณ"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
            />
            
            <Input
              label="ยืนยันรหัสผ่าน"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
            />
          </div>

          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
              ยอมรับ{" "}
              <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors duration-200">
                ข้อกำหนดการใช้งาน
              </a>{" "}
              และ{" "}
              <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors duration-200">
                นโยบายความเป็นส่วนตัว
              </a>
            </label>
          </div>

          {/* API Error Display */}
          {apiError && (
            <div className="rounded-md bg-danger-50 p-4 border border-danger-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-danger-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-danger-800 font-sf-pro-text">{apiError}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              variant="success"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
