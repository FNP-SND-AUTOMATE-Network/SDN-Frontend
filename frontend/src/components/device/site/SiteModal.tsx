"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  LocalSite,
  LocalSiteCreateRequest,
  LocalSiteUpdateRequest,
  SiteType,
} from "@/services/siteService";

interface SiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "add" | "edit";
  site?: LocalSite | null;
  onSubmit: (
    data: LocalSiteCreateRequest | LocalSiteUpdateRequest
  ) => Promise<void>;
}

interface FormErrors {
  site_code?: string;
  site_name?: string;
  site_type?: string;
  building_name?: string;
  floor_number?: string;
  rack_number?: string;
  address?: string;
  address_detail?: string;
  sub_district?: string;
  district?: string;
  city?: string;
  zip_code?: string;
  country?: string;
}

export default function SiteModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  site,
  onSubmit,
}: SiteModalProps) {
  const [formData, setFormData] = useState<LocalSiteCreateRequest>({
    site_code: "",
    site_name: "",
    site_type: "DataCenter",
    building_name: "",
    floor_number: undefined,
    rack_number: undefined,
    address: "",
    address_detail: "",
    sub_district: "",
    district: "",
    city: "",
    zip_code: "",
    country: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Reset form เมื่อเปิด modal
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && site) {
        setFormData({
          site_code: site.site_code || "",
          site_name: site.site_name || "",
          site_type: site.site_type || "DataCenter",
          building_name: site.building_name || "",
          floor_number: site.floor_number || undefined,
          rack_number: site.rack_number || undefined,
          address: site.address || "",
          address_detail: site.address_detail || "",
          sub_district: site.sub_district || "",
          district: site.district || "",
          city: site.city || "",
          zip_code: site.zip_code || "",
          country: site.country || "",
        });
      } else {
        setFormData({
          site_code: "",
          site_name: "",
          site_type: "DataCenter",
          building_name: "",
          floor_number: undefined,
          rack_number: undefined,
          address: "",
          address_detail: "",
          sub_district: "",
          district: "",
          city: "",
          zip_code: "",
          country: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, site]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle number fields
    if (name === "floor_number" || name === "rack_number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : parseInt(value, 10),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : value,
      }));
    }

    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.site_code?.trim()) {
      newErrors.site_code = "Please enter site code";
    } else if (formData.site_code.length > 50) {
      newErrors.site_code = "Site code must not exceed 50 characters";
    }

    if (formData.site_name && formData.site_name.length > 200) {
      newErrors.site_name = "Site name must not exceed 200 characters";
    }

    if (formData.building_name && formData.building_name.length > 200) {
      newErrors.building_name = "Building name must not exceed 200 characters";
    }

    if (
      formData.floor_number !== undefined &&
      formData.floor_number !== null &&
      formData.floor_number < 0
    ) {
      newErrors.floor_number = "Floor number must not be less than 0";
    }

    if (
      formData.rack_number !== undefined &&
      formData.rack_number !== null &&
      formData.rack_number < 0
    ) {
      newErrors.rack_number = "Rack number must not be less than 0";
    }

    if (formData.address && formData.address.length > 500) {
      newErrors.address = "Address must not exceed 500 characters";
    }

    if (formData.address_detail && formData.address_detail.length > 500) {
      newErrors.address_detail = "Address detail must not exceed 500 characters";
    }

    if (formData.zip_code && formData.zip_code.length > 10) {
      newErrors.zip_code = "Zip code must not exceed 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting site:", error);
      // Error จะถูก handle โดย parent component
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-900 font-sf-pro-display">
            {mode === "add" ? "Add New Site" : "Edit Site Information"}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 font-sf-pro-display">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Site Code"
                  name="site_code"
                  value={formData.site_code || ""}
                  onChange={handleChange}
                  error={errors.site_code || ""}
                  required
                  disabled={isLoading || mode === "edit"}
                  placeholder="e.g. DC-001"
                />
              </div>
              <div>
                <Input
                  label="Site Name"
                  name="site_name"
                  value={formData.site_name || ""}
                  onChange={handleChange}
                  error={errors.site_name || ""}
                  disabled={isLoading}
                  placeholder="e.g. Data Center Bangkok"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="site_type"
                  value={formData.site_type}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="DataCenter">Data Center</option>
                  <option value="BRANCH">Branch</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 font-sf-pro-display">
              Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Building Name"
                  name="building_name"
                  value={formData.building_name || ""}
                  onChange={handleChange}
                  error={errors.building_name || ""}
                  disabled={isLoading}
                  placeholder="e.g. Building A"
                />
              </div>
              <div>
                <Input
                  label="Floor Number"
                  name="floor_number"
                  type="number"
                  value={
                    formData.floor_number !== undefined &&
                    formData.floor_number !== null
                      ? formData.floor_number
                      : ""
                  }
                  onChange={handleChange}
                  error={errors.floor_number || ""}
                  disabled={isLoading}
                  placeholder="e.g. 3"
                  min="0"
                />
              </div>
              <div>
                <Input
                  label="Rack Number"
                  name="rack_number"
                  type="number"
                  value={
                    formData.rack_number !== undefined &&
                    formData.rack_number !== null
                      ? formData.rack_number
                      : ""
                  }
                  onChange={handleChange}
                  error={errors.rack_number || ""}
                  disabled={isLoading}
                  placeholder="e.g. 12"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 font-sf-pro-display">
              Address
            </h3>
            <div className="space-y-4">
              <div>
                <Input
                  label="Address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  error={errors.address || ""}
                  disabled={isLoading}
                  placeholder="e.g. 123/45 Sukhumvit Road"
                />
              </div>
              <div>
                <Input
                  label="Address Details"
                  name="address_detail"
                  value={formData.address_detail || ""}
                  onChange={handleChange}
                  error={errors.address_detail || ""}
                  disabled={isLoading}
                  placeholder="e.g. Near BTS Asok"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Sub District"
                    name="sub_district"
                    value={formData.sub_district || ""}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="e.g. Khlong Toei"
                  />
                </div>
                <div>
                  <Input
                    label="District"
                    name="district"
                    value={formData.district || ""}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="e.g. Khlong Toei"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Input
                    label="City/Province"
                    name="city"
                    value={formData.city || ""}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="e.g. Bangkok"
                  />
                </div>
                <div>
                  <Input
                    label="Zip Code"
                    name="zip_code"
                    value={formData.zip_code || ""}
                    onChange={handleChange}
                    error={errors.zip_code || ""}
                    disabled={isLoading}
                    placeholder="e.g. 10110"
                  />
                </div>
                <div>
                  <Input
                    label="Country"
                    name="country"
                    value={formData.country || ""}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="e.g. Thailand"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-gray-200">
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
                  ? "Add Site"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

