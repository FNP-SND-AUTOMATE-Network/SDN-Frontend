import React, { useEffect } from "react";
import {
    Box,
    Typography,
    Stack,
    CircularProgress,
} from "@mui/material";
import { $api } from "@/lib/apiv2/fetch";
import { ConfigurationTemplateListResponse, ConfigurationTemplateDetailResponse } from "./types";

interface ConfigurationTemplatePanelProps {
    isOpen: boolean;
    mainTab: "config" | "template";
    selectedTemplateId: string | null;
    setSelectedTemplateId: (id: string | null) => void;
    editedConfigContent: string;
    setEditedConfigContent: (content: string) => void;
}

export const ConfigurationTemplatePanel: React.FC<ConfigurationTemplatePanelProps> = ({
    isOpen,
    mainTab,
    selectedTemplateId,
    setSelectedTemplateId,
    editedConfigContent,
    setEditedConfigContent,
}) => {
    // ==================== Fetch Templates ====================
    const { data: templatesData, isLoading: isLoadingTemplates } = $api.useQuery(
        "get",
        "/configuration-templates/",
        {
            params: { query: { page: 1, page_size: 100 } } // Fetch plenty to ensure list shows
        },
        { enabled: isOpen && mainTab === "template" }
    );
    const templatesList = (templatesData as ConfigurationTemplateListResponse)?.templates || [];

    const { data: templateDetailData, isLoading: isLoadingTemplateDetail } = $api.useQuery(
        "get",
        "/configuration-templates/{template_id}",
        {
            params: { path: { template_id: selectedTemplateId || "" } }
        },
        { enabled: !!selectedTemplateId && isOpen && mainTab === "template" }
    );
    const selectedTemplateDetail = templateDetailData as ConfigurationTemplateDetailResponse | undefined;

    useEffect(() => {
        if (selectedTemplateId) {
            console.log("Template detail fetched:", selectedTemplateDetail);
        }
    }, [selectedTemplateDetail, selectedTemplateId]);

    useEffect(() => {
        if (selectedTemplateDetail) {
            // The API response places the content inside a nested 'detail' object
            const detailObj = (selectedTemplateDetail as any).detail || selectedTemplateDetail;

            let contentStr = "";
            if (detailObj.config_content) {
                contentStr = typeof detailObj.config_content === 'string'
                    ? detailObj.config_content
                    : JSON.stringify(detailObj.config_content, null, 2);
            }
            setEditedConfigContent(contentStr);
        } else if (!selectedTemplateId) {
            setEditedConfigContent("");
        }
    }, [selectedTemplateDetail, selectedTemplateId, setEditedConfigContent]);

    if (isLoadingTemplates) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (templatesList.length === 0) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%" p={4}>
                <Typography variant="body2" color="text.secondary">
                    No configuration templates available.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden", height: "100%" }}>
            {/* Template List Sidebar */}
            <Box sx={{ width: 250, borderRight: 1, borderColor: "divider", bgcolor: "grey.50", overflowY: "auto", flexShrink: 0, p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 700 }}>
                    Select Template
                </Typography>
                <Stack spacing={1}>
                    {templatesList.map(template => (
                        <Box
                            key={template.id}
                            onClick={() => setSelectedTemplateId(template.id || null)}
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: selectedTemplateId === template.id ? 'secondary.main' : 'divider',
                                bgcolor: selectedTemplateId === template.id ? 'secondary.50' : 'background.paper',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: 'secondary.light',
                                    bgcolor: selectedTemplateId === template.id ? 'secondary.50' : 'grey.100'
                                }
                            }}
                        >
                            <Typography variant="body2" fontWeight={600} noWrap title={template.template_name}>
                                {template.template_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {template.template_type}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </Box>

            {/* Template Edit Area */}
            <Box sx={{ flex: 1, p: 3, overflowY: "auto", bgcolor: "background.paper" }}>
                {selectedTemplateId ? (
                    isLoadingTemplateDetail ? (
                        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Stack spacing={3} height="100%">
                            <Box>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    {templatesList.find(t => t.id === selectedTemplateId)?.template_name || "Template Details"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {templatesList.find(t => t.id === selectedTemplateId)?.description || "Review and edit the configuration content below before deploying to the device."}
                                </Typography>
                            </Box>

                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Configuration Content
                                </Typography>
                                <Box
                                    component="textarea"
                                    value={editedConfigContent}
                                    onChange={(e) => setEditedConfigContent(e.target.value)}
                                    sx={{
                                        flex: 1,
                                        minHeight: '400px',
                                        width: '100%',
                                        p: 2,
                                        fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                                        fontSize: '0.875rem',
                                        bgcolor: '#1E1E1E',
                                        color: '#D4D4D4',
                                        border: 'none',
                                        borderRadius: 2,
                                        resize: 'none',
                                        '&:focus': {
                                            outline: '2px solid',
                                            outlineColor: 'secondary.main',
                                            outlineOffset: '-2px'
                                        }
                                    }}
                                    spellCheck={false}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                    * Note: Modifying the config here applies only to this deployment. It does not permanently save to the template.
                                </Typography>
                            </Box>
                        </Stack>
                    )
                ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                        <Typography variant="body1" color="text.secondary">
                            Select a template from the list to view and edit its configuration.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};
