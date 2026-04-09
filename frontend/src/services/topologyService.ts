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
  sourceHandle: string; // source interface port name (e.g., "1", "GigabitEthernet4")
  targetHandle: string; // target interface port name (e.g., "3", "2")
  type: string; // link type (e.g., "OPENFLOW-L2", "NETCONF-L2")
  raw_source: string; // full source termination point ID
  raw_target: string; // full target termination point ID
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

const createHeaders = () => ({
  
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
      headers: createHeaders(), credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Trigger topology sync จาก ODL ไปยัง Database
   */
  async syncTopology(): Promise<TopologySyncResponse> {
    const url = `${API_BASE_URL}/api/v1/nbi/topology/sync`;

    const response = await fetch(url, {
      method: "POST",
      headers: createHeaders(), credentials: 'include',
    });
    return handleResponse(response);
  },
};
