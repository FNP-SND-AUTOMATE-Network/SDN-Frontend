// Operating System Service สำหรับจัดการ API calls เกี่ยวกับ Operating Systems

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// OsType ตาม API schema
export type OsType =
  | "CISCO_IOS"
  | "CISCO_NXOS"
  | "CISCO_ASA"
  | "CISCO_Nexus"
  | "CISCO_IOS_XR"
  | "CISCO_IOS_XE"
  | "HUAWEI_VRP"
  | "OTHER";

// ข้อมูล Tag แบบย่อที่แนบมากับ OS (จาก OperatingSystemResponse.tags)
export interface RelatedTagInfo {
  tag_id: string;
  tag_name: string;
  color: string;
  type: string;
}

// OperatingSystemResponse ตาม schema หลัก (ตัด field ที่เป็น optional object/usage มาให้)
export interface OperatingSystem {
  id: string;

  os_type: OsType;
  description?: string | null;
  created_at: string;
  updated_at: string;
  tags?: RelatedTagInfo[];
  device_count?: number | null;
  backup_count?: number | null;
  total_usage?: number | null;
}

export interface OperatingSystemListResponse {
  total: number;
  page: number;
  page_size: number;
  operating_systems: OperatingSystem[];
}

export interface OperatingSystemCreateRequest {
  os_type?: OsType;
  description?: string | null;
}

export interface OperatingSystemUpdateRequest {
  os_type?: OsType | null;
  description?: string | null;
}

export interface OperatingSystemCreateResponse {
  message: string;
  operating_system: OperatingSystem;
}

export interface OperatingSystemUpdateResponse {
  message: string;
  operating_system: OperatingSystem;
}

export interface OperatingSystemDeleteResponse {
  message: string;
}

// OS File types
export interface OSFile {
  id: string;
  os_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type?: string | null;
  version?: string | null;
  checksum?: string | null;
  uploaded_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OSFileUploadResponse {
  message: string;
  file: OSFile;
}

export interface OSFileListResponse {
  total: number;
  files: OSFile[];
}

// API Error class (reuse pattern from siteService)
export class APIError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public response?: unknown,
  ) {
    super(message);
    this.name = "APIError";
  }
}

// Helper function สำหรับสร้าง headers
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

// Headers for file uploads (no Content-Type) — includes CSRF token
const createUploadHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};
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

// Operating System API functions
export const operatingSystemService = {
  // ดึงข้อมูล Operating Systems ทั้งหมด
  async getOperatingSystems(
    
    page = 1,
    pageSize = 20,
    filters?: {
      os_type?: string;
      search?: string;
      tag_id?: string;
      include_usage?: boolean;
    },
  ): Promise<OperatingSystemListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(filters?.os_type && { os_type: filters.os_type }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.tag_id && { tag_id: filters.tag_id }),
      ...(filters?.include_usage !== undefined && {
        include_usage: String(filters.include_usage),
      }),
    });

    const response = await fetch(
      `${API_BASE_URL}/operating-systems/?${params}`,
      {
        method: "GET",
        headers: createHeaders(), credentials: 'include',
      },
    );
    return handleResponse(response);
  },

  // ดึงข้อมูล Operating System ตาม ID
  async getOperatingSystemById(
    
    osId: string,
    includeUsage = false,
  ): Promise<OperatingSystem> {
    const params = new URLSearchParams({
      ...(includeUsage ? { include_usage: "true" } : {}),
    });

    const url = params.toString()
      ? `${API_BASE_URL}/operating-systems/${osId}?${params}`
      : `${API_BASE_URL}/operating-systems/${osId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(), credentials: 'include',
    });
    return handleResponse(response);
  },

  // สร้าง Operating System ใหม่
  async createOperatingSystem(
    
    osData: OperatingSystemCreateRequest,
  ): Promise<OperatingSystemCreateResponse> {
    const response = await fetch(`${API_BASE_URL}/operating-systems/`, {
      method: "POST",
      headers: createMutatingHeaders(), credentials: 'include',
      body: JSON.stringify(osData),
    });
    return handleResponse(response);
  },

  // อัปเดต Operating System
  async updateOperatingSystem(
    
    osId: string,
    osData: OperatingSystemUpdateRequest,
  ): Promise<OperatingSystemUpdateResponse> {
    const response = await fetch(`${API_BASE_URL}/operating-systems/${osId}`, {
      method: "PUT",
      headers: createMutatingHeaders(), credentials: 'include',
      body: JSON.stringify(osData),
    });
    return handleResponse(response);
  },

  // ลบ Operating System
  async deleteOperatingSystem(
    
    osId: string,
    force = false,
  ): Promise<OperatingSystemDeleteResponse> {
    const params = new URLSearchParams({
      ...(force ? { force: "true" } : {}),
    });

    const url = params.toString()
      ? `${API_BASE_URL}/operating-systems/${osId}?${params}`
      : `${API_BASE_URL}/operating-systems/${osId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: createMutatingHeaders(), credentials: 'include',
    });
    return handleResponse(response);
  },

  // อัปโหลดไฟล์สำหรับ Operating System
  async uploadOsFile(
    
    osId: string,
    file: File,
    version?: string | null,
  ): Promise<OSFileUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    if (version) {
      formData.append("version", version);
    }

    const response = await fetch(
      `${API_BASE_URL}/operating-systems/${osId}/upload`,
      {
        method: "POST",
        headers: createUploadHeaders() as HeadersInit,
        credentials: 'include',
        body: formData,
      },
    );
    return handleResponse(response);
  },

  // ดึงรายการไฟล์ของ Operating System
  async getOsFiles(osId: string): Promise<OSFileListResponse> {
    const response = await fetch(
      `${API_BASE_URL}/operating-systems/${osId}/files`,
      {
        method: "GET",
        headers: createHeaders(), credentials: 'include',
      },
    );
    return handleResponse(response);
  },

  // ลบไฟล์ของ Operating System
  async deleteOsFile(
    
    osId: string,
    fileId: string,
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/operating-systems/${osId}/files/${fileId}`,
      {
        method: "DELETE",
        headers: createMutatingHeaders(), credentials: 'include',
      },
    );
    return handleResponse(response);
  },

  // ดาวน์โหลดไฟล์ OS (ส่ง blob กลับไปให้ frontend จัดการ save)
  async downloadOsFile(
    
    osId: string,
    fileId: string,
  ): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/operating-systems/${osId}/files/${fileId}/download`,
      {
        method: "GET",
        headers: {
          
        },
      },
    );

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // ignore JSON parse error
      }
      throw new APIError(errorMessage, response.status);
    }

    return response.blob();
  },

  // เพิ่ม Tags ให้กับ Operating System (assign หลาย tag พร้อมกัน)
  async assignTagsToOs(
    
    osId: string,
    tagIds: string[],
  ): Promise<OperatingSystemUpdateResponse> {
    const response = await fetch(
      `${API_BASE_URL}/operating-systems/${osId}/tags`,
      {
        method: "POST",
        headers: createMutatingHeaders(), credentials: 'include',
        body: JSON.stringify(tagIds),
      },
    );
    return handleResponse(response);
  },

  // ลบ Tags ออกจาก Operating System (remove หลาย tag พร้อมกัน)
  async removeTagsFromOs(
    
    osId: string,
    tagIds: string[],
  ): Promise<OperatingSystemUpdateResponse> {
    const response = await fetch(
      `${API_BASE_URL}/operating-systems/${osId}/tags`,
      {
        method: "DELETE",
        headers: createMutatingHeaders(), credentials: 'include',
        body: JSON.stringify(tagIds),
      },
    );
    return handleResponse(response);
  },
};
