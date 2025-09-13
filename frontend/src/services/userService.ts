// User Service สำหรับจัดการ API calls เกี่ยวกับ user

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Types ตาม API schema จริง
export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    surname?: string;
    role: UserRole;
    email_verified: boolean;
    has_strong_mfa: boolean;
    created_at: string;
    updated_at: string;
    totp_enabled?: boolean;
    passkeys_count?: number;
    recovery_codes_count?: number;
}

export type UserRole = "VIEWER" | "ENGINEER" | "ADMIN" | "OWNER";

export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
}

export interface UserCreateRequest {
    email: string;
    name?: string;
    surname?: string;
    password: string;
    role?: UserRole;
}

export interface UserUpdateRequest {
    email?: string;
    name?: string;
    surname?: string;
    role?: UserRole;
    email_verified?: boolean;
    has_strong_mfa?: boolean;
}

export interface UserListResponse {
    users: UserProfile[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface UserCreateResponse {
    message: string;
    user: UserProfile;
    target_role?: string;
    otp_expires_at?: string;
    requires_otp_verification?: boolean;
}

export interface UserUpdateResponse {
    message: string;
    user: UserProfile;
}

export interface PasswordChangeResponse {
    message: string;
    user_id: string;
}

// API Error class
export class APIError extends Error {
    constructor(
        message: string,
        public status: number,
        public response?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

// Helper function สำหรับสร้าง headers
const createHeaders = (token: string) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
});

// Helper function สำหรับ handle response
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
            // If response is not JSON, use default error message
        }
        throw new APIError(errorMessage, response.status);
    }
    return response.json();
};

// User API functions
export const userService = {
    // ดึงข้อมูล profile ของ user ปัจจุบัน
    async getMyProfile(token: string): Promise<UserProfile> {
        const response = await fetch(`${API_BASE_URL}/users/profile/me`, {
            method: 'GET',
            headers: createHeaders(token),
        });
        return handleResponse(response);
    },

    // ดึงข้อมูล user ตาม ID
    async getUserById(token: string, userId: string): Promise<UserProfile> {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'GET',
            headers: createHeaders(token),
        });
        return handleResponse(response);
    },

    // อัพเดท profile ของ user (ใช้ user_id)
    async updateProfile(token: string, userId: string, profileData: UserUpdateRequest): Promise<UserUpdateResponse> {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: createHeaders(token),
            body: JSON.stringify(profileData),
        });
        return handleResponse(response);
    },

    // เปลี่ยนรหัสผ่าน (ใช้ user_id)
    async changePassword(token: string, userId: string, passwordData: ChangePasswordRequest): Promise<PasswordChangeResponse> {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/change-password`, {
            method: 'POST',
            headers: createHeaders(token),
            body: JSON.stringify(passwordData),
        });
        return handleResponse(response);
    },

    // ดึงข้อมูล user ทั้งหมด (สำหรับ admin)
    async getAllUsers(
        token: string, 
        page = 1, 
        pageSize = 10,
        filters?: {
            email?: string;
            name?: string;
            surname?: string;
            role?: UserRole;
            email_verified?: boolean;
            has_strong_mfa?: boolean;
            search?: string;
        }
    ): Promise<UserListResponse> {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
            ...(filters?.email && { email: filters.email }),
            ...(filters?.name && { name: filters.name }),
            ...(filters?.surname && { surname: filters.surname }),
            ...(filters?.role && { role: filters.role }),
            ...(filters?.email_verified !== undefined && { email_verified: filters.email_verified.toString() }),
            ...(filters?.has_strong_mfa !== undefined && { has_strong_mfa: filters.has_strong_mfa.toString() }),
            ...(filters?.search && { search: filters.search }),
        });

        const response = await fetch(`${API_BASE_URL}/users/?${params}`, {
            method: 'GET',
            headers: createHeaders(token),
        });
        return handleResponse(response);
    },

    // สร้าง user ใหม่ (สำหรับ admin)
    async createUser(token: string, userData: UserCreateRequest): Promise<UserCreateResponse> {
        const response = await fetch(`${API_BASE_URL}/users/`, {
            method: 'POST',
            headers: createHeaders(token),
            body: JSON.stringify(userData),
        });
        return handleResponse(response);
    },

    // ลบ user (สำหรับ admin)
    async deleteUser(token: string, userId: string): Promise<{ message: string; user_id: string }> {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: createHeaders(token),
        });
        return handleResponse(response);
    },

    // รีเซ็ตรหัสผ่าน user โดย admin
    async resetPasswordByAdmin(token: string, userId: string, newPassword: string): Promise<PasswordChangeResponse> {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
            method: 'POST',
            headers: createHeaders(token),
            body: JSON.stringify({
                user_id: userId,
                new_password: newPassword
            }),
        });
        return handleResponse(response);
    },

    // เปลี่ยน role ของ user (สำหรับ admin)
    async promoteUserRole(token: string, userId: string, targetRole: UserRole): Promise<UserUpdateResponse> {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/promote-role?target_role=${targetRole}`, {
            method: 'POST',
            headers: createHeaders(token),
        });
        return handleResponse(response);
    }
};