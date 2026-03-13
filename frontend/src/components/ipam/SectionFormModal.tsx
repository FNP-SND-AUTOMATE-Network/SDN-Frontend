"use client";

import React, { useState, useEffect } from "react";
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
    IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { fetchClient } from "@/lib/apiv2/fetch";
import { paths, components } from "@/lib/apiv2/schema";

type SectionResponse = components["schemas"]["SectionResponse"];

interface SectionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    section?: SectionResponse | null; // For edit mode
    parentSectionId?: string | null; // Pre-selected parent for new sub-section
    allSections?: SectionResponse[]; // All sections for parent dropdown
}

export default function SectionFormModal({
    isOpen,
    onClose,
    onSuccess,
    section,
    parentSectionId,
    allSections = [],
}: SectionFormModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [masterSection, setMasterSection] = useState<string>("");

    const isEditMode = !!section;

    // Reset form when modal opens/closes or section changes
    useEffect(() => {
        if (isOpen) {
            if (section) {
                setName(section.name || "");
                setDescription(section.description || "");
                setMasterSection(section.master_section || "");
            } else {
                setName("");
                setDescription("");
                setMasterSection(parentSectionId || "");
            }
            setError(null);
        }
    }, [isOpen, section, parentSectionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        setError(null);

        try {
            const sectionData = {
                name: name.trim(),
                description: description.trim() || null,
                master_section: masterSection || null,
            };

            if (isEditMode && section) {
                const res = await fetchClient.PATCH("/ipam/sections/{section_id}", {
                    params: { path: { section_id: section.id } },
                    body: sectionData as any
                });
                if (res.error) throw res.error;
            } else {
                const res = await fetchClient.POST("/ipam/sections", {
                    body: sectionData as any
                });
                if (res.error) throw res.error;
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save section");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    // Filter out current section from parent options (can't be parent of itself)
    const availableParentSections = allSections.filter(
        (s) => s.id !== section?.id
    );

    return (
        <Dialog open={isOpen} onClose={!isLoading ? onClose : undefined} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {isEditMode ? "Edit Section" : "Add Section"}
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        type="text"
                        fullWidth
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter section name"
                    />

                    <TextField
                        margin="dense"
                        id="description"
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description (optional)"
                    />

                    <TextField
                        id="masterSection"
                        select
                        label="Parent Section"
                        value={masterSection}
                        onChange={(e) => setMasterSection(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="">
                            <em>-- No Parent (Root Section) --</em>
                        </MenuItem>
                        {availableParentSections.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                                {s.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={onClose} color="inherit" disabled={isLoading} sx={{ textTransform: "none", fontWeight: 500 }}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading || !name.trim()}
                        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
                        sx={{ textTransform: "none", fontWeight: 500, boxShadow: "none" }}
                    >
                        {isEditMode ? "Save Changes" : "Add Section"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
