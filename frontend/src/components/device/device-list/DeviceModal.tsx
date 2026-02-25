"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEye, faEyeSlash, faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Tag } from "@/services/tagService";
import { LocalSite } from "@/services/siteService";
import { OperatingSystem } from "@/services/operatingSystemService";
import { paths } from "@/lib/apiv2/schema";

type DeviceNetwork = paths["/device-networks/"]["get"]["responses"]["200"]["content"]["application/json"]["devices"][number];


interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (device?: DeviceNetwork) => void;
  mode: "add" | "edit";
  device: DeviceNetwork | null;
  allTags?: Tag[];
  allSites?: LocalSite[];
  allOperatingSystems?: OperatingSystem[];
}

interface FormErrors {
  device_name?: string;
  serial_number?: string;
  device_model?: string;
  ip_address?: string;
  mac_address?: string;
}

type DeviceBody = paths["/device-networks/"]["post"]["requestBody"]["content"]["application/json"];

export default function DeviceModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  device,
  allTags = [],
  allSites = [],
  allOperatingSystems = [],
}: DeviceModalProps) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<
    DeviceBody
  >({
  } as DeviceBody);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isEnvSettingsOpen, setIsEnvSettingsOpen] = useState(true);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Auto-dismiss error alert after 10 seconds
  useEffect(() => {
    if (formError) {
      const timer = setTimeout(() => {
        setFormError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [formError]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && device) {
        // Edit mode: preload device data
        setData({
          device_name: device.device_name,
          serial_number: device.serial_number,
          device_model: device.device_model,
          type: device.type,
          status: device.status,
          ip_address: device.ip_address || "",
          mac_address: device.mac_address,
          description: device.description || "",
          local_site_id: device.local_site_id || null,
          os_id: device.os_id || null,
          node_id: device.node_id || "",
          vendor: device.vendor || "CISCO",
          management_protocol: device.management_protocol || "NETCONF",
          datapath_id: device.datapath_id || "",
          netconf_host: device.netconf_host || "",
          netconf_port: device.netconf_port || 830,
        } as DeviceBody);
        setSelectedTagIds(device.tags ? device.tags.map((t: any) => t.tag_id) : []);
      } else {
        // Add mode: reset form
        setData({
          device_name: "",
          serial_number: "",
          device_model: "",
          type: "SWITCH",
          status: "OFFLINE",
          ip_address: "",
          mac_address: "",
          description: "",
          local_site_id: null,
          os_id: null,
          node_id: "",
          vendor: "CISCO",
          management_protocol: "NETCONF",
          datapath_id: "",
          netconf_host: "",
          netconf_port: 830,
        } as DeviceBody);
        setSelectedTagIds([]);
      }
      setErrors({});
      setFormError(null);
    }
  }, [isOpen, mode, device]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!data.device_name?.trim()) {
      newErrors.device_name = "Please enter device name";
    }

    if (!data.serial_number?.trim()) {
      newErrors.serial_number = "Please enter serial number";
    }

    if (!data.device_model?.trim()) {
      newErrors.device_model = "Please enter device model";
    }

    if (!data.mac_address?.trim()) {
      newErrors.mac_address = "Please enter MAC address";
    }

    if (data.ip_address && data.ip_address.length > 50) {
      newErrors.ip_address = "IP address must not exceed 50 characters";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setFormError("Please fill in all required fields marked with *");
    } else {
      setFormError(null);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const { fetchClient } = await import("@/lib/apiv2/fetch");

      if (mode === "add") {
        const { error } = await fetchClient.POST("/device-networks/", {
          body: data,
        });
        if (error) throw error;
      } else if (mode === "edit" && device) {
        const { error } = await fetchClient.PUT("/device-networks/{device_id}", {
          params: { path: { device_id: device.id } },
          body: data,
        });
        if (error) throw error;
      }

      // Invalidate device list cache so table auto-refreshes
      queryClient.invalidateQueries({ queryKey: ["get", "/device-networks/"] });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`Error ${mode === "add" ? "creating" : "updating"} device:`, error);
      setFormError(error?.detail || error?.message || `Failed to ${mode === "add" ? "create" : "update"} device. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-900 font-sf-pro-display">
            {mode === "add" ? "Add New Device" : "Edit Device Information"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto flex-1 bg-gray-50/50 relative"
        >
          {/* Error Alert */}
          {formError && (
            <div className="sticky top-0 z-10 mb-4">
              <Alert
                variant="error"
                closable
                onClose={() => setFormError(null)}
              >
                {formError}
              </Alert>
            </div>
          )}

          {/* Basic Information Card */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <Input
              label="Device Name"
              name="device_name"
              value={data.device_name || ""}
              onChange={handleChange}
              error={errors.device_name || ""}
              disabled={isLoading}
              required
              placeholder="e.g. Core-SW-BKK"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={data.type || "SWITCH"}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sf-pro-text text-sm"
                >
                  <option value="" disabled hidden>Select type</option>
                  <option value="SWITCH">Switch</option>
                  <option value="ROUTER">Router</option>
                  <option value="FIREWALL">Firewall</option>
                  <option value="ACCESS_POINT">Access Point</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor <span className="text-red-500">*</span>
                </label>
                <select
                  name="vendor"
                  value={data.vendor || "CISCO"}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sf-pro-text text-sm"
                >
                  <option value="" disabled hidden>Select vendor</option>
                  <option value="CISCO">Cisco</option>
                  <option value="HUAWEI">Huawei</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Management Protocol <span className="text-red-500">*</span>
              </label>
              <select
                name="management_protocol"
                value={data.management_protocol || "NETCONF"}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sf-pro-text text-sm"
              >
                <option value="NETCONF">NETCONF</option>
                <option value="OPENFLOW">OpenFlow</option>
              </select>
            </div>
          </div>

          {/* Conditional Properties Card */}
          {data.management_protocol === "OPENFLOW" ? (
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                OPENFLOW PROPERTIES
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Node ID"
                  name="node_id"
                  value={data.node_id || ""}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="e.g. openflow:1"
                />
                <div>
                  <Input
                    label="Datapath ID (DPID)"
                    name="datapath_id"
                    value={data.datapath_id || ""}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="e.g. 0000000000000001"
                  />
                  <p className="text-xs text-slate-500 mt-1 ml-1 font-sf-pro-text">Optional</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                NETCONF CREDENTIALS <span className="text-red-500">*</span>
              </h3>
              <Input
                label="Node ID (ODL Name)"
                name="node_id"
                value={data.node_id || ""}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="e.g. CSR1000vT"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Host / IP Address"
                  name="netconf_host"
                  value={data.netconf_host || ""}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="e.g. 192.168.1.50"
                />
                <Input
                  label="Port"
                  name="netconf_port"
                  type="number"
                  value={data.netconf_port || "830"}
                  onChange={handleChange}
                  placeholder="e.g. 830"
                  disabled={true}
                />
              </div>
            </div>
          )}
          {/* Advanced / Hardware Settings Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 focus:outline-none transition-colors"
            >
              <div>
                <h3 className="text-sm font-bold text-gray-900 font-sf-pro-display">
                  Hardware & System Settings <span className="text-red-500">*</span>
                </h3>
                <p className="text-xs text-gray-500 font-sf-pro-text mt-0.5">Required tracking metrics and meta information</p>
              </div>
              <FontAwesomeIcon icon={isAdvancedOpen ? faChevronUp : faChevronDown} className="text-gray-400 w-4 h-4 ml-4" />
            </button>
            {isAdvancedOpen && (
              <div className="p-5 pt-0 border-t border-gray-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Serial Number"
                    name="serial_number"
                    value={data.serial_number || ""}
                    onChange={handleChange}
                    error={errors.serial_number || ""}
                    disabled={isLoading}
                    required
                    placeholder="e.g. SN123456789"
                  />
                  <Input
                    label="MAC Address"
                    name="mac_address"
                    value={data.mac_address || ""}
                    onChange={handleChange}
                    error={errors.mac_address || ""}
                    disabled={isLoading}
                    required
                    placeholder="e.g. AA:BB:CC:DD:EE:FF"
                  />
                  <Input
                    label="IP Address (Management)"
                    name="ip_address"
                    value={data.ip_address || ""}
                    onChange={handleChange}
                    error={errors.ip_address || ""}
                    disabled={isLoading}
                    placeholder="e.g. 10.0.0.1"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="status"
                      value={data.status || "OFFLINE"}
                      disabled={true}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed font-sf-pro-text"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={data.description || ""}
                    onChange={handleChange}
                    disabled={isLoading}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-sf-pro-text text-sm"
                    placeholder="Enter device description..."
                  />
                </div>

                {/* Tags */}
                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (optional)
                  </label>
                  {allTags.length === 0 ? (
                    <p className="text-xs text-gray-400 font-sf-pro-text">
                      No tags available. You can create tags in Tag Group page.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {(["tag", "group", "other"] as const).map((typeKey) => {
                        const tagsOfType = allTags.filter((t) => t.type === typeKey);
                        if (tagsOfType.length === 0) return null;
                        const typeLabel = typeKey === "tag" ? "Tag" : typeKey === "group" ? "Group" : "Other";
                        return (
                          <div key={typeKey}>
                            <div className="text-xs font-medium text-gray-500 mb-1 font-sf-pro-text">
                              {typeLabel}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {tagsOfType.map((tag) => {
                                const isSelected = selectedTagIds.includes(tag.tag_id);
                                return (
                                  <button
                                    key={tag.tag_id}
                                    type="button"
                                    onClick={() =>
                                      setSelectedTagIds((prev) =>
                                        prev.includes(tag.tag_id)
                                          ? prev.filter((id) => id !== tag.tag_id)
                                          : [...prev, tag.tag_id]
                                      )
                                    }
                                    disabled={isLoading}
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border transition-colors font-sf-pro-text ${isSelected
                                      ? "border-blue-500 bg-blue-100 text-blue-800"
                                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                                      }`}
                                  >
                                    <span
                                      className="w-2 h-2 rounded-full mr-2"
                                      style={{ backgroundColor: tag.color }}
                                    />
                                    {tag.tag_name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Environment Settings Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setIsEnvSettingsOpen(!isEnvSettingsOpen)}
              className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 focus:outline-none transition-colors"
            >
              <div>
                <h3 className="text-sm font-bold text-gray-900 font-sf-pro-display">Environment Settings</h3>
                <p className="text-xs text-gray-500 font-sf-pro-text mt-0.5">Optional configuration for site and OS details</p>
              </div>
              <FontAwesomeIcon icon={isEnvSettingsOpen ? faChevronUp : faChevronDown} className="text-gray-400 w-4 h-4 ml-4" />
            </button>
            {isEnvSettingsOpen && (
              <div className="p-5 pt-0 border-t border-gray-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Local Site
                    </label>
                    <select
                      name="local_site_id"
                      value={data.local_site_id || ""}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sf-pro-text text-sm"
                    >
                      <option value="">Select Site</option>
                      {allSites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.site_code}
                          {site.site_name ? ` - ${site.site_name}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      OS Type
                    </label>
                    <select
                      name="os_id"
                      value={data.os_id || ""}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sf-pro-text text-sm"
                    >
                      <option value="">Select OS</option>
                      {allOperatingSystems.map((os) => (
                        <option key={os.id} value={os.id}>
                          {os.os_type}{os.description ? ` - ${os.description}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Input
                  label="Device Model"
                  name="device_model"
                  value={data.device_model || ""}
                  onChange={handleChange}
                  error={errors.device_model || ""}
                  disabled={isLoading}
                  required
                  placeholder="e.g. CSR1000v"
                />
              </div>
            )}
          </div>


          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : mode === "add"
                  ? "Add Device"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div >
  );
}