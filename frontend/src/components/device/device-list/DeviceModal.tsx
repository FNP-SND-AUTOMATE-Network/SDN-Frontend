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
import { fetchClient } from "@/lib/apiv2/fetch";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  Collapse,
  Typography,
  IconButton,
  Select,
  MenuItem,
  SelectChangeEvent
} from "@mui/material";

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
    > | SelectChangeEvent<unknown>
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
    <Dialog
      open={isOpen}
      onClose={!isLoading ? onClose : undefined}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" component="div" fontWeight={600} fontFamily="font-family: 'SF Pro Display'">
          {mode === "add" ? "Add New Device" : "Edit Device Information"}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={isLoading}
          sx={{ color: "text.secondary" }}
        >
          <FontAwesomeIcon icon={faTimes} style={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}>
        <DialogContent dividers sx={{ p: 3, bgcolor: "grey.50", overflowY: "auto" }}>
          {formError && (
            <Box sx={{ mb: 3 }}>
              <Alert variant="error" closable onClose={() => setFormError(null)}>
                {formError}
              </Alert>
            </Box>
          )}

          <Stack spacing={3}>
            {/* Basic Information Card */}
            <Box sx={{ bgcolor: "background.paper", p: 3, borderRadius: 2, border: 1, borderColor: "grey.200", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
              <Stack spacing={2.5}>
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
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500} color="text.primary" mb={0.5}>
                      Device Type <Box component="span" color="error.main">*</Box>
                    </Typography>
                    <Select
                      name="type"
                      value={data.type || "SWITCH"}
                      onChange={handleChange}
                      displayEmpty
                      sx={{ width: "100%" }}
                    >
                      <MenuItem disabled hidden>Select type</MenuItem>
                      <MenuItem value="SWITCH">Switch</MenuItem>
                      <MenuItem value="ROUTER">Router</MenuItem>
                      <MenuItem value="FIREWALL">Firewall</MenuItem>
                      <MenuItem value="ACCESS_POINT">Access Point</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </Select>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500} color="text.primary" mb={0.5}>
                      Vendor <Box component="span" color="error.main">*</Box>
                    </Typography>
                    <Select
                      name="vendor"
                      value={data.vendor || "CISCO"}
                      onChange={handleChange}
                      disabled={isLoading}
                      sx={{ width: "100%" }}
                    >
                      <MenuItem disabled hidden>Select vendor</MenuItem>
                      <MenuItem value="CISCO">Cisco</MenuItem>
                      <MenuItem value="HUAWEI">Huawei</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </Select>
                  </Box>
                </Stack>
                <Box>
                  <Typography variant="body2" fontWeight={500} color="text.primary" mb={0.5}>
                    Management Protocol <Box component="span" color="error.main">*</Box>
                  </Typography>
                  <Select
                    name="management_protocol"
                    value={data.management_protocol || "NETCONF"}
                    onChange={handleChange}
                    disabled={isLoading}
                    sx={{ width: "100%" }}
                  >
                    <MenuItem disabled hidden>Select management protocol</MenuItem>
                    <MenuItem value="NETCONF">NETCONF</MenuItem>
                    <MenuItem value="OPENFLOW">OpenFlow</MenuItem>
                  </Select>
                </Box>
              </Stack>
            </Box>

            {/* Conditional Properties Card */}
            {data.management_protocol === "OPENFLOW" ? (
              <Box sx={{ bgcolor: "background.paper", p: 3, borderRadius: 2, border: 1, borderColor: "grey.200", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
                <Typography variant="overline" color="text.secondary" fontWeight={600} display="block" mb={2}>
                  OPENFLOW PROPERTIES
                </Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Input
                      label="Node ID"
                      name="node_id"
                      value={data.node_id || ""}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder="e.g. openflow:1"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Input
                      label="Datapath ID (DPID)"
                      name="datapath_id"
                      value={data.datapath_id || ""}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder="e.g. 0000000000000001"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, mt: 0.5, display: 'block' }}>Optional</Typography>
                  </Box>
                </Stack>
              </Box>
            ) : (
              <Box sx={{ bgcolor: "background.paper", p: 3, borderRadius: 2, border: 1, borderColor: "grey.200", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
                <Typography variant="overline" color="text.secondary" fontWeight={600} display="block" mb={2}>
                  NETCONF CREDENTIALS <Box component="span" color="error.main">*</Box>
                </Typography>
                <Stack spacing={2.5}>
                  <Input
                    label="Node ID (ODL Name)"
                    name="node_id"
                    value={data.node_id || ""}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="e.g. CSR1000vT"
                  />
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Input
                        label="Host / IP Address"
                        name="netconf_host"
                        value={data.netconf_host || ""}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="e.g. 192.168.1.50"
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Input
                        label="Port"
                        name="netconf_port"
                        type="number"
                        value={data.netconf_port || "830"}
                        onChange={handleChange}
                        placeholder="e.g. 830"
                        disabled={true}
                      />
                    </Box>
                  </Stack>
                </Stack>
              </Box>
            )}

            {/* Advanced / Hardware Settings Card */}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, border: 1, borderColor: "grey.200", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", overflow: 'hidden' }}>
              <Box
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', "&:hover": { bgcolor: "grey.50" } }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Hardware & System Settings <Box component="span" color="error.main">*</Box>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Required tracking metrics and meta information</Typography>
                </Box>
                <FontAwesomeIcon icon={isAdvancedOpen ? faChevronUp : faChevronDown} style={{ color: "grey", fontSize: 14 }} />
              </Box>

              <Collapse in={isAdvancedOpen}>
                <Box sx={{ p: 2.5, pt: 0, borderTop: 1, borderColor: "grey.100" }}>
                  <Stack spacing={2.5} mt={2}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <Box sx={{ flex: 1 }}>
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
                      </Box>
                      <Box sx={{ flex: 1 }}>
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
                      </Box>
                    </Stack>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <Box sx={{ flex: 1 }}>
                        <Input
                          label="IP Address (Management)"
                          name="ip_address"
                          value={data.ip_address || ""}
                          onChange={handleChange}
                          error={errors.ip_address || ""}
                          disabled={isLoading}
                          placeholder="e.g. 10.0.0.1"
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500} color="text.primary" mb={0.5}>
                          Status <Box component="span" color="error.main">*</Box>
                        </Typography>
                        <Input
                          type="text"
                          name="status"
                          value={data.status || "OFFLINE"}
                          disabled={true}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed font-sf-pro-text"
                        />
                      </Box>
                    </Stack>

                    <Box>
                      <Typography variant="body2" fontWeight={500} color="text.primary" mb={0.5}>Description</Typography>
                      <textarea
                        name="description"
                        value={data.description || ""}
                        onChange={handleChange}
                        disabled={isLoading}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-sf-pro-text text-sm"
                        placeholder="Enter device description..."
                      />
                    </Box>

                    {/* Tags */}
                    <Box>
                      <Typography variant="body2" fontWeight={500} color="text.primary" mb={1}>Tags (optional)</Typography>
                      {allTags.length === 0 ? (
                        <Typography variant="caption" color="text.secondary">No tags available. You can create tags in Tag Group page.</Typography>
                      ) : (
                        <Stack spacing={1.5}>
                          {(["tag", "group", "other"] as const).map((typeKey) => {
                            const tagsOfType = allTags.filter((t) => t.type === typeKey);
                            if (tagsOfType.length === 0) return null;
                            const typeLabel = typeKey === "tag" ? "Tag" : typeKey === "group" ? "Group" : "Other";
                            return (
                              <Box key={typeKey}>
                                <Typography variant="caption" fontWeight={500} color="text.secondary" display="block" mb={0.5}>{typeLabel}</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {tagsOfType.map((tag) => {
                                    const isSelected = selectedTagIds.includes(tag.tag_id);
                                    return (
                                      <Box
                                        component="button"
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
                                        sx={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          px: 1.5,
                                          py: 0.5,
                                          borderRadius: 5,
                                          fontSize: '0.75rem',
                                          fontWeight: 500,
                                          border: '1px solid',
                                          transition: 'all 0.2s',
                                          cursor: isLoading ? 'not-allowed' : 'pointer',
                                          borderColor: isSelected ? 'primary.main' : 'grey.300',
                                          bgcolor: isSelected ? 'primary.50' : 'background.paper',
                                          color: isSelected ? 'primary.dark' : 'text.primary',
                                          "&:hover": {
                                            borderColor: !isSelected && !isLoading ? 'primary.light' : undefined,
                                            bgcolor: !isSelected && !isLoading ? 'primary.50' : undefined,
                                          }
                                        }}
                                      >
                                        <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', mr: 1, bgcolor: tag.color }} />
                                        {tag.tag_name}
                                      </Box>
                                    );
                                  })}
                                </Box>
                              </Box>
                            );
                          })}
                        </Stack>
                      )}
                    </Box>

                  </Stack>
                </Box>
              </Collapse>
            </Box>

            {/* Environment Settings Card */}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, border: 1, borderColor: "grey.200", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", overflow: 'hidden' }}>
              <Box
                onClick={() => setIsEnvSettingsOpen(!isEnvSettingsOpen)}
                sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', "&:hover": { bgcolor: "grey.50" } }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>Environment Settings</Typography>
                  <Typography variant="caption" color="text.secondary">Optional configuration for site and OS details</Typography>
                </Box>
                <FontAwesomeIcon icon={isEnvSettingsOpen ? faChevronUp : faChevronDown} style={{ color: "grey", fontSize: 14 }} />
              </Box>

              <Collapse in={isEnvSettingsOpen}>
                <Box sx={{ p: 2.5, pt: 0, borderTop: 1, borderColor: "grey.100" }}>
                  <Stack spacing={2.5} mt={2}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500} color="text.primary" mb={0.5}>Local Site</Typography>
                        <Select
                          name="local_site_id"
                          value={data.local_site_id || ""}
                          onChange={handleChange}
                          disabled={isLoading}
                          sx={{ width: "100%" }}
                          displayEmpty
                        >
                          <MenuItem value="" disabled hidden>Select Site</MenuItem>
                          {allSites.map((site) => (
                            <MenuItem key={site.id} value={site.id}>
                              {site.site_code}
                              {site.site_name ? ` - ${site.site_name}` : ""}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500} color="text.primary" mb={0.5}>OS Type</Typography>
                        <Select
                          name="os_id"
                          value={data.os_id || ""}
                          onChange={handleChange}
                          disabled={isLoading}
                          sx={{ width: "100%" }}
                          displayEmpty
                        >
                          <MenuItem value="" disabled hidden>Select OS</MenuItem>
                          {allOperatingSystems.map((os) => (
                            <MenuItem key={os.id} value={os.id}>
                              {os.os_type}{os.description ? ` - ${os.description}` : ''}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                    </Stack>
                    <Box>
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
                    </Box>
                  </Stack>
                </Box>
              </Collapse>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
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
        </DialogActions>
      </form>
    </Dialog>
  );
}
