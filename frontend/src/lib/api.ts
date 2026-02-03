const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types based on API schema
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
  // MFA fields (optional)
  requires_totp?: boolean;
  temp_token?: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  surname: string;
  password: string;
  confirm_password: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
  expires_at: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp_code: string;
}

// Actual API response structure
export interface VerifyOtpResponse {
  message: string;
  user_id: string;
  email: string;
  email_verified: boolean;
  // Optional fields that might be in different endpoints
  access_token?: string;
  token_type?: string;
  name?: string;
  surname?: string;
  role?: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  message: string;
  expires_at: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  email: string;
  expires_at: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp_code: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ApiError {
  detail:
    | string
    | Array<{
        loc: string[];
        msg: string;
        type: string;
      }>;
}

// API Helper function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  console.log("API Request:", {
    url,
    method: config.method || "GET",
    headers: config.headers,
    body: config.body,
  });

  try {
    const response = await fetch(url, config);

    console.log("API Response Status:", response.status);
    console.log("API Response Headers:", response.headers);

    const data = await response.json();
    console.log("API Response Data:", data);

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.detail || "เกิดข้อผิดพลาด",
        data,
      };
    }

    return data;
  } catch (error: any) {
    console.error("API Request Error:", error);

    // Handle network errors or JSON parsing errors
    if (error.status) {
      throw error; // Re-throw API errors
    }

    throw {
      status: 0,
      message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
      data: error,
    };
  }
}

// Authentication API functions
export const authApi = {
  // Login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  // Register
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return apiRequest<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Verify OTP
  async verifyOtp(otpData: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    console.log("🔍 OTP Verification Request:", {
      endpoint: "/auth/verify-otp",
      data: { email: otpData.email, otp_code: "***" },
    });

    const result = await apiRequest<VerifyOtpResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(otpData),
    });

    console.log("🔍 OTP Verification Response:", result);
    console.log("🔍 OTP Response Type:", typeof result);
    console.log("🔍 OTP Response Keys:", Object.keys(result || {}));

    return result;
  },

  // Resend OTP
  async resendOtp(emailData: ResendOtpRequest): Promise<ResendOtpResponse> {
    return apiRequest<ResendOtpResponse>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(emailData),
    });
  },

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return apiRequest<{ status: string }>("/health");
  },

  // MFA Setup (ต้องใช้ access token)
  async setupMfa(token: string): Promise<TotpSetupResponse> {
    return apiRequest<TotpSetupResponse>("/auth/mfa/setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Verify MFA (ตอน setup ต้องส่ง secret, ถ้า backend อนุญาตอาจใช้ตอน login ได้ด้วย)
  async verifyMfa(token: string, code: string, secret?: string): Promise<any> {
    const payload = {
      otp_code: code,
      ...(secret && { secret }), // Only include secret if provided
    };

    return apiRequest<any>("/auth/mfa/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  // Verify MFA for login
  async verifyMfaLogin(
    tempToken: string,
    otpCode: string
  ): Promise<LoginResponse> {
    return apiRequest<LoginResponse>("/auth/mfa-verify-totp-login", {
      method: "POST",
      body: JSON.stringify({
        temp_token: tempToken,
        otp_code: otpCode,
      }),
    });
  },

  // Disable MFA
  async disableMfa(
    token: string,
    password: string
  ): Promise<{ message: string }> {
    return apiRequest<{ message: string }>("/auth/mfa/disable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    });
  },

  // Forgot Password
  async forgotPassword(
    emailData: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    return apiRequest<ForgotPasswordResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(emailData),
    });
  },

  // Reset Password
  async resetPassword(
    resetData: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    return apiRequest<ResetPasswordResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(resetData),
    });
  },
};

export interface TotpSetupResponse {
  secret: string;
  provisioning_uri: string;
}

export interface TotpVerifyRequest {
  secret: string;
  otp_code: string;
}

export interface TotpDisableRequest {
  password: string;
}

// Error helper
export function getErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error;
  }

  if (error?.message) {
    if (typeof error.message === "string") {
      return error.message;
    }
    if (Array.isArray(error.message)) {
      return error.message
        .map((err: any) => err?.msg ?? JSON.stringify(err))
        .join(", ");
    }
    if (typeof error.message === "object") {
      return JSON.stringify(error.message);
    }
  }

  if (error?.detail) {
    if (typeof error.detail === "string") {
      return error.detail;
    }
    if (Array.isArray(error.detail)) {
      return error.detail
        .map((err: any) => err?.msg ?? JSON.stringify(err))
        .join(", ");
    }
    if (typeof error.detail === "object") {
      return JSON.stringify(error.detail);
    }
  }

  return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
}
