"use client";

import React, { useState, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faUpload,
    faEdit,
    faFile,
} from "@fortawesome/free-solid-svg-icons";
import {
    configurationTemplateService,
    TemplateType,
} from "@/services/configurationTemplateService";
import { useAuth } from "@/contexts/AuthContext";
import { $api } from "@/lib/apiv2/fetch";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Typography,
    Box,
    IconButton,
    Chip,
    Paper,
    Stack,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";

interface CreateTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultMode?: "upload" | "write";
}

const TEMPLATE_TYPES: { value: TemplateType; label: string }[] = [
    { value: "NETWORK", label: "Network" },
    { value: "SECURITY", label: "Security" },
    { value: "OTHER", label: "Other" },
];

export default function CreateTemplateModal({
    isOpen,
    onClose,
    onSuccess,
    defaultMode = "write",
}: CreateTemplateModalProps) {
    const { token } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const { snackbar, showError, hideSnackbar } = useSnackbar();

    // Form state
    const [templateName, setTemplateName] = useState("");
    const [description, setDescription] = useState("");
    const [templateType, setTemplateType] = useState<TemplateType>("NETWORK");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [mode, setMode] = useState<"upload" | "write">(defaultMode);

    // Content state
    const [configContent, setConfigContent] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    // Fetch tags via React Query
    const { data: tagsData, isLoading: isLoadingTags } = $api.useQuery(
        "get",
        "/tags/",
        {
            params: {
                query: {
                    page: 1,
                    page_size: 100,
                },
            },
        },
        {
            enabled: !!token && isOpen,
        }
    );

    const tags = tagsData?.tags || [];

    // Template Creation Mutation
    const createMutation = useMutation({
        mutationFn: async (content: string | File) => {
            if (!token) throw new Error("No token");
            return configurationTemplateService.createTemplate(
                token,
                {
                    template_name: templateName.trim(),
                    description: description.trim() || null,
                    template_type: templateType,
                    tag_name: selectedTags.length > 0 ? selectedTags.join(",") : null,
                },
                content
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get", "/configuration-templates/"] });
            onSuccess();
            handleClose();
        },
        onError: (error: any) => {
            showError(error instanceof Error ? error.message : "Failed to create template");
        }
    });

    const resetForm = () => {
        setTemplateName("");
        setDescription("");
        setTemplateType("NETWORK");
        setSelectedTags([]);
        setConfigContent("");
        setSelectedFile(null);
        createMutation.reset();
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith("text/") || file.name.match(/\.(txt|yaml|yml)$/i)) {
                setSelectedFile(file);
            }
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const content = mode === "upload" ? selectedFile : configContent;
        if (content) {
            createMutation.mutate(content);
        }
    };

    const isSubmitDisabled = !templateName.trim() || (mode === "upload" && !selectedFile) || (mode === "write" && !configContent.trim()) || createMutation.isPending;

    if (!isOpen) return null;

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2, overflow: 'visible' }
            }}
        >
            <DialogTitle sx={{ pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1, bgcolor: "primary.50", borderRadius: 1, display: 'flex' }}>
                        <FontAwesomeIcon icon={faFile} style={{ color: "#2563eb", width: 20 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" component="div" fontWeight="bold" lineHeight={1.2}>Create New Template</Typography>
                        <Typography variant="body2" component="div" color="text.secondary">Add a new configuration template</Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 1, pb: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <ToggleButtonGroup
                        color="primary"
                        value={mode}
                        exclusive
                        onChange={(_, newMode) => { if (newMode !== null) setMode(newMode); }}
                        fullWidth
                        size="small"
                        sx={{ mb: 1 }}
                    >
                        <ToggleButton value="write" sx={{ gap: 1, textTransform: "none", fontWeight: "medium" }}>
                            <FontAwesomeIcon icon={faEdit} /> Write Content
                        </ToggleButton>
                        <ToggleButton value="upload" sx={{ gap: 1, textTransform: "none", fontWeight: "medium" }}>
                            <FontAwesomeIcon icon={faUpload} /> Upload File
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                        <TextField
                            label="Template Name"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="e.g., OSPF Basic Config"
                            fullWidth
                            required
                            size="small"
                            variant="outlined"
                        />

                        <TextField
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this template"
                            fullWidth
                            size="small"
                            variant="outlined"
                        />

                    </Box>
                    <TextField
                        select
                        label="Template Type"
                        value={templateType}
                        onChange={(e) => setTemplateType(e.target.value as TemplateType)}
                        fullWidth
                        size="small"
                        variant="outlined"
                    >
                        {TEMPLATE_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                                {type.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Tag Selection */}
                    <Box>
                        <Typography variant="body2" fontWeight="medium" sx={{ mb: 1, color: "text.secondary" }}>
                            Tag (optional)
                        </Typography>
                        {isLoadingTags ? (
                            <Typography variant="caption" color="text.secondary">Loading tags...</Typography>
                        ) : tags.length === 0 ? (
                            <Typography variant="caption" color="text.secondary">
                                No tags available. You can create tags in Tag Group page.
                            </Typography>
                        ) : (
                            <Stack spacing={1.5}>
                                {(["tag", "group", "other"] as const).map((typeKey) => {
                                    const tagsOfType = tags.filter((t) => t.type === typeKey);
                                    if (tagsOfType.length === 0) return null;

                                    const typeLabel = typeKey === "tag" ? "Tag" : typeKey === "group" ? "Group" : "Other";

                                    return (
                                        <Box key={typeKey}>
                                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                {typeLabel}
                                            </Typography>
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                                {tagsOfType.map((tag) => {
                                                    const isSelected = selectedTags.includes(tag.tag_name);
                                                    return (
                                                        <Chip
                                                            key={tag.tag_id || tag.tag_name}
                                                            label={tag.tag_name}
                                                            size="small"
                                                            onClick={() => {
                                                                setSelectedTags((prev) =>
                                                                    prev.includes(tag.tag_name)
                                                                        ? prev.filter((t) => t !== tag.tag_name)
                                                                        : [...prev, tag.tag_name]
                                                                );
                                                            }}
                                                            sx={{
                                                                bgcolor: isSelected ? `${tag.color}20` : "grey.100",
                                                                color: isSelected ? tag.color : "text.secondary",
                                                                borderColor: isSelected ? tag.color : "transparent",
                                                                borderWidth: 1,
                                                                borderStyle: "solid",
                                                                fontWeight: isSelected ? "bold" : "regular",
                                                                "&:hover": {
                                                                    bgcolor: isSelected ? `${tag.color}30` : "grey.200",
                                                                }
                                                            }}
                                                            icon={
                                                                <Box
                                                                    sx={{
                                                                        width: 8,
                                                                        height: 8,
                                                                        borderRadius: "50%",
                                                                        bgcolor: tag.color,
                                                                        ml: 1
                                                                    }}
                                                                />
                                                            }
                                                        />
                                                    );
                                                })}
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>

                    {/* Content Area */}
                    {mode === "write" ? (
                        <TextField
                            label="Configuration Content"
                            value={configContent}
                            onChange={(e) => setConfigContent(e.target.value)}
                            placeholder="Enter your configuration content here..."
                            multiline
                            minRows={8}
                            maxRows={12}
                            fullWidth
                            required
                            slotProps={{
                                htmlInput: {
                                    sx: {
                                        fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                                        fontSize: "0.875rem",
                                        lineHeight: 1.5
                                    }
                                }
                            }}
                        />
                    ) : (
                        <Box>
                            <Typography variant="body2" fontWeight="medium" sx={{ mb: 1, color: "text.primary" }}>
                                Upload File *
                            </Typography>
                            {!selectedFile ? (
                                <Box
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{
                                        border: 2,
                                        borderStyle: "dashed",
                                        borderColor: isDragOver ? "primary.main" : "grey.300",
                                        bgcolor: isDragOver ? "primary.50" : "grey.50",
                                        borderRadius: 2,
                                        p: 4,
                                        textAlign: "center",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        "&:hover": { borderColor: "primary.main", bgcolor: "primary.50" }
                                    }}
                                >
                                    <FontAwesomeIcon icon={faUpload} style={{ width: 40, height: 40, color: "#9ca3af", marginBottom: 12 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Drag and drop your file here, or click to browse
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">
                                        Supported: .txt, .yaml, .yml
                                    </Typography>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".txt,.yaml,.yml,text/*"
                                        onChange={handleFileSelect}
                                        style={{ display: "none" }}
                                    />
                                </Box>
                            ) : (
                                <Paper variant="outlined" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, bgcolor: "grey.50" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Box sx={{ p: 1, bgcolor: "primary.50", borderRadius: 1 }}>
                                            <FontAwesomeIcon icon={faFile} style={{ color: "#2563eb", width: 20, height: 20 }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight="medium">{selectedFile.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{(selectedFile.size / 1024).toFixed(1)} KB</Typography>
                                        </Box>
                                    </Box>
                                    <Button size="small" color="error" onClick={handleRemoveFile} sx={{ minWidth: 0, p: 1 }}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </Button>
                                </Paper>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleClose} disabled={createMutation.isPending} color="inherit" sx={{ textTransform: "none" }}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitDisabled}
                        variant="contained"
                        color="success"
                        startIcon={createMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null}
                        sx={{ textTransform: "none", boxShadow: "none" }}
                    >
                        Create Template
                    </Button>
                </DialogActions>
            </form>
            <MuiSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                title={snackbar.title}
                onClose={hideSnackbar}
            />
        </Dialog>
    );
}
