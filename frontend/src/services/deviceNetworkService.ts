// Device Network Service สำหรับจัดการ API calls เกี่ยวกับอุปกรณ์เครือข่าย

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

import { RelatedTagInfo } from "./operatingSystemService";

export type TypeDevice =
  | "SWITCH"
  | "ROUTER"
  | "FIREWALL"
  | "ACCESS_POINT"
  | "OTHER";

export type StatusDevice = "ONLINE" | "OFFLINE" | "MAINTENANCE" | "OTHER";

// Types ตาม API schema
export type VendorType =
  | "CISCO"
  | "JUNIPER"
  | "ARISTA"
  | "HUAWEI"
  | "DELL"
  | "HP"
  | "OTHER";
export type DefaultStrategy =
  | "OC_FIRST"
  | "NETCONF_FIRST"
  | "OC_ONLY"
  | "NETCONF_ONLY"
  | "OPERATION_BASED";

export interface DeviceNetwork {
  id: string;
  serial_number: string;
  device_name: string;
  device_model: string;
  type: TypeDevice;
  status: StatusDevice;
  ip_address?: string | null;
  mac_address: string;
  description?: string | null;
  policy_id?: string | null;
  os_id?: string | null;
  backup_id?: string | null;
  local_site_id?: string | null;
  configuration_template_id?: string | null;
  node_id?: string | null;
  vendor?: VendorType;
  management_protocol?: "NETCONF" | "OPENFLOW" | null;
  datapath_id?: string | null;
  default_strategy?: DefaultStrategy;
  netconf_host?: string | null;
  netconf_port?: number;
  netconf_username?: string | null;
  netconf_password?: string | null;
  created_at: string;
  updated_at: string;
  odl_mounted?: boolean;
  odl_connection_status?: string | null;
  oc_supported_intents?: Record<string, boolean> | null;
  last_synced_at?: string | null;
  ready_for_intent?: boolean;
  tags?: RelatedTagInfo[];
  operatingSystem?: {
    id: string;
    os_type: string;
  } | null;
  localSite?: {
    id: string;
    site_code: string;
    site_name: string | null;
  } | null;
  policy?: {
    id: string;
    policy_name: string;
  } | null;
  backup?: {
    id: string;
    backup_name: string;
    status: string;
  } | null;
  configuration_template?: {
    id: string;
    template_name: string;
    template_type: string;
  } | null;
}

export interface DeviceNetworkListResponse {
  total: number;
  page: number;
  page_size: number;
  devices: DeviceNetwork[];
}

export interface DeviceNetworkCreateRequest {
  serial_number: string;
  device_name: string;
  device_model: string;
  type?: TypeDevice;
  status?: StatusDevice;
  ip_address?: string | null;
  mac_address: string;
  description?: string | null;
  policy_id?: string | null;
  os_id?: string | null;
  backup_id?: string | null;
  local_site_id?: string | null;
  configuration_template_id?: string | null;
  node_id?: string | null;
  vendor?: VendorType;
  management_protocol?: "NETCONF" | "OPENFLOW" | null;
  datapath_id?: string | null;
  default_strategy?: DefaultStrategy;
  netconf_host?: string | null;
  netconf_port?: number;
  netconf_username?: string | null;
  netconf_password?: string | null;
}

export interface DeviceNetworkUpdateRequest {
  serial_number?: string | null;
  device_name?: string | null;
  device_model?: string | null;
  type?: TypeDevice | null;
  status?: StatusDevice | null;
  ip_address?: string | null;
  mac_address?: string | null;
  description?: string | null;
  policy_id?: string | null;
  os_id?: string | null;
  backup_id?: string | null;
  local_site_id?: string | null;
  configuration_template_id?: string | null;
  node_id?: string | null;
  vendor?: VendorType | null;
  management_protocol?: "NETCONF" | "OPENFLOW" | null;
  datapath_id?: string | null;
  default_strategy?: DefaultStrategy | null;
  netconf_host?: string | null;
  netconf_port?: number | null;
  netconf_username?: string | null;
  netconf_password?: string | null;
}

export interface DeviceNetworkCreateResponse {
  message: string;
  device: DeviceNetwork;
}

export interface DeviceNetworkUpdateResponse {
  message: string;
  device: DeviceNetwork;
}

export interface InterfaceDiscoveryResponse {
  success: boolean;
  node_id: string;
  vendor: string;
  count: number;
  interfaces: Array<{
    name: string;
    type: string;
    number: string;
    description: string | null;
    admin_status: string;
    ipv4: string | null;
    ipv4_address: string | null;
    subnet_mask: string | null;
    ipv6: string | null;
    mtu: number | null;
    has_ospf: boolean;
    ospf: any;
    oper_status: string;
    mac_address: string;
    speed: string;
    duplex: string;
    auto_negotiate: boolean;
    media_type: string;
    last_change: string;
  }>;
}

