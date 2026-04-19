"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchClient } from "@/lib/apiv2/fetch";
import { components } from "@/lib/apiv2/schema";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Alert,
    CircularProgress,
    Box,
    IconButton,
    Typography
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

type SubnetResponse = components["schemas"]["SubnetResponse"];
type SectionResponse = components["schemas"]["SectionResponse"];

interface SubnetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    subnet?: SubnetResponse | null;
    sectionId: string;
    parentSubnetId?: string | null;
    allSections?: SectionResponse[];
}

export default function SubnetFormModal({
    isOpen,
    onClose,
    onSuccess,
    subnet,
    sectionId,
    parentSubnetId,
    allSections = [],
}: SubnetFormModalProps) {
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [subnetAddress, setSubnetAddress] = useState("");
    const [mask, setMask] = useState("");
    const [description, setDescription] = useState("");
    const [selectedSectionId, setSelectedSectionId] = useState(sectionId);

    const isEditMode = !!subnet;

    useEffect(() => {
        if (isOpen) {
            if (subnet) {
                setSubnetAddress(subnet.subnet || "");
                setMask(subnet.mask || "");
                setDescription(subnet.description || "");
                setSelectedSectionId((subnet as any).section_id || sectionId);
            } else {
                setSubnetAddress("");
                setMask("");
                setDescription("");
                setSelectedSectionId(sectionId);
            }
            setError(null);
        }
    }, [isOpen, subnet, sectionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) return;

        setIsLoading(true);
        setError(null);

        try {
            const subnetData: any = {
                subnet: subnetAddress.trim(),
                mask: mask.trim(),
                section_id: selectedSectionId,
            };

            if (description.trim()) {
                subnetData.description = description.trim();
            }
            if (parentSubnetId) {
                subnetData.master_subnet_id = parentSubnetId;
            }

            if (isEditMode && subnet) {
                const res = await fetchClient.PATCH("/ipam/subnets/{subnet_id}", {
                    params: { path: { subnet_id: subnet.id } },
                    body: subnetData
                });
                if (res.error) throw res.error;
            } else {
                const res = await fetchClient.POST("/ipam/subnets", {
                    body: subnetData
                });
                if (res.error) throw res.error;
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save subnet");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={!isLoading ? onClose : undefined} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="h6" component="div" fontWeight="semibold">
                    {isEditMode ? "Edit Subnet" : parentSubnetId ? "Add Child Subnet" : "Add Subnet"}
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    disabled={isLoading}
                    sx={{ color: "text.secondary" }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    {error && (
                        <Alert severity="error">{error}</Alert>
                    )}
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                            label="Subnet"
                            value={subnetAddress}
                            onChange={(e) => setSubnetAddress(e.target.value)}
                            required
                            fullWidth
                            placeholder="e.g. 10.0.0.0"
                            disabled={isLoading}
                            InputLabelProps={{ sx: { '& .MuiFormLabel-asterisk': { color: 'error.main' } } }}
                        />
                        <TextField
                            label="Prefix"
                            value={mask}
                            onChange={(e) => setMask(e.target.value)}
                            required
                            fullWidth
                            placeholder="e.g. 24"
                            disabled={isLoading}
                            InputLabelProps={{ sx: { '& .MuiFormLabel-asterisk': { color: 'error.main' } } }}
                        />
                    </Box>

                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Enter description (optional)"
                        disabled={isLoading}
                    />

                    <TextField
                        select
                        label="Section"
                        value={selectedSectionId}
                        onChange={(e) => setSelectedSectionId(e.target.value)}
                        required
                        fullWidth
                        disabled={isLoading}
                        InputLabelProps={{ sx: { '& .MuiFormLabel-asterisk': { color: 'error.main' } } }}
                    >
                        {allSections.length === 0 ? (
                            <MenuItem value={sectionId}>Current Section</MenuItem>
                        ) : (
                            allSections.map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                    {s.name}
                                </MenuItem>
                            ))
                        )}
                    </TextField>

                    {parentSubnetId && (
                        <Alert severity="info">
                            This subnet will be created as a child of the parent subnet.
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={onClose} disabled={isLoading} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading || !subnetAddress.trim() || !mask.trim()}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isEditMode ? "Save Changes" : "Add Subnet"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
