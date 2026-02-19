"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  DeviceNetwork,
  DeviceNetworkCreateRequest,
  DeviceNetworkUpdateRequest,
  TypeDevice,
  StatusDevice,
} from "@/services/deviceNetworkService";
import { Tag } from "@/services/tagService";
import { LocalSite } from "@/services/siteService";
import { OperatingSystem } from "@/services/operatingSystemService";

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (device: DeviceNetwork) => void;
  mode: "add" | "edit";
  device: DeviceNetwork | null;
  onSubmit: (
    data: DeviceNetworkCreateRequest | DeviceNetworkUpdateRequest,
    tagIds: string[]
  ) => Promise<DeviceNetwork>;
  allTags: Tag[];
  allSites: LocalSite[];
  allOperatingSystems: OperatingSystem[];
}

interface FormErrors {
  device_name?: string;
  serial_number?: string;
  device_model?: string;
  ip_address?: string;
  mac_address?: string;
}

export default function DeviceModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  device,
  onSubmit,
  allTags,
  allSites,
  allOperatingSystems,
}: DeviceModalProps) {
  const [formData, setFormData] = useState<
    DeviceNetworkCreateRequest | DeviceNetworkUpdateRequest
  >({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-dismiss error alert after 10 seconds
  useEffect(() => {
    if (formError) {
      const timer = setTimeout(() => {
        setFormError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [formError]);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && device) {
        // Edit mode: preload device data
        setFormData({
          device_name: device.device_name,
          serial_number: device.serial_number,
          device_model: device.device_model,
          type: device.type as TypeDevice,
          status: device.status as StatusDevice,
          ip_address: device.ip_address || "",
          mac_address: device.mac_address,
          description: device.description || "",
          local_site_id: device.local_site_id || null,
          os_id: device.os_id || null,
          node_id: device.node_id || "",
          netconf_host: device.netconf_host || "",
        });
        setSelectedTagIds(device.tags ? device.tags.map((t) => t.tag_id) : []);
      } else {
        // Add mode: reset form
        setFormData({
          device_name: "",
          serial_number: "",
          device_model: "",
          type: "SWITCH",
          status: "ONLINE",
          ip_address: "",
          mac_address: "",
          description: "",
          local_site_id: null,
          os_id: null,
          node_id: "",
          netconf_host: "",
        });
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
    setFormData((prev) => ({
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

    if (!formData.device_name?.trim()) {
      newErrors.device_name = "Please enter device name";
    }

    if (!formData.serial_number?.trim()) {
      newErrors.serial_number = "Please enter serial number";
    }

    if (!formData.device_model?.trim()) {
      newErrors.device_model = "Please enter device model";
    }

    if (!formData.mac_address?.trim()) {
      newErrors.mac_address = "Please enter MAC address";
    }

    if (formData.ip_address && formData.ip_address.length > 50) {
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
      const result = await onSubmit(formData, selectedTagIds);
      onSuccess(result);
      onClose();
    } catch (error: any) {
      console.error(`Error ${mode === "add" ? "creating" : "updating"} device:`, error);
      setFormError(error?.message || `Failed to ${mode === "add" ? "create" : "update"} device. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
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
          className="p-6 space-y-6 overflow-y-auto flex-1"
        >
          {/* Error Alert */}
          {formError && (
            <Alert
              variant="error"
              closable
              onClose={() => setFormError(null)}
            >
              {formError}
            </Alert>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 font-sf-pro-display">
              Basic Info.
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Device Name"
                name="device_name"
                value={formData.device_name || ""}
                onChange={handleChange}
                error={errors.device_name || ""}
                disabled={isLoading}
                required
                placeholder="e.g. Core Switch HQ"
              />
              <Input
                label="Serial Number"
                name="serial_number"
                value={formData.serial_number || ""}
                onChange={handleChange}
                error={errors.serial_number || ""}
                disabled={isLoading}
                required
                placeholder="e.g. SN123456789"
              />
              <Input
                label="Device Model"
                name="device_model"
                value={formData.device_model || ""}
                onChange={handleChange}
                error={errors.device_model || ""}
                disabled={isLoading}
                required
                placeholder="e.g. C9300-24T"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type || "SWITCH"}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-sf-pro-text"
                >
                  <option value="SWITCH">Switch</option>
                  <option value="ROUTER">Router</option>
                  <option value="FIREWALL">Firewall</option>
                  <option value="ACCESS_POINT">Access Point</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status || "ONLINE"}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-sf-pro-text"
                >
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Network & Site */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 font-sf-pro-display">
              Network & Site
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="IP Address"
                name="ip_address"
                value={formData.ip_address || ""}
                onChange={handleChange}
                error={errors.ip_address || ""}
                disabled={isLoading}
                placeholder="e.g. 10.0.0.1"
              />
              <Input
                label="MAC Address"
                name="mac_address"
                value={formData.mac_address || ""}
                onChange={handleChange}
                error={errors.mac_address || ""}
                disabled={isLoading}
                required
                placeholder="e.g. AA:BB:CC:DD:EE:FF"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local Site
                </label>
                <select
                  name="local_site_id"
                  value={formData.local_site_id || ""}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-sf-pro-text"
                >
                  <option value="">No site</option>
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
                  Operating System
                </label>
                <select
                  name="os_id"
                  value={formData.os_id || ""}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-sf-pro-text"
                >
                  <option value="">No OS</option>
                  {allOperatingSystems.map((os) => (
                    <option key={os.id} value={os.id}>
                      {os.os_type}{os.description ? ` - ${os.description}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Opendaylight Info. */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 font-sf-pro-display">
              Opendaylight Info.
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Node ID"
                name="node_id"
                value={formData.node_id || ""}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="e.g. CSR1000vT"
              />
              <Input
                label="IP Address (ODL)"
                name="netconf_host"
                value={formData.netconf_host || ""}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="e.g. 192.168.1.1"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-sf-pro-text"
              placeholder="Enter device description..."
            />
          </div>

          {/* Tags */}
          <div>
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

                  const typeLabel =
                    typeKey === "tag"
                      ? "Tag"
                      : typeKey === "group"
                        ? "Group"
                        : "Other";

                  return (
                    <div key={typeKey}>
                      <div className="text-xs font-medium text-gray-500 mb-1 font-sf-pro-text">
                        {typeLabel}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tagsOfType.map((tag) => {
                          const isSelected = selectedTagIds.includes(
                            tag.tag_id
                          );
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
    </div>
  );
}