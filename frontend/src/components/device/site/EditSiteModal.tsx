"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faServer, faMapMarkerAlt, faGlobe } from "@fortawesome/free-solid-svg-icons";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Button,
    TextField,
    MenuItem,
    Grid,
    Typography,
    Box,
} from "@mui/material";
import { components } from "@/lib/apiv2/schema";

type LocalSiteUpdate = components["schemas"]["LocalSiteUpdate"];
type LocalSiteResponse = components["schemas"]["LocalSiteResponse"];

interface EditSiteModalProps {
    isOpen: boolean;
    site: LocalSiteResponse | null;
    onClose: () => void;
    onSubmit: (data: LocalSiteUpdate) => Promise<void>;
}

interface FormErrors {
    site_name?: string;
    floor_number?: string;
    rack_number?: string;
    address?: string;
    address_detail?: string;
    zip_code?: string;
}

const SectionHeader = ({ step, title, description, icon }: { step: number; title: string; description: string; icon: any }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, mt: step === 1 ? 0 : 4 }}>
        <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            bgcolor: "#eff6ff", color: "#3b82f6",
            display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2
        }}>
            <FontAwesomeIcon icon={icon} style={{ fontSize: 16 }} />
        </Box>
        <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: 0.5, textTransform: "uppercase" }}>
                STEP {step}
            </Typography>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.25, fontSize: "0.95rem" }}>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                {description}
            </Typography>
        </Box>
    </Box>
);

export default function EditSiteModal({
    isOpen,
    site,
    onClose,
    onSubmit,
}: EditSiteModalProps) {
    const [formData, setFormData] = useState<LocalSiteUpdate>({});
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && site) {
            setFormData({
                site_name: site.site_name || "",
                site_type: site.site_type || "DataCenter",
                building_name: site.building_name || "",
                floor_number: site.floor_number ?? undefined,
                rack_number: site.rack_number ?? undefined,
                address: site.address || "",
                address_detail: site.address_detail || "",
                sub_district: site.sub_district || "",
                district: site.district || "",
                city: site.city || "",
                zip_code: site.zip_code || "",
                country: site.country || "",
            });
            setErrors({});
        }
    }, [isOpen, site]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

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

        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (formData.site_name && formData.site_name.length > 200) {
            newErrors.site_name = "Site name must not exceed 200 characters";
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

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error("Error updating site:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!site) return null;

    return (
        <Dialog open={isOpen} onClose={!isLoading ? onClose : undefined} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: "#007bff", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FontAwesomeIcon icon={faServer} style={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                            Edit Site Information
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Update the site details across all sections below.
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    disabled={isLoading}
                    sx={{ color: "text.secondary", position: "absolute", right: 16, top: 16 }}
                >
                    <FontAwesomeIcon icon={faTimes} style={{ width: 16 }} />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 4, bgcolor: "#f8fafc" }}>
                <Box component="form" id="edit-site-form" onSubmit={handleSubmit} noValidate sx={{ bgcolor: "white", p: 4, borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
                    {/* STEP 1: Base Information */}
                    <SectionHeader
                        step={1}
                        title="Base Information"
                        description="Primary identifiers for this site"
                        icon={faServer}
                    />
                    <Grid container spacing={3} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Site Code"
                                name="site_code"
                                value={site.site_code || ""}
                                disabled
                                fullWidth
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Site Name"
                                name="site_name"
                                value={formData.site_name || ""}
                                onChange={handleChange}
                                error={!!errors.site_name}
                                helperText={errors.site_name}
                                required
                                fullWidth
                                disabled={isLoading}
                                placeholder="e.g. Main Data Center"
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                select
                                label="Site Type"
                                name="site_type"
                                value={formData.site_type || "DataCenter"}
                                onChange={handleChange}
                                required
                                fullWidth
                                disabled={isLoading}
                                slotProps={{ inputLabel: { shrink: true } }}
                            >
                                <MenuItem value="DataCenter">Data Center</MenuItem>
                                <MenuItem value="BRANCH">Branch</MenuItem>
                                <MenuItem value="OTHER">Other</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>

                    {/* STEP 2: Location Details */}
                    <SectionHeader
                        step={2}
                        title="Location Details"
                        description="Physical location within the facility"
                        icon={faMapMarkerAlt}
                    />
                    <Grid container spacing={3} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Building Name"
                                name="building_name"
                                value={formData.building_name || ""}
                                onChange={handleChange}
                                fullWidth
                                disabled={isLoading}
                                placeholder="e.g. Tower A"
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Floor Number"
                                name="floor_number"
                                type="number"
                                value={formData.floor_number ?? ""}
                                onChange={handleChange}
                                error={!!errors.floor_number}
                                helperText={errors.floor_number}
                                fullWidth
                                disabled={isLoading}
                                placeholder="e.g. 12"
                                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: 0 } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Rack Number"
                                name="rack_number"
                                type="number"
                                value={formData.rack_number ?? ""}
                                onChange={handleChange}
                                error={!!errors.rack_number}
                                helperText={errors.rack_number}
                                fullWidth
                                disabled={isLoading}
                                placeholder="e.g. R-042"
                                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: 0 } }}
                            />
                        </Grid>
                    </Grid>

                    {/* STEP 3: Address */}
                    <SectionHeader
                        step={3}
                        title="Address"
                        description="Full mailing and geographic address"
                        icon={faGlobe}
                    />
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Address"
                                name="address"
                                value={formData.address || ""}
                                onChange={handleChange}
                                error={!!errors.address}
                                helperText={errors.address}
                                required
                                fullWidth
                                disabled={isLoading}
                                placeholder="Street address"
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Address Detail"
                                name="address_detail"
                                value={formData.address_detail || ""}
                                onChange={handleChange}
                                error={!!errors.address_detail}
                                helperText={errors.address_detail}
                                fullWidth
                                disabled={isLoading}
                                placeholder="Apt, suite, unit, etc."
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Sub District"
                                name="sub_district"
                                value={formData.sub_district || ""}
                                onChange={handleChange}
                                fullWidth
                                disabled={isLoading}
                                placeholder="Sub district"
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="District"
                                name="district"
                                value={formData.district || ""}
                                onChange={handleChange}
                                fullWidth
                                disabled={isLoading}
                                placeholder="District"
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="City"
                                name="city"
                                value={formData.city || ""}
                                onChange={handleChange}
                                required
                                fullWidth
                                disabled={isLoading}
                                placeholder="City"
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Zip Code"
                                name="zip_code"
                                value={formData.zip_code || ""}
                                onChange={handleChange}
                                error={!!errors.zip_code}
                                helperText={errors.zip_code}
                                required
                                fullWidth
                                disabled={isLoading}
                                placeholder="Zip / Postal code"
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                select
                                label="Country"
                                name="country"
                                value={formData.country || ""}
                                onChange={handleChange}
                                required
                                fullWidth
                                disabled={isLoading}
                                placeholder="Select country"
                                slotProps={{ inputLabel: { shrink: true } }}
                            >
                                <MenuItem value="">Select country</MenuItem>
                                <MenuItem value="Thailand">Thailand</MenuItem>
                                <MenuItem value="Singapore">Singapore</MenuItem>
                                <MenuItem value="Malaysia">Malaysia</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: "#f8fafc", borderTop: "1px solid", borderColor: "grey.200" }}>
                <Button onClick={onClose} disabled={isLoading} variant="outlined" color="inherit" sx={{ bgcolor: "white" }}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="edit-site-form"
                    disabled={isLoading}
                    variant="contained"
                    sx={{ boxShadow: "none", bgcolor: "#007bff" }}
                >
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
