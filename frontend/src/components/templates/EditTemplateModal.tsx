"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUpload,
    faEdit,
    faFile,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {
    configurationTemplateService,
    ConfigurationTemplate,
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
    Chip,
    Paper,
    Stack,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import { useSnackbar } from "@/hooks/useSnackbar";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";

interface EditTemplateModalProps {
    isOpen: boolean;
    template: ConfigurationTemplate | null;
    onClose: () => void;
    onSuccess: () => void;
}

const TEMPLATE_TYPES: { value: TemplateType; label: string }[] = [
    { value: "NETWORK", label: "Network" },
    { value: "SECURITY", label: "Security" },
    { value: "OTHER", label: "Other" },
];

export default function EditTemplateModal({
    isOpen,
    template,
    onClose,
    onSuccess,
}: EditTemplateModalProps) {
    const { isAuthenticated } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const { snackbar, showError, hideSnackbar } = useSnackbar();

    // Form state
    const [templateName, setTemplateName] = useState("");
    const [description, setDescription] = useState("");
    const [templateType, setTemplateType] = useState<TemplateType>("NETWORK");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [configContent, setConfigContent] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [contentMode, setContentMode] = useState<"keep" | "edit" | "upload">("keep");

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
            enabled: isAuthenticated && isOpen,
        }
    );

    const tags = tagsData?.tags || [];

    // Edit Mutation
    const editMutation = useMutation({
        mutationFn: async () => {
            if (!isAuthenticated || !template) throw new Error("Missing requirements");

            // 1. Update metadata
            await configurationTemplateService.updateTemplate(
                template.id,
                {
                    template_name: templateName.trim(),
                    description: description.trim() || null,
                    template_type: templateType,
                    tag_names: selectedTags.length > 0 ? selectedTags : null,
                }
            );

            // 2. Upload content
            if (contentMode === "upload" && selectedFile) {
                await configurationTemplateService.uploadTemplateContent(
                    template.id,
                    selectedFile
                );
            } else if (contentMode === "edit") {
                await configurationTemplateService.uploadTemplateContent(
                    template.id,
                    configContent
                );
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get", "/configuration-templates/"] });
            // Also invalidate single template fetch just in case
            if (template?.id) {
                queryClient.invalidateQueries({ queryKey: ["get", `/configuration-templates/${template.id}` as any] });
            }
            onSuccess();
            handleClose();
        },
        onError: (error: any) => {
            showError(error instanceof Error ? error.message : "Failed to save changes");
        }
    });

    // Initialize form when template changes
    useEffect(() => {
        if (isOpen && template) {
            setTemplateName(template.template_name);
            setDescription(template.description || "");
            setTemplateType(template.template_type);
            setConfigContent(template.detail?.config_content || "");
            setSelectedTags(template.tags?.map(t => t.tag_name) || []);
            setContentMode("keep");
            setSelectedFile(null);
            editMutation.reset();
        }
    }, [isOpen, template]);

    const handleClose = () => {
        editMutation.reset();
        onClose();
    };

    // File handling
    const handleFileSelect = useCallback((file: File) => {
        const validExtensions = [".txt", ".yaml", ".yml"];
        const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

        if (validExtensions.includes(extension)) {
            setSelectedFile(file);
        }
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        editMutation.mutate();
    };

    const isSubmitDisabled = !templateName.trim() ||
        (contentMode === "upload" && !selectedFile) ||
        (contentMode === "edit" && !configContent.trim()) ||
        editMutation.isPending;

    if (!isOpen || !template) return null;

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 1, overflow: 'visible' }
            }}
        >
            <DialogTitle sx={{ pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1, bgcolor: "primary.50", borderRadius: 1, display: 'flex' }}>
                        <FontAwesomeIcon icon={faEdit} style={{ color: "#2563eb", width: 20 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" component="div" fontWeight="bold" lineHeight={1.2}>Edit Template</Typography>
                        <Typography variant="body2" component="div" color="text.secondary">Update template details and content</Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Basic Info */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                        <TextField
                            label="Template Name"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="Enter template name"
                            fullWidth
                            required
                            size="small"
                            variant="outlined"
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            select
                            label="Template Type"
                            value={templateType}
                            onChange={(e) => setTemplateType(e.target.value as TemplateType)}
                            fullWidth
                            size="small"
                            variant="outlined"
                            sx={{ flex: 1 }}
                        >
                            {TEMPLATE_TYPES.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter template description"
                        fullWidth
                        multiline
                        minRows={2}
                        size="small"
                        variant="outlined"
                    />

                    {/* Tag Selection */}
                    <Box>
                        <Typography variant="body2" fontWeight="medium" sx={{ mb: 1, color: "text.secondary" }}>
                            Tags (optional)
                        </Typography>
                        {isLoadingTags ? (
                            <Typography variant="caption" color="text.secondary">Loading tags...</Typography>
                        ) : tags.length === 0 ? (
                            <Typography variant="caption" color="text.secondary">
                                No tags available.
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

                    {/* Content Mode Selection */}
                    <Box>
                        <Typography variant="body2" fontWeight="medium" sx={{ mb: 1.5, color: "text.secondary" }}>
                            Configuration Content
                        </Typography>
                        <ToggleButtonGroup
                            color="primary"
                            value={contentMode}
                            exclusive
                            onChange={(_, newMode) => { if (newMode !== null) setContentMode(newMode); }}
                            size="small"
                            sx={{ mb: 2 }}
                        >
                            <ToggleButton value="keep" sx={{ width: 140, textTransform: "none", fontWeight: "medium" }}>
                                Keep Current
                            </ToggleButton>
                            <ToggleButton value="edit" sx={{ width: 140, gap: 1, textTransform: "none", fontWeight: "medium" }}>
                                <FontAwesomeIcon icon={faEdit} /> Edit Content
                            </ToggleButton>
                            <ToggleButton value="upload" sx={{ width: 170, gap: 1, textTransform: "none", fontWeight: "medium" }}>
                                <FontAwesomeIcon icon={faUpload} /> Upload New File
                            </ToggleButton>
                        </ToggleButtonGroup>

                        {/* Content Area based on mode */}
                        {contentMode === "keep" && (
                            <Paper variant="outlined" sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Current content will be preserved:
                                </Typography>
                                <Box
                                    component="pre"
                                    sx={{
                                        m: 0,
                                        typography: "caption",
                                        fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                                        color: "text.primary",
                                        whiteSpace: "pre-wrap",
                                        maxHeight: 150,
                                        overflow: "auto"
                                    }}
                                >
                                    {template.detail?.config_content?.slice(0, 500) || "No content"}
                                    {(template.detail?.config_content?.length || 0) > 500 && "\n..."}
                                </Box>
                            </Paper>
                        )}

                        {contentMode === "edit" && (
                            <TextField
                                label="Edit Content"
                                value={configContent}
                                onChange={(e) => setConfigContent(e.target.value)}
                                placeholder="Enter your configuration content here..."
                                multiline
                                minRows={8}
                                maxRows={12}
                                fullWidth
                                variant="outlined"
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
                        )}

                        {contentMode === "upload" && (
                            <Box>
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
                                            Supported formats: .txt, .yaml, .yml
                                        </Typography>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".txt,.yaml,.yml"
                                            onChange={handleFileInputChange}
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
                                        <Button size="small" color="error" onClick={() => setSelectedFile(null)} sx={{ minWidth: 0, p: 1 }}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </Paper>
                                )}
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, bgcolor: 'grey.50', pt: 2, borderTop: 1, borderColor: "divider", borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                    <Button onClick={handleClose} disabled={editMutation.isPending} color="inherit" sx={{ textTransform: "none" }}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitDisabled}
                        variant="contained"
                        color="primary"
                        startIcon={editMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null}
                        sx={{ textTransform: "none", boxShadow: "none" }}
                    >
                        Save Changes
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