export interface DeviceNetworkDeleteResponse {
  message: string;
  device_id: string;
}

// API Error class (reuse pattern)
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
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

// Helper function สำหรับ handle response
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // ignore json parse error
    }
    throw new APIError(errorMessage, response.status);
  }
  return response.json();
};

// Device Network API functions
export const deviceNetworkService = {
  async getDevices(
    
    page = 1,
    pageSize = 20,
    filters?: {
      search?: string;
      type?: string;
      status?: string;
      site_id?: string;
      os_id?: string;
      policy_id?: string;
      tag_id?: string;
    },
  ): Promise<DeviceNetworkListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.type && { device_type: filters.type }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.site_id && { local_site_id: filters.site_id }),
      ...(filters?.os_id && { os_id: filters.os_id }),
      ...(filters?.policy_id && { policy_id: filters.policy_id }),
      ...(filters?.tag_id && { tag_id: filters.tag_id }),
    });

    const response = await fetch(`${API_BASE_URL}/device-networks/?${params}`, {
      method: "GET",
      headers: createHeaders(), credentials: 'include',
    });
    return handleResponse(response);
  },

  async getDeviceById(deviceId: string): Promise<DeviceNetwork> {
    const response = await fetch(
      `${API_BASE_URL}/device-networks/${deviceId}`,
      {
        method: "GET",
        headers: createHeaders(), credentials: 'include',
      },
    );
    return handleResponse(response);
  },

  async createDevice(
    
    data: DeviceNetworkCreateRequest,
  ): Promise<DeviceNetworkCreateResponse> {
    const response = await fetch(`${API_BASE_URL}/device-networks/`, {
      method: "POST",
      headers: createMutatingHeaders(), credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateDevice(
    
    deviceId: string,
    data: DeviceNetworkUpdateRequest,
  ): Promise<DeviceNetworkUpdateResponse> {
    const response = await fetch(
      `${API_BASE_URL}/device-networks/${deviceId}`,
      {
        method: "PUT",
        headers: createMutatingHeaders(), credentials: 'include',
        body: JSON.stringify(data),
      },
    );
    return handleResponse(response);
  },

  async deleteDevice(
    
    deviceId: string,
  ): Promise<DeviceNetworkDeleteResponse> {
    const response = await fetch(
      `${API_BASE_URL}/device-networks/${deviceId}`,
      {
        method: "DELETE",
        headers: createMutatingHeaders(), credentials: 'include',
      },
    );
    return handleResponse(response);
  },

  async assignTagsToDevice(
    
    deviceId: string,
    tagIds: string[],
  ): Promise<DeviceNetworkUpdateResponse> {
    const response = await fetch(
      `${API_BASE_URL}/device-networks/${deviceId}/tags`,
      {
        method: "POST",
        headers: createMutatingHeaders(), credentials: 'include',
        body: JSON.stringify({ tag_ids: tagIds }),
      },
    );
    return handleResponse(response);
  },

  async removeTagsFromDevice(
    
    deviceId: string,
    tagIds: string[],
  ): Promise<DeviceNetworkUpdateResponse> {
    const response = await fetch(
      `${API_BASE_URL}/device-networks/${deviceId}/tags`,
      {
        method: "DELETE",
        headers: createMutatingHeaders(), credentials: 'include',
        body: JSON.stringify({ tag_ids: tagIds }),
      },
    );
    return handleResponse(response);
  },

  async mountDevice(nodeId: string): Promise<any> {
    const url = `${API_BASE_URL}/api/v1/nbi/devices/${nodeId}/mount`;
    const response = await fetch(url, {
      method: "POST",
      headers: createMutatingHeaders(), credentials: 'include',
    });
    return handleResponse(response);
  },
  async unmountDevice(nodeId: string): Promise<any> {
    const url = `${API_BASE_URL}/api/v1/nbi/devices/${nodeId}/unmount`;
    const response = await fetch(url, {
      method: "POST",
      headers: createMutatingHeaders(), credentials: 'include',
    });
    return handleResponse(response);
  },

  async discoverInterfaces(
    
    nodeId: string,
  ): Promise<InterfaceDiscoveryResponse> {
    const url = `${API_BASE_URL}/interfaces/odl/${nodeId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(), credentials: 'include',
    });
    return handleResponse(response);
  },

  async syncInterfaces(
    
    nodeId: string,
  ): Promise<InterfaceDiscoveryResponse> {
    const url = `${API_BASE_URL}/interfaces/odl/${nodeId}/sync`;
    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(), credentials: 'include',
    });
    return handleResponse(response);
  },

  async getInterfaceNames(
    
    nodeId: string,
  ): Promise<{ success: boolean; names: string[] }> {
    const url = `${API_BASE_URL}/interfaces/odl/${nodeId}/names`;
    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(), credentials: 'include',
    });
    return handleResponse(response);
  },
};
