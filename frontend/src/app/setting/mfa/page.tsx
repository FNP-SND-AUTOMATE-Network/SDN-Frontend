"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { authApi, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faMobileScreen,
  faKey,
  faCheckCircle,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/userService";

export function MFAContent() {
  const { user, token, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Setup State
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");

  // Disable State
  const [isDisableMode, setIsDisableMode] = useState(false);
  const [password, setPassword] = useState<string>("");

  // Refresh user profile to get latest MFA status
  useEffect(() => {
    if (token && user) {
      userService
        .getMyProfile(token)
        .then((profile) => {
          updateUser(profile);
        })
        .catch(console.error);
    }
  }, [token]);

  const handleEnableClick = async () => {
    if (!token) {
      setError("ไม่พบ token สำหรับผู้ใช้ปัจจุบัน กรุณาเข้าสู่ระบบใหม่");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await authApi.setupMfa(token);
      const normalizedSecret = response.secret
        .replace(/\s+/g, "")
        .toUpperCase();

      // Backend ส่ง provisioning_uri มาแล้ว ใช้โดยตรง, ถ้าไม่มีก็สร้างใหม่
      let url = response.provisioning_uri || "";

      if (!url && normalizedSecret) {
        const appName = "FNP-SDN";
        const accountName = user?.email || "user";
        const label = encodeURIComponent(`${appName}:${accountName}`);
        const issuer = encodeURIComponent(appName);

        url = `otpauth://totp/${label}?secret=${normalizedSecret}&issuer=${issuer}&digits=6&period=30&algorithm=SHA1`;
      }

      setSecret(normalizedSecret);
      setQrCodeUrl(url);
      setIsSetupMode(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySetup = async () => {
    if (!token) {
      setError("ไม่พบ token สำหรับผู้ใช้ปัจจุบัน กรุณาเข้าสู่ระบบใหม่");
      return;
    }
    if (!secret) {
      setError(
        'ไม่พบ Secret สำหรับการตั้งค่า กรุณากด "เปิดใช้งาน 2FA" ใหม่อีกครั้ง'
      );
      return;
    }
    if (!otpCode || otpCode.length !== 6) {
      setError("กรุณากรอกรหัส 6 หลัก");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await authApi.verifyMfa(token, otpCode, secret);
      setSuccessMessage("เปิดใช้งาน 2FA เรียบร้อยแล้ว");
      setIsSetupMode(false);
      setOtpCode("");
      setSecret("");
      setQrCodeUrl("");

      // Refresh profile
      if (token) {
        const profile = await userService.getMyProfile(token);
        updateUser(profile);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableClick = () => {
    setIsDisableMode(true);
    setError("");
    setPassword("");
  };

  const handleConfirmDisable = async () => {
    if (!token) {
      setError("ไม่พบ token สำหรับผู้ใช้ปัจจุบัน กรุณาเข้าสู่ระบบใหม่");
      return;
    }
    if (!password) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await authApi.disableMfa(token, password);
      setSuccessMessage("ปิดการใช้งาน 2FA เรียบร้อยแล้ว");
      setIsDisableMode(false);
      setPassword("");

      // Refresh profile
      if (token) {
        const profile = await userService.getMyProfile(token);
        updateUser(profile);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsSetupMode(false);
    setIsDisableMode(false);
    setError("");
    setOtpCode("");
    setPassword("");
    setSecret("");
    setQrCodeUrl("");
  };

  const isMfaEnabled = user?.has_strong_mfa || user?.totp_enabled;

  return (
    <div className="space-y-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon
                icon={faShieldHalved}
                className="text-primary-600"
              />
              Security Settings
            </h3>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} />
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                {error}
              </div>
            )}

            {/* 2FA Section */}
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <FontAwesomeIcon
                    icon={faMobileScreen}
                    className="h-6 w-6 text-primary-600"
                  />
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">
                      Two-Factor Authentication (TOTP)
                    </h4>
                    <p className="text-sm text-gray-500 mt-1 max-w-md">
                      เพิ่มความปลอดภัยให้กับบัญชีของคุณด้วยการยืนยันตัวตนผ่านแอปพลิเคชัน
                      Authenticator (เช่น Google Authenticator, Microsoft
                      Authenticator)
                    </p>
                    <div className="mt-3">
                      {isMfaEnabled ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="mr-1"
                          />
                          เปิดใช้งานแล้ว
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          ยังไม่เปิดใช้งาน
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!isSetupMode && !isDisableMode && (
                  <Button
                    onClick={
                      isMfaEnabled ? handleDisableClick : handleEnableClick
                    }
                    variant={isMfaEnabled ? "danger" : "primary"}
                    loading={isLoading}
                  >
                    {isMfaEnabled ? "ปิดการใช้งาน" : "เปิดใช้งาน 2FA"}
                  </Button>
                )}
              </div>

              {/* Setup Mode UI */}
              {isSetupMode && (
                <div className="mt-6 border-t border-gray-200 pt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <h5 className="font-medium text-gray-900 mb-4">
                    ตั้งค่า Two-Factor Authentication
                  </h5>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200 inline-flex items-center justify-center">
                        {qrCodeUrl && (
                          <div
                            style={{
                              height: "auto",
                              margin: "0 auto",
                              maxWidth: 180,
                              width: "100%",
                            }}
                          >
                            <QRCode
                              size={256}
                              style={{
                                height: "auto",
                                maxWidth: "100%",
                                width: "100%",
                              }}
                              value={qrCodeUrl}
                              viewBox={`0 0 256 256`}
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-2">1. สแกน QR Code</p>
                        <p>
                          ใช้แอป Authenticator ในมือถือของคุณสแกน QR Code นี้
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="font-medium text-sm text-gray-900 mb-2">
                          2. กรอกรหัสยืนยัน
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                          กรอกรหัส 6 หลักที่ได้จากแอป Authenticator
                          เพื่อยืนยันการตั้งค่า
                        </p>
                        <Input
                          label="รหัส OTP 6 หลัก"
                          value={otpCode}
                          onChange={(e) =>
                            setOtpCode(
                              e.target.value.replace(/\D/g, "").slice(0, 6)
                            )
                          }
                          placeholder="000000"
                          className="text-center tracking-widest text-lg font-mono"
                          maxLength={6}
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={handleVerifySetup}
                          variant="primary"
                          className="flex-1"
                          loading={isLoading}
                          disabled={otpCode.length !== 6}
                        >
                          ยืนยันและเปิดใช้งาน
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          disabled={isLoading}
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Disable Mode UI */}
              {isDisableMode && (
                <div className="mt-6 border-t border-gray-200 pt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="max-w-md">
                    <h5 className="font-medium text-gray-900 mb-4 text-red-600">
                      ยืนยันการปิดใช้งาน 2FA
                    </h5>
                    <p className="text-sm text-gray-600 mb-4">
                      เพื่อความปลอดภัย
                      กรุณากรอกรหัสผ่านของคุณเพื่อยืนยันการปิดใช้งาน Two-Factor
                      Authentication
                    </p>

                    <div className="space-y-4">
                      <PasswordInput
                        id="disable-password"
                        label="รหัสผ่านปัจจุบัน"
                        value={password}
                        onChange={setPassword}
                        placeholder="กรอกรหัสผ่านของคุณ"
                      />

                      <div className="flex gap-3">
                        <Button
                          onClick={handleConfirmDisable}
                          variant="danger"
                          className="flex-1"
                          loading={isLoading}
                          disabled={!password}
                        >
                          ยืนยันปิดใช้งาน
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          disabled={isLoading}
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
