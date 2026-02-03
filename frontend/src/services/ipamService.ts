// IPAM Service สำหรับจัดการ API calls เกี่ยวกับ IP Address Management

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ========== TypeScript Interfaces ==========

// Section (Folder) Response
export interface Section {
  id: string;
  name: string;
  description?: string | null;
  master_section?: string | null;
  permissions?: string | null;
  strict_mode?: string | null;
  subnet_ordering?: string | null;
  order?: string | null;
  show_vlan_in_subnet_listing?: string | number | null;
  show_vrf_in_subnet_listing?: string | number | null;
}

export interface SectionListResponse {
  sections: Section[];
  total: number;
}

// Subnet Response
export interface Subnet {
  id: string;
  subnet: string;
  mask: string;
  description?: string | null;
  section_id?: string | null;
  vlan_id?: string | null;
}

export interface SubnetDetail {
  id: string;
  subnet: string;
  mask: string;
  section_id: string;
  description?: string | null;
  vlan_id?: string | null;
  master_subnet_id?: string | null;
  permissions?: string | null;
  show_name?: string | null;
}

export interface SubnetListResponse {
  subnets: Subnet[];
  total: number;
}

// Subnet Usage
export interface SubnetUsage {
  used: number;
  maxhosts: number;
  freehosts: number;
  freehosts_percent: number;
  Offline_percent?: number | null;
  Used_percent: number;
  Reserved_percent?: number | null;
}

// IP Address Response
export interface IPAddress {
  id: string;
  ip: string;
  subnet_id: string;
  hostname?: string | null;
  description?: string | null;
  mac?: string | null;
  phpipam_id?: string | null;
}

export interface IPAddressDetail {
  id: string;
  ip: string;
  subnet_id: string;
  hostname?: string | null;
  description?: string | null;
  mac?: string | null;
  is_gateway?: string | null;
  tag?: string | null;
}

export interface IPAddressListResponse {
  addresses: IPAddress[];
  total: number;
}

// Create/Update Requests
export interface SectionCreateRequest {
  name: string;
  description?: string | null;
  master_section?: string | null;
  permissions?: string | null;
  strict_mode?: string | null;
  subnet_ordering?: string | null;
  order?: string | null;
  show_vlan_in_subnet_listing?: boolean | null;
  show_vrf_in_subnet_listing?: boolean | null;
}

export interface SectionUpdateRequest {
  name?: string | null;
  description?: string | null;
  master_section?: string | null;
  permissions?: string | null;
  strict_mode?: string | null;
  subnet_ordering?: string | null;
  order?: string | null;
  show_vlan_in_subnet_listing?: boolean | null;
  show_vrf_in_subnet_listing?: boolean | null;
}

export interface SubnetCreateRequest {
  subnet: string;
  mask: string;
  section_id: string;
  description?: string | null;
  vlan_id?: string | null;
  master_subnet_id?: string | null;
  permissions?: string | null;
  show_name?: boolean | null;
  dns_recursive?: boolean | null;
  dns_records?: boolean | null;
  allow_requests?: boolean | null;
  scan_agent?: string | null;
}

// ========== API Error Handling ==========

export class IPAMAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
  ) {
    super(message);
    this.name = "IPAMAPIError";
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
    throw new IPAMAPIError(errorMessage, response.status);
  }
  return response.json();
};

// ========== IPAM Service Functions ==========

