"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi, getErrorMessage } from "@/lib/api";

export default function DebugOtpPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (!email || !otp) {
      setError("Please enter email and OTP");
      return;
    }

    setIsLoading(true);
    setError("");
    setResponse(null);

    try {
      console.log("Debug OTP: Verifying with:", { email, otp });
      
      const result = await authApi.verifyOtp({
        email,
        otp_code: otp,
      });

      console.log("Debug OTP: Raw response:", result);
      setResponse(result);
      
    } catch (err: any) {
      console.error("Debug OTP: Error:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 py-12 px-4 sm:px-6 lg:px-8 font-sf-pro">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-8 font-sf-pro-display">
            🔍 Debug OTP Response
          </h1>

          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />

            <Input
              label="OTP Code"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP 6 digits"
              maxLength={6}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              onClick={handleVerifyOtp}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Verifying..." : "Test OTP"}
            </Button>
          </div>

          {response && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">📝 API Response:</h2>
              <div className="bg-gray-100 rounded-lg p-4 overflow-auto">
                <pre className="text-xs text-gray-800">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>

              <div className="mt-4 space-y-2">
                <h3 className="font-medium text-gray-900">🧪 Data Validation:</h3>
                <div className="text-sm space-y-1">
                  <p className={response.user_id ? "text-green-600" : "text-red-600"}>
                    ✓ user_id: {response.user_id ? "✅ Present" : "❌ Missing"}
                  </p>
                  <p className={response.email ? "text-green-600" : "text-red-600"}>
                    ✓ email: {response.email ? "✅ Present" : "❌ Missing"}
                  </p>
                  <p className={response.email_verified ? "text-green-600" : "text-red-600"}>
                    ✓ email_verified: {response.email_verified ? "✅ True" : "❌ False"}
                  </p>
                  <p className={response.name ? "text-green-600" : "text-red-600"}>
                    ✓ name: {response.name ? "✅ Present" : "❌ Missing (Expected for OTP)"}
                  </p>
                  <p className={response.surname ? "text-green-600" : "text-red-600"}>
                    ✓ surname: {response.surname ? "✅ Present" : "❌ Missing (Expected for OTP)"}
                  </p>
                  <p className={response.role ? "text-green-600" : "text-red-600"}>
                    ✓ role: {response.role ? "✅ Present" : "❌ Missing (Expected for OTP)"}
                  </p>
                  <p className={response.access_token ? "text-green-600" : "text-red-600"}>
                    ✓ access_token: {response.access_token ? "✅ Present" : "❌ Missing (Expected for OTP)"}
                  </p>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">💡 OTP Flow is:</h4>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>1. Register → Get OTP</p>
                    <p>2. Verify OTP → Confirm email (not login)</p>
                    <p>3. Login → Get access_token and user data</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <a
              href="/otp"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              ← Back to OTP page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
