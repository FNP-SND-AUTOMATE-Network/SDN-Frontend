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
  os_name: string;
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
  os_name: string;
  os_type?: OsType;
  description?: string | null;
}

export interface OperatingSystemUpdateRequest {
  os_name?: string | null;
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
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

// Helper function สำหรับสร้าง headers
const createHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
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

// Operating System API functions
export const operatingSystemService = {
  // ดึงข้อมูล Operating Systems ทั้งหมด
  async getOperatingSystems(
    token: string,
    page = 1,
    pageSize = 20,
    filters?: {
      os_type?: string;
      search?: string;
      tag_id?: string;
      include_usage?: boolean;
    }
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
        headers: createHeaders(token),
      }
    );
    return handleResponse(response);
  },

  // ดึงข้อมูล Operating System ตาม ID
  async getOperatingSystemById(
    token: string,
    osId: string,
    includeUsage = false
  ): Promise<OperatingSystem> {
    const params = new URLSearchParams({
      ...(includeUsage ? { include_usage: "true" } : {}),
    });

    const url = params.toString()
      ? `${API_BASE_URL}/operating-systems/${osId}?${params}`
      : `${API_BASE_URL}/operating-systems/${osId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(token),
    });
    return handleResponse(response);
  },

  // สร้าง Operating System ใหม่
  async createOperatingSystem(
    token: string,
    osData: OperatingSystemCreateRequest
  ): Promise<OperatingSystemCreateResponse> {
    const response = await fetch(`${API_BASE_URL}/operating-systems/`, {
      method: "POST",
      headers: createHeaders(token),
      body: JSON.stringify(osData),
    });
    return handleResponse(response);
  },

  // อัปเดต Operating System
  async updateOperatingSystem(
    token: string,
    osId: string,
    osData: OperatingSystemUpdateRequest
  ): Promise<OperatingSystemUpdateResponse> {
    const response = await fetch(`${API_BASE_URL}/operating-systems/${osId}`, {
      method: "PUT",
      headers: createHeaders(token),
      body: JSON.stringify(osData),
    });
    return handleResponse(response);
  },

  // ลบ Operating System
  async deleteOperatingSystem(
    token: string,
    osId: string,
    force = false
  ): Promise<OperatingSystemDeleteResponse> {
    const params = new URLSearchParams({
      ...(force ? { force: "true" } : {}),
    });

    const url = params.toString()
      ? `${API_BASE_URL}/operating-systems/${osId}?${params}`
      : `${API_BASE_URL}/operating-systems/${osId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: createHeaders(token),
    });
    return handleResponse(response);
  },

  // อัปโหลดไฟล์สำหรับ Operating System
  async uploadOsFile(
    token: string,
    osId: string,
    file: File,
    version?: string | null
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
        headers: {
          Authorization: `Bearer ${token}`,
          // ไม่กำหนด Content-Type ให้ browser จัดการ boundary เอง
        } as HeadersInit,
        body: formData,
      }
    );
    return handleResponse(response);
  },

  // ดึงรายการไฟล์ของ Operating System
  async getOsFiles(token: string, osId: string): Promise<OSFileListResponse> {
    const response = await fetch(
      `${API_BASE_URL}/operating-systems/${osId}/files`,
      {
        method: "GET",
        headers: createHeaders(token),
      }
    );
    return handleResponse(response);
  },

  // ลบไฟล์ของ Operating System
  async deleteOsFile(
    token: string,
    osId: string,
    fileId: string
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/operating-systems/${osId}/files/${fileId}`,
      {
        method: "DELETE",
        headers: createHeaders(token),
      }
    );
    return handleResponse(response);
  },

  // ดาวน์โหลดไฟล์ OS (ส่ง blob กลับไปให้ frontend จัดการ save)
  async downloadOsFile(
    token: string,
    osId: string,
    fileId: string
  ): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/operating-systems/${osId}/files/${fileId}/download`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
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
    token: string,
    osId: string,
    tagIds: string[]
  ): Promise<OperatingSystemUpdateResponse> {
    const response = await fetch(
      `${API_BASE_URL}/operating-systems/${osId}/tags`,
      {
        method: "POST",
        headers: createHeaders(token),
        body: JSON.stringify(tagIds),
      }
    );
    return handleResponse(response);
  },

  // ลบ Tags ออกจาก Operating System (remove หลาย tag พร้อมกัน)
  async removeTagsFromOs(
    token: string,
    osId: string,
    tagIds: string[]
  ): Promise<OperatingSystemUpdateResponse> {
    const response = await fetch(
      `${API_BASE_URL}/operating-systems/${osId}/tags`,
      {
        method: "DELETE",
        headers: createHeaders(token),
        body: JSON.stringify(tagIds),
      }
    );
    return handleResponse(response);
  },
};