export const ipamService = {
  // ========== Sections ==========

  /**
   * ดึงรายการ sections ทั้งหมด
   */
  async getSections(token: string): Promise<SectionListResponse> {
    const response = await fetch(`${API_BASE_URL}/ipam/sections`, {
      method: "GET",
      headers: createHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * สร้าง section ใหม่
   */
  async createSection(
    token: string,
    sectionData: SectionCreateRequest,
  ): Promise<Section> {
    const response = await fetch(`${API_BASE_URL}/ipam/sections`, {
      method: "POST",
      headers: createHeaders(token),
      body: JSON.stringify(sectionData),
    });
    return handleResponse(response);
  },

  /**
   * อัปเดต section
   */
  async updateSection(
    token: string,
    sectionId: string,
    sectionData: SectionUpdateRequest,
  ): Promise<Section> {
    const response = await fetch(`${API_BASE_URL}/ipam/sections/${sectionId}`, {
      method: "PATCH",
      headers: createHeaders(token),
      body: JSON.stringify(sectionData),
    });
    return handleResponse(response);
  },

  /**
   * ลบ section
   */
  async deleteSection(token: string, sectionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/ipam/sections/${sectionId}`, {
      method: "DELETE",
      headers: createHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * ดึงรายการ subnets ใน section
   */
  async getSectionSubnets(
    token: string,
    sectionId: string,
  ): Promise<SubnetListResponse> {
    const response = await fetch(
      `${API_BASE_URL}/ipam/sections/${sectionId}/subnets`,
      {
        method: "GET",
        headers: createHeaders(token),
      },
    );
    return handleResponse(response);
  },

  // ========== Subnets ==========

  /**
   * ดึงรายการ subnets ทั้งหมด
   */
  async getSubnets(token: string): Promise<SubnetListResponse> {
    const response = await fetch(`${API_BASE_URL}/ipam/subnets`, {
      method: "GET",
      headers: createHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * ดึงรายละเอียด subnet
   */
  async getSubnetDetail(
    token: string,
    subnetId: string,
  ): Promise<SubnetDetail> {
    const response = await fetch(`${API_BASE_URL}/ipam/subnets/${subnetId}`, {
      method: "GET",
      headers: createHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * ดึงข้อมูล usage ของ subnet
   */
  async getSubnetUsage(token: string, subnetId: string): Promise<SubnetUsage> {
    const response = await fetch(
      `${API_BASE_URL}/ipam/subnets/${subnetId}/usage`,
      {
        method: "GET",
        headers: createHeaders(token),
      },
    );
    return handleResponse(response);
  },

  /**
   * ดึงรายการ IP addresses ใน subnet
   */
  async getSubnetAddresses(
    token: string,
    subnetId: string,
  ): Promise<IPAddressListResponse> {
    const response = await fetch(
      `${API_BASE_URL}/ipam/subnets/${subnetId}/addresses`,
      {
        method: "GET",
        headers: createHeaders(token),
      },
    );
    return handleResponse(response);
  },

  /**
   * สร้าง subnet ใหม่
   */
  async createSubnet(
    token: string,
    subnetData: SubnetCreateRequest,
  ): Promise<SubnetDetail> {
    const response = await fetch(`${API_BASE_URL}/ipam/subnets`, {
      method: "POST",
      headers: createHeaders(token),
      body: JSON.stringify(subnetData),
    });
    return handleResponse(response);
  },

  /**
   * อัปเดต subnet
   */
  async updateSubnet(
    token: string,
    subnetId: string,
    subnetData: Partial<SubnetCreateRequest>,
  ): Promise<SubnetDetail> {
    const response = await fetch(`${API_BASE_URL}/ipam/subnets/${subnetId}`, {
      method: "PATCH",
      headers: createHeaders(token),
      body: JSON.stringify(subnetData),
    });
    return handleResponse(response);
  },

  /**
   * ลบ subnet
   */
  async deleteSubnet(token: string, subnetId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/ipam/subnets/${subnetId}`, {
      method: "DELETE",
      headers: createHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * ดึงรายการ child subnets ของ subnet
   */
  async getSubnetChildren(
    token: string,
    subnetId: string,
  ): Promise<SubnetListResponse> {
    const response = await fetch(
      `${API_BASE_URL}/ipam/subnets/${subnetId}/children`,
      {
        method: "GET",
        headers: createHeaders(token),
      },
    );
    return handleResponse(response);
  },

  // ========== IP Addresses ==========

  /**
   * ดึงรายละเอียด IP address
   */
  async getIPAddress(
    token: string,
    addressId: string,
  ): Promise<IPAddressDetail> {
    const response = await fetch(
      `${API_BASE_URL}/ipam/addresses/${addressId}`,
      {
        method: "GET",
        headers: createHeaders(token),
      },
    );
    return handleResponse(response);
  },

  /**
   * ค้นหา IP addresses
   */
  async searchIPAddresses(
    token: string,
    query: string,
  ): Promise<IPAddressListResponse> {
    const params = new URLSearchParams({ q: query });
    const response = await fetch(
      `${API_BASE_URL}/ipam/addresses/search?${params}`,
      {
        method: "GET",
        headers: createHeaders(token),
      },
    );
    return handleResponse(response);
  },

  /**
   * สร้าง IP address ใหม่
   */
  async createIPAddress(
    token: string,
    addressData: {
      subnet_id: string;
      ip: string;
      hostname?: string | null;
      description?: string | null;
      mac?: string | null;
      is_gateway?: boolean;
    },
  ): Promise<IPAddressDetail> {
    // Map frontend field names to API field names
    const apiPayload = {
      subnet_id: addressData.subnet_id,
      ip_address: addressData.ip,
      hostname: addressData.hostname,
      description: addressData.description,
      mac_address: addressData.mac,
      is_gateway: addressData.is_gateway ? 1 : 0,
    };
    const response = await fetch(`${API_BASE_URL}/ipam/addresses`, {
      method: "POST",
      headers: createHeaders(token),
      body: JSON.stringify(apiPayload),
    });
    return handleResponse(response);
  },

  /**
   * อัปเดต IP address
   */
  async updateIPAddress(
    token: string,
    addressId: string,
    addressData: {
      hostname?: string | null;
      description?: string | null;
      mac?: string | null;
      is_gateway?: boolean;
    },
  ): Promise<IPAddressDetail> {
    // Map frontend field names to API field names
    const apiPayload: Record<string, unknown> = {};
    if (addressData.hostname !== undefined) {
      apiPayload.hostname = addressData.hostname;
    }
    if (addressData.description !== undefined) {
      apiPayload.description = addressData.description;
    }
    if (addressData.mac !== undefined) {
      apiPayload.mac_address = addressData.mac;
    }
    if (addressData.is_gateway !== undefined) {
      apiPayload.is_gateway = addressData.is_gateway ? 1 : 0;
    }
    const response = await fetch(
      `${API_BASE_URL}/ipam/addresses/${addressId}`,
      {
        method: "PATCH",
        headers: createHeaders(token),
        body: JSON.stringify(apiPayload),
      },
    );
    return handleResponse(response);
  },

  /**
   * ลบ IP address
   */
  async deleteIPAddress(token: string, addressId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/ipam/addresses/${addressId}`,
      {
        method: "DELETE",
        headers: createHeaders(token),
      },
    );
    return handleResponse(response);
  },
};
