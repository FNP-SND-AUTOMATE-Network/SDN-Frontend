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
      // ignore json parse error
    }
    throw new APIError(errorMessage, response.status);
  }
  return response.json();
};

// Device Network API functions
export const deviceNetworkService = {
  async getDevices(
    token: string,
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
      headers: createHeaders(token),
    });
    return handleResponse(response);
  },

  async getDeviceById(token: string, deviceId: string): Promise<DeviceNetwork> {
    const response = await fetch(
      `${API_BASE_URL}/device-networks/${deviceId}`,
      {
        method: "GET",
        headers: createHeaders(token),
      },
    );
    return handleResponse(response);
  },

  async createDevice(
    token: string,
    data: DeviceNetworkCreateRequest,
  ): Promise<DeviceNetworkCreateResponse> {
    const response = await fetch(`${API_BASE_URL}/device-networks/`, {
      method: "POST",
      headers: createHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateDevice(
    token: string,
    deviceId: string,
    data: DeviceNetworkUpdateRequest,
  ): Promise<DeviceNetworkUpdateResponse> {
    const response = await fetch(
      `${API_BASE_URL}/device-networks/${deviceId}`,
      {
        method: "PUT",
        headers: createHeaders(token),
        body: JSON.stringify(data),
      },
    );
    return handleResponse(response);
  },

  async deleteDevice(
    token: string,
    deviceId: string,
  ): Promise<DeviceNetworkDeleteResponse> {
    const response = await fetch(
      `${API_BASE_URL}/device-networks/${deviceId}`,
      {
        method: "DELETE",
        headers: createHeaders(token),
      },
    );
    return handleResponse(response);
  },

  async assignTagsToDevice(
    token: string,
    deviceId: string,
    tagIds: string[],
  ): Promise<DeviceNetworkUpdateResponse> {
    const response = await fetch(
      `${API_BASE_URL}/device-networks/${deviceId}/tags`,
      {
        method: "POST",
        headers: createHeaders(token),
        body: JSON.stringify({ tag_ids: tagIds }),
      },
    );
    return handleResponse(response);
  },

  async removeTagsFromDevice(
    token: string,
    deviceId: string,
    tagIds: string[],
  ): Promise<DeviceNetworkUpdateResponse> {
    const response = await fetch(
      `${API_BASE_URL}/device-networks/${deviceId}/tags`,
      {
        method: "DELETE",
        headers: createHeaders(token),
        body: JSON.stringify({ tag_ids: tagIds }),
      },
    );
    return handleResponse(response);
  },

  async mountDevice(token: string, nodeId: string): Promise<any> {
    const url = `${API_BASE_URL}/api/v1/nbi/devices/${nodeId}/mount`;
    console.log("Calling POST:", url);
    const response = await fetch(url, {
      method: "POST",
      headers: createHeaders(token),
    });
    return handleResponse(response);
  },
  async unmountDevice(token: string, nodeId: string): Promise<any> {
    const url = `${API_BASE_URL}/api/v1/nbi/devices/${nodeId}/unmount`;
    console.log("Calling POST:", url);
    const response = await fetch(url, {
      method: "POST",
      headers: createHeaders(token),
    });
    return handleResponse(response);
  },

  async discoverInterfaces(
    token: string,
    nodeId: string,
  ): Promise<InterfaceDiscoveryResponse> {
    const url = `${API_BASE_URL}/api/v1/nbi/devices/${nodeId}/interfaces/discover`;
    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(token),
    });
    return handleResponse(response);
  },
};
