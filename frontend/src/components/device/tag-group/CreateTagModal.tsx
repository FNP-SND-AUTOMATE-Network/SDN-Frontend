"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Button,
    TextField,
    MenuItem,
    Typography,
    Box,
    Stack,
} from "@mui/material";
import { components } from "@/lib/apiv2/schema";

type TagCreate = components["schemas"]["TagCreate"];

interface CreateTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TagCreate) => Promise<void>;
}

interface FormErrors {
    tag_name?: string;
    description?: string;
    color?: string;
}

export default function CreateTagModal({
    isOpen,
    onClose,
    onSubmit,
}: CreateTagModalProps) {
    const defaultFormData: TagCreate = {
        tag_name: "",
        description: "",
        type: "other",
        color: "#3B82F6",
    };

    const [formData, setFormData] = useState<TagCreate>(defaultFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(defaultFormData);
            setErrors({});
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value === "" ? null : value,
        }));

        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.tag_name?.trim()) {
            newErrors.tag_name = "Please enter tag name";
        } else if (formData.tag_name.length > 100) {
            newErrors.tag_name = "Tag name must not exceed 100 characters";
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = "Description must not exceed 500 characters";
        }

        if (formData.color && !/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
            newErrors.color = "Invalid color format (use #RRGGBB)";
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
            console.error("Error submitting tag:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={!isLoading ? onClose : undefined} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "bold" }}>
                Add New Tag
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    disabled={isLoading}
                    sx={{ color: "text.secondary" }}
                >
                    <FontAwesomeIcon icon={faTimes} style={{ width: 16 }} />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Box component="form" id="create-tag-form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        label="Tag Name"
                        name="tag_name"
                        value={formData.tag_name || ""}
                        onChange={handleChange}
                        error={!!errors.tag_name}
                        helperText={errors.tag_name}
                        required
                        fullWidth
                        disabled={isLoading}
                        placeholder="e.g. Production, Development"
                    />

                    <TextField
                        label="Description"
                        name="description"
                        value={formData.description || ""}
                        onChange={handleChange}
                        error={!!errors.description}
                        helperText={errors.description}
                        fullWidth
                        multiline
                        rows={3}
                        disabled={isLoading}
                        placeholder="Enter tag description..."
                    />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                        <TextField
                            select
                            label="Type"
                            name="type"
                            value={formData.type || "other"}
                            onChange={handleChange}
                            required
                            fullWidth
                            disabled={isLoading}
                        >
                            <MenuItem value="tag">Tag</MenuItem>
                            <MenuItem value="group">Group</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </TextField>

                        <Box sx={{ width: '100%', display: 'flex', gap: 2, alignItems: 'center' }}>
                            <input
                                type="color"
                                name="color"
                                value={formData.color}
                                onChange={handleChange as any}
                                disabled={isLoading}
                                style={{
                                    height: 56,
                                    width: 60,
                                    borderRadius: 4,
                                    border: '1px solid #c4c4c4',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    flexShrink: 0,
                                }}
                            />
                            <TextField
                                label="Color Hex"
                                name="color"
                                value={formData.color || ""}
                                onChange={handleChange}
                                error={!!errors.color}
                                helperText={errors.color}
                                fullWidth
                                disabled={isLoading}
                                placeholder="#3B82F6"
                            />
                        </Box>
                    </Stack>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={isLoading} variant="outlined" color="inherit">
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="create-tag-form"
                    disabled={isLoading}
                    variant="contained"
                    sx={{ boxShadow: "none" }}
                >
                    {isLoading ? "Adding..." : "Add Tag"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
