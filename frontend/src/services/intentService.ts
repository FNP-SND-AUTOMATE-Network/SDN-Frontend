// Intent Service สำหรับจัดการ API calls ไปยัง NBI Intents (OpenDaylight)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ==================== Types ====================

export interface IntentListResponse {
  success: boolean;
  code: string;
  message: string;
  intents: Record<string, string[]>;
}

export interface IntentDetail {
  name: string;
  category: string;
  description: string;
  required_params: string[];
  optional_params: string[];
  is_read_only: boolean;
}

export interface IntentDetailResponse {
  success: boolean;
  code: string;
  message: string;
  data: IntentDetail;
}

export interface IntentExecuteRequest {
  intent: string;
  node_id: string;
  params?: Record<string, any>;
}

export interface IntentExecuteResponse {
  success: boolean;
  intent: string;
  node_id: string;
  strategy_used: string;
  driver_used: string;
  result: Record<string, any> | null;
  error: Record<string, any> | null;
}

// ==================== Service ====================

export const intentService = {
  /**
   * Get all supported intents grouped by category
   */
  async getIntents(token: string): Promise<IntentListResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/nbi/intents`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch intents");
    }
    return response.json();
  },

  /**
   * Get detailed information about a specific intent
   */
  async getIntentDetail(
    token: string,
    intentName: string,
  ): Promise<IntentDetailResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/nbi/intents/${intentName}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch intent: ${intentName}`);
    }
    return response.json();
  },

  /**
   * Execute an intent on a device via OpenDaylight
   */
  async executeIntent(
    token: string,
    request: IntentExecuteRequest,
  ): Promise<IntentExecuteResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/nbi/intent`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to execute intent");
    }
    return response.json();
  },

  // ==================== Intent Helpers ====================

  /**
   * Show running config
   */
  async showRunningConfig(
    token: string,
    nodeId: string,
    section?: string,
  ): Promise<IntentExecuteResponse> {
    return this.executeIntent(token, {
      intent: "show.running_config",
      node_id: nodeId,
      params: section ? { section } : {},
    });
  },

  /**
   * Show all interfaces
   */
  async showInterfaces(
    token: string,
    nodeId: string,
  ): Promise<IntentExecuteResponse> {
    return this.executeIntent(token, {
      intent: "show.interfaces",
      node_id: nodeId,
      params: {},
    });
  },

  /**
   * Show specific interface
   */
  async showInterface(
    token: string,
    nodeId: string,
    interfaceName: string,
  ): Promise<IntentExecuteResponse> {
    return this.executeIntent(token, {
      intent: "show.interface",
      node_id: nodeId,
      params: { interface: interfaceName },
    });
  },

  /**
   * Show IP routing table
   */
  async showIpRoute(
    token: string,
    nodeId: string,
  ): Promise<IntentExecuteResponse> {
    return this.executeIntent(token, {
      intent: "show.ip_route",
      node_id: nodeId,
      params: {},
    });
  },

  /**
   * Show all VLANs
   */
  async showVlans(
    token: string,
    nodeId: string,
  ): Promise<IntentExecuteResponse> {
    return this.executeIntent(token, {
      intent: "show.vlans",
      node_id: nodeId,
      params: {},
    });
  },

  /**
   * Show DHCP pools
   */
  async showDhcpPools(
    token: string,
    nodeId: string,
  ): Promise<IntentExecuteResponse> {
    return this.executeIntent(token, {
      intent: "show.dhcp_pools",
      node_id: nodeId,
      params: {},
    });
  },

  /**
   * Show OSPF neighbors
   */
  async showOspfNeighbors(
    token: string,
    nodeId: string,
  ): Promise<IntentExecuteResponse> {
    return this.executeIntent(token, {
      intent: "show.ospf.neighbors",
      node_id: nodeId,
      params: {},
    });
  },

  /**
   * Show OSPF database
   */
  async showOspfDatabase(
    token: string,
    nodeId: string,
  ): Promise<IntentExecuteResponse> {
    return this.executeIntent(token, {
      intent: "show.ospf.database",
      node_id: nodeId,
      params: {},
    });
  },

  /**
   * Show IP interface brief
   */
  async showIpInterfaceBrief(
    token: string,
    nodeId: string,
  ): Promise<IntentExecuteResponse> {
    return this.executeIntent(token, {
      intent: "show.ip_interface_brief",
      node_id: nodeId,
      params: {},
    });
  },

  // ==================== System Intents ====================

  async setHostname(token: string, nodeId: string, hostname: string) {
    return this.executeIntent(token, {
      intent: "system.set_hostname",
      node_id: nodeId,
      params: { hostname },
    });
  },

  async setDns(token: string, nodeId: string, server: string, domain?: string) {
    return this.executeIntent(token, {
      intent: "system.set_dns",
      node_id: nodeId,
      params: { server, ...(domain && { domain }) },
    });
  },

  async setNtp(
    token: string,
    nodeId: string,
    server: string,
    prefer?: boolean,
  ) {
    return this.executeIntent(token, {
      intent: "system.set_ntp",
      node_id: nodeId,
      params: { server, ...(prefer !== undefined && { prefer }) },
    });
  },

  async setBanner(
    token: string,
    nodeId: string,
    banner: string,
    bannerType?: string,
  ) {
    return this.executeIntent(token, {
      intent: "system.set_banner",
      node_id: nodeId,
      params: { banner, ...(bannerType && { banner_type: bannerType }) },
    });
  },

  async saveConfig(token: string, nodeId: string) {
    return this.executeIntent(token, {
      intent: "system.save_config",
      node_id: nodeId,
      params: {},
    });
  },

  // ==================== Routing Intents ====================

  async addStaticRoute(
    token: string,
    nodeId: string,
    params: {
      prefix: string;
      next_hop: string;
      metric?: number;
      mask?: string;
    },
  ) {
    return this.executeIntent(token, {
      intent: "routing.static.add",
      node_id: nodeId,
      params,
    });
  },

  async deleteStaticRoute(
    token: string,
    nodeId: string,
    prefix: string,
    nextHop: string,
  ) {
    return this.executeIntent(token, {
      intent: "routing.static.delete",
      node_id: nodeId,
      params: { prefix, next_hop: nextHop },
    });
  },

  async enableOspf(token: string, nodeId: string, processId: number) {
    return this.executeIntent(token, {
      intent: "routing.ospf.enable",
      node_id: nodeId,
      params: { process_id: processId },
    });
  },

  async disableOspf(token: string, nodeId: string, processId: number) {
    return this.executeIntent(token, {
      intent: "routing.ospf.disable",
      node_id: nodeId,
      params: { process_id: processId },
    });
  },

  async addOspfNetwork(
    token: string,
    nodeId: string,
    params: {
      process_id: number;
      network: string;
      wildcard: string;
      area: number;
    },
  ) {
    return this.executeIntent(token, {
      intent: "routing.ospf.add_network",
      node_id: nodeId,
      params,
    });
  },

  async addOspfNetworkInterface(
    token: string,
    nodeId: string,
    params: {
      process_id: number;
      interface: string;
      area: number;
    },
  ) {
    return this.executeIntent(token, {
      intent: "routing.ospf.add_network_interface",
      node_id: nodeId,
      params,
    });
  },

  async removeOspfNetworkInterface(
    token: string,
    nodeId: string,
    params: {
      process_id: number;
      interface: string;
      area: number;
    },
  ) {
    return this.executeIntent(token, {
      intent: "routing.ospf.remove_network_interface",
      node_id: nodeId,
      params,
    });
  },

  async removeOspfNetwork(
    token: string,
    nodeId: string,
    params: {
      process_id: number;
      network: string;
      wildcard: string;
      area: number;
    },
  ) {
    return this.executeIntent(token, {
      intent: "routing.ospf.remove_network",
      node_id: nodeId,
      params,
    });
  },

  async setOspfRouterId(
    token: string,
    nodeId: string,
    processId: number,
    routerId: string,
  ) {
    return this.executeIntent(token, {
      intent: "routing.ospf.set_router_id",
      node_id: nodeId,
      params: { process_id: processId, router_id: routerId },
    });
  },

  async addDefaultRoute(token: string, nodeId: string, nextHop: string) {
    return this.executeIntent(token, {
      intent: "routing.default.add",
      node_id: nodeId,
      params: { next_hop: nextHop },
    });
  },

  async deleteDefaultRoute(token: string, nodeId: string, nextHop: string) {
    return this.executeIntent(token, {
      intent: "routing.default.delete",
      node_id: nodeId,
      params: { next_hop: nextHop },
    });
  },

  // ==================== Interface Intents ====================

  async setInterfaceIpv4(
    token: string,
    nodeId: string,
    params: {
      interface: string;
      ip: string;
      prefix: string;
      description?: string;
    },
  ) {
    return this.executeIntent(token, {
      intent: "interface.set_ipv4",
      node_id: nodeId,
      params,
    });
  },

  async setInterfaceIpv6(
    token: string,
    nodeId: string,
    params: { interface: string; ip: string; prefix: string },
  ) {
    return this.executeIntent(token, {
      intent: "interface.set_ipv6",
      node_id: nodeId,
      params,
    });
  },

  async setInterfaceDescription(
    token: string,
    nodeId: string,
    interfaceName: string,
    description: string,
  ) {
    return this.executeIntent(token, {
      intent: "interface.set_description",
      node_id: nodeId,
      params: { interface: interfaceName, description },
    });
  },

  async setInterfaceMtu(
    token: string,
    nodeId: string,
    interfaceName: string,
    mtu: number,
  ) {
    return this.executeIntent(token, {
      intent: "interface.set_mtu",
      node_id: nodeId,
      params: { interface: interfaceName, mtu },
    });
  },

  async enableInterface(token: string, nodeId: string, interfaceName: string) {
    return this.executeIntent(token, {
      intent: "interface.enable",
      node_id: nodeId,
      params: { interface: interfaceName },
    });
  },

  async disableInterface(token: string, nodeId: string, interfaceName: string) {
    return this.executeIntent(token, {
      intent: "interface.disable",
      node_id: nodeId,
      params: { interface: interfaceName },
    });
  },

  // ==================== VLAN Intents ====================

  async createVlan(
    token: string,
    nodeId: string,
    params: { vlan_id: number; name?: string; description?: string },
  ) {
    return this.executeIntent(token, {
      intent: "vlan.create",
      node_id: nodeId,
      params,
    });
  },

  async deleteVlan(token: string, nodeId: string, vlanId: number) {
    return this.executeIntent(token, {
      intent: "vlan.delete",
      node_id: nodeId,
      params: { vlan_id: vlanId },
    });
  },

  async updateVlan(
    token: string,
    nodeId: string,
    params: { vlan_id: number; name?: string; description?: string },
  ) {
    return this.executeIntent(token, {
      intent: "vlan.update",
      node_id: nodeId,
      params,
    });
  },

  async assignVlanPort(
    token: string,
    nodeId: string,
    params: { interface: string; vlan_id: number; mode?: string },
  ) {
    return this.executeIntent(token, {
      intent: "vlan.assign_port",
      node_id: nodeId,
      params,
    });
  },

  // ==================== DHCP Intents ====================

  async createDhcpPool(
    token: string,
    nodeId: string,
    params: {
      pool_name: string;
      gateway: string;
      mask: string;
      start_ip: string;
      end_ip: string;
      dns_servers?: string;
      lease_days?: number;
    },
  ) {
    return this.executeIntent(token, {
      intent: "dhcp.create_pool",
      node_id: nodeId,
      params,
    });
  },

  async deleteDhcpPool(token: string, nodeId: string, poolName: string) {
    return this.executeIntent(token, {
      intent: "dhcp.delete_pool",
      node_id: nodeId,
      params: { pool_name: poolName },
    });
  },

  async updateDhcpPool(
    token: string,
    nodeId: string,
    params: Record<string, any>,
  ) {
    return this.executeIntent(token, {
      intent: "dhcp.update_pool",
      node_id: nodeId,
      params,
    });
  },
};
