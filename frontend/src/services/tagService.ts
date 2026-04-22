// Tag Service สำหรับจัดการ API calls เกี่ยวกับ Tags

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Types ตาม API schema
export type TypeTag = "tag" | "group" | "other";

export interface Tag {
  tag_id: string;
  tag_name: string;
  description?: string | null;
  type: TypeTag;
  color: string;
  device_count?: number | null;
  os_count?: number | null;
  template_count?: number | null;
  total_usage?: number | null;
  created_at: string;
  updated_at: string;
}

export interface TagListResponse {
  total: number;
  page: number;
  page_size: number;
  tags: Tag[];
}

export interface TagCreateRequest {
  tag_name: string;
  description?: string | null;
  type?: TypeTag;
  color?: string;
}

export interface TagUpdateRequest {
  tag_name?: string | null;
  description?: string | null;
  type?: TypeTag | null;
  color?: string | null;
}

export interface TagCreateResponse {
  message: string;
  tag: Tag;
}

export interface TagUpdateResponse {
  message: string;
  tag: Tag;
}

export interface TagDeleteResponse {
  message: string;
  tag_id: string;
}

export interface TagUsageResponse {
  tag_id: string;
  tag_name: string;
  device_networks: any[];
  operating_systems: any[];
  configuration_templates: any[];
  total_usage: number;
}

// API Error class
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

// Helper function สำหรับสร้าง headers (ไม่ต้องมี Bearer token — ใช้ Cookie แทน)
const createHeaders = () => ({
  "Content-Type": "application/json",
});

/**
 * Read a named cookie from document.cookie.
 */
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const prefix = `${name}=`;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : undefined;
}

// Headers for mutating requests (POST/PUT/PATCH/DELETE) — includes CSRF token
const createMutatingHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const csrfToken = getCookie("csrf_token");
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }
  return headers;
};

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

// Tag API functions — ใช้ credentials: "include" เพื่อส่ง HttpOnly Cookie อัตโนมัติ
export const tagService = {
  // ดึงข้อมูล Tags ทั้งหมด
  async getTags(
    page = 1,
    pageSize = 10,
    filters?: {
      search?: string;
      include_usage?: boolean;
    }
  ): Promise<TagListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.include_usage !== undefined && {
        include_usage: filters.include_usage.toString(),
      }),
    });

    const response = await fetch(`${API_BASE_URL}/tags/?${params}`, {
      method: "GET",
      headers: createHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  // ดึงข้อมูล Tag ตาม ID
  async getTagById(
    tagId: string,
    includeUsage = false
  ): Promise<Tag> {
    const params = new URLSearchParams({
      include_usage: includeUsage.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/tags/${tagId}?${params}`,
      {
        method: "GET",
        headers: createHeaders(),
        credentials: "include",
      }
    );
    return handleResponse(response);
  },

  // สร้าง Tag ใหม่
  async createTag(
    tagData: TagCreateRequest
  ): Promise<TagCreateResponse> {
    const response = await fetch(`${API_BASE_URL}/tags/`, {
      method: "POST",
      headers: createMutatingHeaders(),
      credentials: "include",
      body: JSON.stringify(tagData),
    });
    return handleResponse(response);
  },

  // อัปเดต Tag
  async updateTag(
    tagId: string,
    tagData: TagUpdateRequest
  ): Promise<TagUpdateResponse> {
    const response = await fetch(`${API_BASE_URL}/tags/${tagId}`, {
      method: "PUT",
      headers: createMutatingHeaders(),
      credentials: "include",
      body: JSON.stringify(tagData),
    });
    return handleResponse(response);
  },

  // ลบ Tag
  async deleteTag(
    tagId: string,
    force = false
  ): Promise<TagDeleteResponse> {
    const params = new URLSearchParams({
      force: force.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/tags/${tagId}?${params}`, {
      method: "DELETE",
      headers: createMutatingHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },

  // ดึงข้อมูลการใช้งาน Tag
  async getTagUsage(tagId: string): Promise<TagUsageResponse> {
    const response = await fetch(`${API_BASE_URL}/tags/${tagId}/usage`, {
      method: "GET",
      headers: createHeaders(),
      credentials: "include",
    });
    return handleResponse(response);
  },
};
