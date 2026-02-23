// Topology Service สำหรับจัดการ API calls เกี่ยวกับ Network Topology

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// --- Types ---

export interface TopologyNode {
  id: string;
  label: string;
  type: string; // "router" | "switch" | "firewall" | "access_point" | "other"
  parent: string | null;
}

export interface TopologyLink {
  id: string;
  source: string;
  target: string;
  source_tp: string; // source termination point (interface name)
  target_tp: string; // target termination point (interface name)
}

export interface TopologyResponse {
  nodes: TopologyNode[];
  links: TopologyLink[];
}

export interface TopologySyncResponse {
  success: boolean;
  message: string;
  nodes_synced?: number;
  links_synced?: number;
}

// --- Helpers ---

const createHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// --- Service ---

export const topologyService = {
  /**
   * ดึงข้อมูล Topology ล่าสุดจาก Database
   * สามารถ filter ตาม local_site_id ได้
   */
  async getTopology(
    token: string,
    localSiteId?: string | null,
  ): Promise<TopologyResponse> {
    const params = new URLSearchParams();
    if (localSiteId) {
      params.append("local_site_id", localSiteId);
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/v1/nbi/topology${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * Trigger topology sync จาก ODL ไปยัง Database
   */
  async syncTopology(token: string): Promise<TopologySyncResponse> {
    const url = `${API_BASE_URL}/api/v1/nbi/topology/sync`;

    const response = await fetch(url, {
      method: "POST",
      headers: createHeaders(token),
    });
    return handleResponse(response);
  },
};
