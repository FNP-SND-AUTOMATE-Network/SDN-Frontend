"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faEdit,
    faTrash,
    faSpinner,
    faCopy,
    faCheck,
    faCalendar,
    faTag,
    faFile,
} from "@fortawesome/free-solid-svg-icons";
import { ConfigurationTemplate } from "@/services/configurationTemplateService";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Button,
    IconButton,
    Chip,
    Skeleton,
    Paper,
    Stack,
    Divider,
} from "@mui/material";

interface TemplateDetailModalProps {
    isOpen: boolean;
    template: ConfigurationTemplate | null;
    onClose: () => void;
    onEdit: (template: ConfigurationTemplate) => void;
    onDelete: (template: ConfigurationTemplate) => void;
    isDeleting?: boolean;
    isLoadingContent?: boolean;
}

export default function TemplateDetailModal({
    isOpen,
    template,
    onClose,
    onEdit,
    onDelete,
    isDeleting = false,
    isLoadingContent = false,
}: TemplateDetailModalProps) {
    const [copied, setCopied] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!isOpen || !template) return null;

    const configContent = template.detail?.config_content || "";

    const handleCopyContent = async () => {
        if (!configContent) return;

        try {
            await navigator.clipboard.writeText(configContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        onDelete(template);
        setShowDeleteConfirm(false);
    };

    const handleClose = () => {
        setShowDeleteConfirm(false);
        onClose();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-EN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            NETWORK: "Network",
            SECURITY: "Security",
            OTHER: "Other",
        };
        return labels[type] || type;
    };

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2, maxHeight: "90vh" }
            }}
        >
            {/* Header */}
            <DialogTitle sx={{ p: 3, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: 1, borderColor: "divider" }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" component="div" fontWeight="bold" noWrap>
                        {template.template_name}
                    </Typography>
                    <Typography variant="body2" component="div" color="text.secondary" sx={{ mt: 0.5 }}>
                        {template.description || "No description"}
                    </Typography>
                </Box>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{ color: "text.secondary", ml: 2 }}
                >
                    <FontAwesomeIcon icon={faTimes} style={{ width: 16 }} />
                </IconButton>
            </DialogTitle>

            {/* Meta Info */}
            <Box sx={{ px: 3, py: 2, bgcolor: "grey.50", borderBottom: 1, borderColor: "divider" }}>
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap sx={{ rowGap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <FontAwesomeIcon icon={faFile} style={{ width: 16, color: "#6b7280" }} />
                        <Typography variant="body2" fontWeight="medium" color="text.secondary">Type:</Typography>
                        <Chip size="small" label={getTypeLabel(template.template_type)} color="primary" sx={{ height: 24, fontSize: "0.75rem", fontWeight: "medium" }} />
                    </Box>

                    {template.tags && template.tags.length > 0 && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <FontAwesomeIcon icon={faTag} style={{ width: 16, color: "#6b7280" }} />
                            <Typography variant="body2" fontWeight="medium" color="text.secondary">Tags:</Typography>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                {template.tags.map((tag) => (
                                    <Chip
                                        key={tag.id || tag.tag_name}
                                        label={tag.tag_name}
                                        size="small"
                                        sx={{
                                            bgcolor: `${tag.color}20`,
                                            color: tag.color,
                                            height: 24,
                                            fontSize: "0.75rem",
                                            fontWeight: "medium"
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    )}

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <FontAwesomeIcon icon={faCalendar} style={{ width: 16, color: "#6b7280" }} />
                        <Typography variant="body2" fontWeight="medium" color="text.secondary">Updated:</Typography>
                        <Typography variant="body2" color="text.primary">{formatDate(template.updated_at)}</Typography>
                    </Box>
                </Stack>
            </Box>

            {/* Content */}
            <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold">Configuration Content</Typography>
                    {configContent && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<FontAwesomeIcon icon={copied ? faCheck : faCopy} />}
                            onClick={handleCopyContent}
                            color={copied ? "success" : "inherit"}
                            sx={{ textTransform: "none", py: 0.5 }}
                        >
                            {copied ? "Copied!" : "Copy"}
                        </Button>
                    )}
                </Box>

                <Paper
                    variant="outlined"
                    sx={{
                        bgcolor: "#1E1E1E", // slate-800 or near black
                        p: 2,
                        borderRadius: 2,
                        overflowX: "auto",
                        minHeight: 200,
                        maxHeight: 400,
                    }}
                >
                    {isLoadingContent ? (
                        <Stack spacing={1}>
                            <Skeleton variant="rectangular" height={16} width="85%" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Skeleton variant="rectangular" height={16} width="70%" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Skeleton variant="rectangular" height={16} width="90%" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Skeleton variant="rectangular" height={16} width="60%" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Skeleton variant="rectangular" height={16} width="80%" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Skeleton variant="rectangular" height={16} width="75%" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                        </Stack>
                    ) : configContent ? (
                        <Box
                            component="pre"
                            sx={{
                                color: "grey.100",
                                typography: "body2",
                                fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                                m: 0,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-all"
                            }}
                        >
                            {configContent}
                        </Box>
                    ) : (
                        <Typography variant="body2" sx={{ color: "grey.500", fontStyle: "italic" }}>
                            No content available
                        </Typography>
                    )}
                </Paper>
            </DialogContent>

            {/* Footer Actions */}
            <DialogActions sx={{ px: 3, py: 2, bgcolor: "grey.50", borderTop: 1, borderColor: "divider", justifyContent: "space-between" }}>
                {showDeleteConfirm ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="body2" color="error.main" fontWeight="medium">
                            Are you sure you want to delete?
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                startIcon={isDeleting ? <FontAwesomeIcon icon={faSpinner} spin /> : null}
                                sx={{ textTransform: "none", boxShadow: "none" }}
                            >
                                Yes, Delete
                            </Button>
                            <Button
                                variant="outlined"
                                color="inherit"
                                size="small"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                sx={{ textTransform: "none" }}
                            >
                                Cancel
                            </Button>
                        </Stack>
                    </Box>
                ) : (
                    <Button
                        variant="text"
                        color="error"
                        onClick={handleDeleteClick}
                        startIcon={<FontAwesomeIcon icon={faTrash} />}
                        sx={{ textTransform: "none" }}
                    >
                        Delete
                    </Button>
                )}

                <Stack direction="row" spacing={1.5}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleClose}
                        sx={{ textTransform: "none" }}
                    >
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => onEdit(template)}
                        startIcon={<FontAwesomeIcon icon={faEdit} />}
                        sx={{ textTransform: "none", boxShadow: "none" }}
                    >
                        Edit Template
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}
