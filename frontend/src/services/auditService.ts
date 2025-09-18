// Audit Service สำหรับจัดการ API calls เกี่ยวกับ audit logs

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Types ตาม API schema จริง (อัพเดทตาม API ปัจจุบัน)
export type AuditAction =
    | "USER_REGISTER"
    | "USER_LOGIN"
    | "USER_LOGOUT"
    | "USER_CREATE"
    | "USER_UPDATE"
    | "USER_DELETE"
    | "ENABLE_TOTP"
    | "DISABLE_TOTP"
    | "REGISTER_PASSKEY"
    | "REMOVE_PASSKEY"
    | "PROMOTE_ROLE"
    | "DEMOTE_ROLE"
    | "PASSWORD_CHANGE"
    | "PASSWORD_RESET";

export interface AuditLogResponse {
    id: string;
    actor_user_id?: string;
    target_user_id?: string;
    action: AuditAction;
    details?: Record<string, any>;
    created_at: string;
}

export interface AuditLogListResponse {
    items: AuditLogResponse[];
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
}

export interface AuditLogFilters {
    actor_user_id?: string;
    target_user_id?: string;
    action?: AuditAction;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
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

// Audit API functions
export const auditService = {
    // ดึงรายการ audit logs
    async getAuditLogs(
        token: string,
        filters: AuditLogFilters = {}
    ): Promise<AuditLogListResponse> {
        const params = new URLSearchParams();

        // Add filters to params
        if (filters.actor_user_id) params.append('actor_user_id', filters.actor_user_id);
        if (filters.target_user_id) params.append('target_user_id', filters.target_user_id);
        if (filters.action) params.append('action', filters.action);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());

        const queryString = params.toString();
        const url = `${API_BASE_URL}/audit/logs${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: createHeaders(token),
        });

        return handleResponse(response);
    },

    // ดึง audit log ตาม ID
    async getAuditLogById(token: string, auditId: string): Promise<AuditLogResponse> {
        const response = await fetch(`${API_BASE_URL}/audit/logs/${auditId}`, {
            method: 'GET',
            headers: createHeaders(token),
        });
        return handleResponse(response);
    },

    // ดึง audit stats
    async getAuditStats(token: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/audit/stats`, {
            method: 'GET',
            headers: createHeaders(token),
        });
        return handleResponse(response);
    }
};
