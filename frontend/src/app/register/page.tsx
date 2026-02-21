"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { authApi, getErrorMessage } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicRoute } from "@/components/auth/AuthGuard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

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
      newErrors.name = "Please enter your name";
    }

    if (!formData.surname.trim()) {
      newErrors.surname = "Please enter your surname";
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const response = await authApi.register({
        email: formData.email,
        name: formData.name,
        surname: formData.surname,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });
      
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
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-primary-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary-600">
            Register
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            or{" "}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
            >
              Login
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 text-black">
            <div className="grid grid-cols-2 gap-4 ">
              <Input
                label="Name"
                name="name"
                type="text"
                autoComplete="given-name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
              />
              <Input
                label="Surname"
                name="surname"
                type="text"
                autoComplete="family-name"
                placeholder="Enter your surname"
                value={formData.surname}
                onChange={handleInputChange}
                error={errors.surname}
              />
            </div>
            
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
            
            <PasswordInput
              id="confirmPassword"
              label="Confirm Password"
              placeholder="Enter your password again"
              value={formData.confirmPassword}
              onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
              error={errors.confirmPassword}
              required
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
              Accept{" "}
              <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors duration-200">
                Terms of Use
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors duration-200">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* API Error Display */}
          {apiError && (
            <div className="rounded-md bg-danger-50 p-4 border border-danger-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-danger-400" viewBox="0 0 20 20" fill="currentColor">
                    <FontAwesomeIcon icon={faExclamationCircle} />
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
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </div>
        </form>
      </div>
      </div>
    </PublicRoute>
  );
}
