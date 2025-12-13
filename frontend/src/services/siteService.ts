// Site Service สำหรับจัดการ API calls เกี่ยวกับ Local Sites

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Types ตาม API schema
export type SiteType = "DataCenter" | "BRANCH" | "OTHER";

export interface LocalSite {
  id: string;
  site_code: string;
  site_name?: string | null;
  site_type: SiteType;
  building_name?: string | null;
  floor_number?: number | null;
  rack_number?: number | null;
  address?: string | null;
  address_detail?: string | null;
  sub_district?: string | null;
  district?: string | null;
  city?: string | null;
  zip_code?: string | null;
  country?: string | null;
  device_count?: number | null;
  created_at: string;
  updated_at: string;
}

export interface LocalSiteListResponse {
  total: number;
  page: number;
  page_size: number;
  sites: LocalSite[];
}

export interface LocalSiteCreateRequest {
  site_code: string;
  site_name?: string | null;
  site_type?: SiteType;
  building_name?: string | null;
  floor_number?: number | null;
  rack_number?: number | null;
  address?: string | null;
  address_detail?: string | null;
  sub_district?: string | null;
  district?: string | null;
  city?: string | null;
  zip_code?: string | null;
  country?: string | null;
}

export interface LocalSiteUpdateRequest {
  site_code?: string | null;
  site_name?: string | null;
  site_type?: SiteType | null;
  building_name?: string | null;
  floor_number?: number | null;
  rack_number?: number | null;
  address?: string | null;
  address_detail?: string | null;
  sub_district?: string | null;
  district?: string | null;
  city?: string | null;
  zip_code?: string | null;
  country?: string | null;
}

export interface LocalSiteCreateResponse {
  message: string;
  site: LocalSite;
}

export interface LocalSiteUpdateResponse {
  message: string;
  site: LocalSite;
}

export interface LocalSiteDeleteResponse {
  message: string;
  site_id: string;
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

// Site API functions
export const siteService = {
  // ดึงข้อมูล Local Sites ทั้งหมด
  async getLocalSites(
    token: string,
    page = 1,
    pageSize = 20,
    filters?: {
      site_type?: string;
      search?: string;
    }
  ): Promise<LocalSiteListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(filters?.site_type && { site_type: filters.site_type }),
      ...(filters?.search && { search: filters.search }),
    });

    const response = await fetch(`${API_BASE_URL}/local-sites/?${params}`, {
      method: "GET",
      headers: createHeaders(token),
    });
    return handleResponse(response);
  },

  // ดึงข้อมูล Local Site ตาม ID
  async getLocalSiteById(token: string, siteId: string): Promise<LocalSite> {
    const response = await fetch(`${API_BASE_URL}/local-sites/${siteId}`, {
      method: "GET",
      headers: createHeaders(token),
    });
    return handleResponse(response);
  },

  // สร้าง Local Site ใหม่
  async createLocalSite(
    token: string,
    siteData: LocalSiteCreateRequest
  ): Promise<LocalSiteCreateResponse> {
    const response = await fetch(`${API_BASE_URL}/local-sites/`, {
      method: "POST",
      headers: createHeaders(token),
      body: JSON.stringify(siteData),
    });
    return handleResponse(response);
  },

  // อัปเดต Local Site
  async updateLocalSite(
    token: string,
    siteId: string,
    siteData: LocalSiteUpdateRequest
  ): Promise<LocalSiteUpdateResponse> {
    const response = await fetch(`${API_BASE_URL}/local-sites/${siteId}`, {
      method: "PUT",
      headers: createHeaders(token),
      body: JSON.stringify(siteData),
    });
    return handleResponse(response);
  },

  // ลบ Local Site
  async deleteLocalSite(
    token: string,
    siteId: string
  ): Promise<LocalSiteDeleteResponse> {
    const response = await fetch(`${API_BASE_URL}/local-sites/${siteId}`, {
      method: "DELETE",
      headers: createHeaders(token),
    });
    return handleResponse(response);
  },
};

