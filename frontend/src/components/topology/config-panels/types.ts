// frontend/src/components/topology/config-panels/types.ts
import { paths, components } from "@/lib/apiv2/schema";

// Derive DeviceNetwork from the API schema so it matches TopologyConfigModal
type DeviceNetwork =
  paths["/device-networks/"]["get"]["responses"]["200"]["content"]["application/json"]["devices"][number];

export type ConfigurationTemplateListResponse =
  paths["/configuration-templates/"]["get"]["responses"]["200"]["content"]["application/json"];
export type ConfigurationTemplateResponse =
  components["schemas"]["ConfigurationTemplateResponse"];
export type ConfigurationTemplateDetailResponse =
  components["schemas"]["ConfigurationTemplateDetailResponse"];

export interface ConfigPanelProps {
  device: DeviceNetwork;
  nodeId: string;
  showData: Record<string, any> | null;
}
