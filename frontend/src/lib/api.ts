const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types based on API schema
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token?: string; // Optional now
  token_type?: string;
  user_id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
  // MFA fields (optional)
  requires_totp?: boolean;
  temp_token?: string;
}

export interface UserAuthMeResponse {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
  has_strong_mfa: boolean;
  totp_enabled: boolean;
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
    credentials: "include", // This enables sending HttpOnly cookies
    ...options,
  };
  try {
    let response = await fetch(url, config);

    // Auto-refresh token logic on 401 Unauthorized
    const isAuthRouteThatShouldNotRefresh = endpoint.includes("/auth/refresh") || endpoint.includes("/auth/login") || endpoint.includes("/auth/register");
    if (response.status === 401 && !isAuthRouteThatShouldNotRefresh) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        
        if (refreshResponse.ok) {
          // Retry original request if refresh succeeded
          response = await fetch(url, config);
        }
      } catch (err) {
        console.error("Token refresh auto-retry failed:", err);
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.detail || "เกิดข้อผิดพลาด",
        data,
      };
    }

    return data;
  } catch (error: any) {
    // ไม่ต้อง log error ถ้าเป็น 401 (expected for unauthenticated users)
    if (error?.status !== 401) {
      console.error("API Request Error:", error);
    }
    // Handle network errors or JSON parsing errors
    if (error.status) {
      throw error; // Re-throw API errors
    }

    throw {
      status: 0,
      message: "Unable to connect to server",
      data: error,
    };
  }
}

// Authentication API functions
export const authApi = {
  // Check auth user state (me)
  async me(): Promise<UserAuthMeResponse> {
    return apiRequest<UserAuthMeResponse>("/auth/me", {
      method: "GET",
    });
  },

  // Logout (clears cookies on backend)
  async logout(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  },

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
    const result = await apiRequest<VerifyOtpResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(otpData),
    });

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

  // MFA Setup (ใช้ Cookie แทน Bearer token)
  async setupMfa(): Promise<TotpSetupResponse> {
    return apiRequest<TotpSetupResponse>("/auth/mfa/setup", {
      method: "POST",
    });
  },

  // Verify MFA (ตอน setup ต้องส่ง secret)
  async verifyMfa(code: string, secret?: string): Promise<any> {
    const payload = {
      otp_code: code,
      ...(secret && { secret }),
    };

    return apiRequest<any>("/auth/mfa/verify", {
      method: "POST",
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
    password: string
  ): Promise<{ message: string }> {
    return apiRequest<{ message: string }>("/auth/mfa/disable", {
      method: "POST",
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

  return "Unknown error";
}
