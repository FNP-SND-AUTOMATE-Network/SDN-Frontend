import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    CircularProgress,
    Chip
} from "@mui/material";
import { $api } from "@/lib/apiv2/fetch";
import { ConfigurationTemplateListResponse, ConfigurationTemplateDetailResponse } from "./config-panels/types";

interface DeployTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onError?: (error: string) => void;
    onWarning?: (warning: string) => void;
    selectedDevices: any[]; // Using any to be compatible with DeviceNetwork or raw items
}

export default function DeployTemplateModal({ isOpen, onClose, onSuccess, onError, onWarning, selectedDevices }: DeployTemplateModalProps) {
    const [templateId, setTemplateId] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [editedConfigContent, setEditedConfigContent] = useState<string>("");

    // Fetch templates list
    const { data: templatesData, isLoading: isLoadingTemplates } = $api.useQuery(
        "get",
        "/configuration-templates/",
        {
            params: { query: { page: 1, page_size: 100 } }
        },
        { enabled: isOpen }
    );
    const templatesList = (templatesData as ConfigurationTemplateListResponse)?.templates || [];

    // Fetch template detail
    const { data: templateDetailData, isLoading: isLoadingTemplateDetail } = $api.useQuery(
        "get",
        "/configuration-templates/{template_id}",
        {
            params: { path: { template_id: templateId || "" } }
        },
        { enabled: !!templateId && isOpen }
    );
    const selectedTemplateDetail = templateDetailData as ConfigurationTemplateDetailResponse | undefined;

    useEffect(() => {
        if (selectedTemplateDetail) {
            const detailObj = (selectedTemplateDetail as any).detail || selectedTemplateDetail;
            let contentStr = "";
            if (detailObj.config_content) {
                contentStr = typeof detailObj.config_content === 'string'
                    ? detailObj.config_content
                    : JSON.stringify(detailObj.config_content, null, 2);
            }
            setEditedConfigContent(contentStr);
        } else if (!templateId) {
            setEditedConfigContent("");
        }
    }, [selectedTemplateDetail, templateId]);

    // useMutation hook for handling the POST request
    const { mutate: deployTemplate, isPending: isSubmitting } = $api.useMutation(
        "post",
        "/deployments/",
        {
            onSuccess: () => {
                onSuccess();
            },
            onError: (error: any) => {
                console.error("Deploy template error:", error);
                let errorMessage = "Failed to trigger deployment. Please try again.";
                if (error && typeof error === 'object') {
                    if (error.detail) {
                        if (Array.isArray(error.detail)) {
                            errorMessage = error.detail.map((e: any) => `${e.loc?.join('->') || 'Field'}: ${e.msg}`).join(', ');
                        } else if (typeof error.detail === 'string') {
                            errorMessage = error.detail;
                        } else {
                            errorMessage = JSON.stringify(error.detail);
                        }
                    } else if (error.message) {
                        errorMessage = error.message;
                    } else {
                        try {
                            const str = JSON.stringify(error);
                            if (str !== "{}") errorMessage = str;
                        } catch (e) {}
                    }
                } else if (typeof error === 'string') {
                    errorMessage = error;
                }
                setError(errorMessage);
                if (onError) onError(errorMessage);
            }
        }
    );

    const handleSubmit = () => {
        if (!templateId) {
            setError("Please select a template");
            if (onError) onError("Please select a template");
            return;
        }

        setError(null);

        // Execute mutation
        deployTemplate({
            body: {
                template_id: templateId,
                device_ids: selectedDevices.map(d => d.id),
                variables: {
                    config_content: editedConfigContent // Payload inside variables matching schema 
                }
            } as any
        });
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onClose={!isSubmitting ? onClose : undefined} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 600, borderBottom: 1, borderColor: "divider", pb: 1.5 }}>
                Deploy Template Config
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                )}
                
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Selected Devices ({selectedDevices.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, p: 1.5, bgcolor: "grey.50", borderRadius: 1, border: 1, borderColor: "grey.200" }}>
                        {selectedDevices.map(device => (
                            <Chip 
                                key={device.id} 
                                label={device.device_name} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                                sx={{ bgcolor: "white" }}
                            />
                        ))}
                    </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Select Template
                    </Typography>
                    <FormControl fullWidth size="medium" sx={{ mt: 1 }}>
                        <InputLabel id="template-select-label">Template</InputLabel>
                        <Select
                            labelId="template-select-label"
                            label="Template"
                            value={templateId}
                            onChange={(e) => {
                                setTemplateId(e.target.value);
                                setError(null);
                            }}
                            disabled={isSubmitting || isLoadingTemplates}
                        >
                            <MenuItem value="" disabled sx={{ fontStyle: "italic", color: "text.secondary" }}>
                                -- Select a Template --
                            </MenuItem>
                            {isLoadingTemplates ? (
                                <MenuItem disabled>Loading templates...</MenuItem>
                            ) : (
                                templatesList.map(tmpl => (
                                    <MenuItem key={tmpl.id} value={tmpl.id || ""}>
                                        {tmpl.template_name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </Box>

                {templateId && (
                    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Configuration Content
                        </Typography>
                        {isLoadingTemplateDetail ? (
                            <Box display="flex" alignItems="center" justifyContent="center" p={2}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : (
                            <>
                                <Box
                                    component="textarea"
                                    value={editedConfigContent}
                                    onChange={(e) => setEditedConfigContent(e.target.value)}
                                    sx={{
                                        minHeight: '200px',
                                        width: '100%',
                                        p: 2,
                                        fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                                        fontSize: '0.875rem',
                                        bgcolor: '#1E1E1E',
                                        color: '#D4D4D4',
                                        border: 'none',
                                        borderRadius: 2,
                                        resize: 'vertical',
                                        '&:focus': {
                                            outline: '2px solid',
                                            outlineColor: 'primary.main',
                                            outlineOffset: '-2px'
                                        }
                                    }}
                                    spellCheck={false}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                    * Note: Modifying the config here applies only to this deployment. It does not permanently save to the template.
                                </Typography>
                            </>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: 1, borderColor: "divider" }}>
                <Button onClick={onClose} disabled={isSubmitting} color="inherit">
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || selectedDevices.length === 0} 
                    variant="contained"
                    startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
                >
                    Deploy to {selectedDevices.length} Device{selectedDevices.length > 1 ? "s" : ""}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
