"use client";

import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { ConfigurationTemplate } from "@/services/configurationTemplateService";
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    CardActionArea,
} from "@mui/material";

interface TemplateCardProps {
    template: ConfigurationTemplate;
    onClick?: (template: ConfigurationTemplate) => void;
}

export default function TemplateCard({ template, onClick }: TemplateCardProps) {
    // Get config content lines for preview (max 6 lines)
    const configLines = useMemo(() => {
        const configContent = template.detail?.config_content;
        if (configContent) {
            return configContent.split('\n').slice(0, 6);
        }
        return [];
    }, [template.detail?.config_content]);

    const hasContent = configLines.length > 0;

    const getTagColor = (tagName?: string | null) => {
        if (!tagName) return "default";

        const colors: Record<string, "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
            "Routing": "info",
            "Security": "error",
            "VLAN": "secondary",
            "Backup": "warning",
        };

        return colors[tagName] || "success";
    };

    // Get first tag for display
    const firstTag = template.tags?.[0];
    const tagColor = getTagColor(firstTag?.tag_name);

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 2,
                transition: "box-shadow 0.2s",
                "&:hover": {
                    boxShadow: (theme) => theme.shadows[4],
                },
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <CardActionArea
                onClick={() => onClick?.(template)}
                sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start" }}
            >
                <CardContent sx={{ pb: 1, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    {/* Header */}
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 0.5, gap: 1 }}>
                        <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                lineHeight: 1.2
                            }}
                        >
                            {template.template_name}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                            <FontAwesomeIcon
                                icon={faCircle}
                                style={{ width: 10, height: 10, color: "#22c55e" }} // Tailwind text-green-500
                            />
                        </Box>
                    </Box>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 1.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                        }}
                    >
                        Description : {template.description || "No description"}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            Tag :
                        </Typography>
                        {firstTag?.tag_name && (
                            <Chip
                                label={firstTag.tag_name}
                                size="small"
                                color={tagColor}
                                sx={{ height: 20, fontSize: "0.7rem", fontWeight: "medium" }}
                            />
                        )}
                    </Box>

                    {/* Config Preview Area */}
                    <Box
                        sx={{
                            backgroundColor: "grey.50",
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "grey.200",
                            p: 1.5,
                            minHeight: 100,
                            overflow: "hidden",
                            mt: "auto" // Push to bottom if content above is short
                        }}
                    >
                        {hasContent ? (
                            <Box
                                component="pre"
                                sx={{
                                    m: 0,
                                    typography: "caption",
                                    fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                                    color: "text.primary",
                                    whiteSpace: "pre-wrap",
                                    overflow: "hidden",
                                    lineHeight: 1.5,
                                }}
                            >
                                {configLines.map((line, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {line || " "}
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                                {/* Placeholder lines when no content */}
                                {Array(6).fill(null).map((_, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            height: 8,
                                            backgroundColor: "grey.300",
                                            borderRadius: 0.5,
                                            width: `${70 + Math.random() * 25}%`
                                        }}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
