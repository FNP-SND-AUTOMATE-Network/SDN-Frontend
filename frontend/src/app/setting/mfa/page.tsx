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

export default function MFAPage() {
  const { user, isAuthenticated, updateUser } = useAuth();
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
    if (isAuthenticated && user) {
      userService
        .getMyProfile()
        .then((profile) => {
          updateUser(profile);
        })
        .catch(console.error);
    }
  }, [isAuthenticated]);

  const handleEnableClick = async () => {
    if (!isAuthenticated) {
      setError("Please login again");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await authApi.setupMfa();
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
    if (!isAuthenticated) {
      setError("Please login again");
      return;
    }
    if (!secret) {
      setError(
        'Secret not found. Please click "Enable 2FA" again'
      );
      return;
    }
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter 6 digits OTP code");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await authApi.verifyMfa(otpCode, secret);
      setSuccessMessage("Enable 2FA successfully");
      setIsSetupMode(false);
      setOtpCode("");
      setSecret("");
      setQrCodeUrl("");

      // Refresh profile
      if (isAuthenticated) {
        const profile = await userService.getMyProfile();
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
    if (!isAuthenticated) {
      setError("Please login again");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await authApi.disableMfa(password);
      setSuccessMessage("Disable 2FA successfully");
      setIsDisableMode(false);
      setPassword("");

      // Refresh profile
      if (isAuthenticated) {
        const profile = await userService.getMyProfile();
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
                      Add extra security to your account with two-factor authentication using an authenticator app (e.g., Google Authenticator, Microsoft Authenticator).
                    </p>
                    <div className="mt-3">
                      {isMfaEnabled ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="mr-1"
                          />
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Disabled
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
                    {isMfaEnabled ? "Disable 2FA" : "Enable 2FA"}
                  </Button>
                )}
              </div>

              {/* Setup Mode UI */}
              {isSetupMode && (
                <div className="mt-6 border-t border-gray-200 pt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <h5 className="font-medium text-gray-900 mb-4">
                    Setup Two-Factor Authentication
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
                        <p className="font-medium mb-2">1. Scan QR Code</p>
                        <p>
                          Use the Authenticator app on your mobile device to scan this QR code
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="font-medium text-sm text-gray-900 mb-2">
                          2. Enter OTP Code
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                          Enter the 6-digit code from your Authenticator app to verify setup
                        </p>
                        <Input
                          label="6-digit OTP Code"
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
                          Verify and Enable
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          disabled={isLoading}
                        >
                          Cancel
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
                      Confirm Disable 2FA
                    </h5>
                    <p className="text-sm text-gray-600 mb-4">
                      For security reasons, please enter your password to confirm disabling Two-Factor Authentication
                    </p>

                    <div className="space-y-4">
                      <PasswordInput
                        id="disable-password"
                        label="Current Password"
                        value={password}
                        onChange={setPassword}
                        placeholder="Enter your password"
                      />

                      <div className="flex gap-3">
                        <Button
                          onClick={handleConfirmDisable}
                          variant="danger"
                          className="flex-1"
                          loading={isLoading}
                          disabled={!password}
                        >
                          Confirm Disable
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          disabled={isLoading}
                        >
                          Cancel
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
