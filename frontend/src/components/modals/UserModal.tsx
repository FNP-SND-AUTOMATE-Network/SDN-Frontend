"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUserPlus,
  faUserEdit,
} from "@fortawesome/free-solid-svg-icons";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import {
  userService,
  UserProfile,
  UserCreateRequest,
  UserUpdateRequest,
  UserRole,
} from "@/services/userService";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  user?: UserProfile;
  onSuccess: () => void;
  token: string;
}

export function UserModal({
  isOpen,
  onClose,
  mode,
  user,
  onSuccess,
  token,
}: UserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "VIEWER" as UserRole,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && user) {
        setFormData({
          name: user.name || "",
          surname: user.surname || "",
          email: user.email || "",
          password: "",
          confirmPassword: "",
          role: user.role,
        });
      } else {
        setFormData({
          name: "",
          surname: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "VIEWER",
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, user]);

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "กรุณากรอกชื่อ";
    }

    if (!formData.surname.trim()) {
      newErrors.surname = "กรุณากรอกนามสกุล";
    }

    if (!formData.email.trim()) {
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (mode === "add") {
      if (!formData.password) {
        newErrors.password = "กรุณากรอกรหัสผ่าน";
      } else if (formData.password.length < 8) {
        newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "add") {
        const createData: UserCreateRequest = {
          email: formData.email,
          name: formData.name,
          surname: formData.surname,
          password: formData.password,
          role: formData.role,
        };

        await userService.createUser(token, createData);
        showSnackbar("เพิ่มผู้ใช้สำเร็จ!", "success");
      } else if (mode === "edit" && user) {
        const updateData: UserUpdateRequest = {
          email: formData.email,
          name: formData.name,
          surname: formData.surname,
          role: formData.role,
        };

        await userService.updateProfile(token, user.id, updateData);
        showSnackbar("อัพเดทข้อมูลผู้ใช้สำเร็จ!", "success");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error:", error);
      showSnackbar(
        error.message ||
          `เกิดข้อผิดพลาดในการ${mode === "add" ? "เพิ่ม" : "แก้ไข"}ผู้ใช้`,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg">
                <FontAwesomeIcon
                  icon={mode === "add" ? faUserPlus : faUserEdit}
                  className="w-5 h-5 text-primary-600"
                />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 font-sf-pro-display">
                {mode === "add" ? "เพิ่มผู้ใช้ใหม่" : "แก้ไขข้อมูลผู้ใช้"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-sf-pro-text">
                ชื่อ *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="กรอกชื่อ"
                error={errors.name || ""}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 font-sf-pro-text">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Surname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-sf-pro-text">
                นามสกุล *
              </label>
              <Input
                type="text"
                value={formData.surname}
                onChange={(e) => handleInputChange("surname", e.target.value)}
                placeholder="กรอกนามสกุล"
                error={errors.surname || ""}
                disabled={isLoading}
              />
              {errors.surname && (
                <p className="mt-1 text-sm text-red-600 font-sf-pro-text">
                  {errors.surname}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-sf-pro-text">
                อีเมล *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="กรอกอีเมล"
                error={errors.email || ""}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 font-sf-pro-text">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password (only for add mode) */}
            {mode === "add" && (
              <>
                <PasswordInput
                  id="password"
                  label="รหัสผ่าน"
                  value={formData.password}
                  onChange={(value) => handleInputChange("password", value)}
                  placeholder="กรอกรหัสผ่าน (ขั้นต่ำ 8 ตัวอักษร)"
                  error={errors.password || ""}
                  required={true}
                />

                <PasswordInput
                  id="confirmPassword"
                  label="ยืนยันรหัสผ่าน"
                  value={formData.confirmPassword}
                  onChange={(value) =>
                    handleInputChange("confirmPassword", value)
                  }
                  placeholder="ยืนยันรหัสผ่าน"
                  error={errors.confirmPassword || ""}
                  required={true}
                />
              </>
            )}

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-sf-pro-text">
                บทบาท
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-sf-pro-text"
                disabled={
                  isLoading ||
                  mode === "add" ||
                  (mode === "edit" && user && !user.email_verified)
                }
              >
                <option value="VIEWER">Viewer</option>
                {mode === "edit" && user && user.email_verified && (
                  <>
                    <option value="ENGINEER">Engineer</option>
                    <option value="ADMIN">Admin</option>
                  </>
                )}
              </select>
              {mode === "add" && (
                <p className="mt-1 text-sm text-gray-500 font-sf-pro-text">
                  ผู้ใช้ใหม่จะได้รับบทบาท VIEWER เท่านั้น
                </p>
              )}
              {mode === "edit" && user && !user.email_verified && (
                <p className="mt-1 text-sm text-orange-600 font-sf-pro-text">
                  ⚠️ ไม่สามารถเปลี่ยนบทบาทได้
                  เนื่องจากอีเมลยังไม่ได้รับการยืนยัน
                </p>
              )}
              {mode === "edit" && user && user.email_verified && (
                <p className="mt-1 text-sm text-green-600 font-sf-pro-text">
                  สามารถเปลี่ยนบทบาทได้ เนื่องจากอีเมลได้รับการยืนยันแล้ว
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading
                  ? mode === "add"
                    ? "กำลังเพิ่ม..."
                    : "กำลังแก้ไข..."
                  : mode === "add"
                  ? "เพิ่มผู้ใช้"
                  : "บันทึกการเปลี่ยนแปลง"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Snackbar */}
      <MuiSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
