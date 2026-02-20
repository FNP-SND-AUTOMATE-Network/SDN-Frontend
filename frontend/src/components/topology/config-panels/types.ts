// frontend/src/components/topology/config-panels/types.ts
export interface ConfigPanelProps {
  device: any; // We can use DeviceNetwork if imported
  showData: any;
  isPushing: boolean;
  handlePush: (intent: string, params: Record<string, any>) => Promise<void>;
}
