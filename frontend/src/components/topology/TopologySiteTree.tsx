"use client";

import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronRight,
    faChevronDown,
    faFolder,
    faFolderOpen
} from "@fortawesome/free-solid-svg-icons";
import { Server, Router as RouterIcon, Shield, Wifi, Box as BoxIcon } from "lucide-react";
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    CircularProgress,
    Box,
    Typography
} from "@mui/material";
import { $api } from "@/lib/apiv2/fetch";
import { components } from "@/lib/apiv2/schema";

type LocalSite = components["schemas"]["LocalSiteResponse"];

const getDeviceIcon = (type: string, className: string) => {
    switch (type) {
        case "SWITCH":
            return <Server className={className} />;
        case "ROUTER":
            return <RouterIcon className={className} />;
        case "FIREWALL":
            return <Shield className={className} />;
        case "ACCESS_POINT":
            return <Wifi className={className} />;
        default:
            return <BoxIcon className={className} />;
    }
};

interface TopologySiteTreeProps {
    onSiteSelect?: (siteId: string) => void;
    onDeviceSelect?: (deviceId: string) => void;
    selectedSiteId?: string | null;
    selectedDeviceId?: string | null;
}

function SiteItem({
    site,
    isSelected,
    selectedDeviceId,
    onSiteSelect,
    onDeviceSelect,
}: {
    site: LocalSite;
    isSelected: boolean;
    selectedDeviceId?: string | null;
    onSiteSelect?: (id: string) => void;
    onDeviceSelect?: (id: string) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Fetch devices for this site only when expanded
    const { data: devicesData, isLoading } = $api.useQuery(
        "get",
        "/device-networks/",
        {
            params: {
                query: {
                    local_site_id: site.id,
                    page: 1,
                    page_size: 100,
                },
            },
        },
        {
            enabled: isExpanded,
        }
    );

    const devices = devicesData?.devices || [];
    const deviceCount = site.device_count || 0;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
        onSiteSelect?.(site.id);
    };

    return (
        <Box mb={0.5}>
            <ListItemButton
                selected={isSelected}
                onClick={handleToggle}
                sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    px: 1.5,
                    py: 0.75,
                    "&.Mui-selected": {
                        backgroundColor: "primary.50",
                        color: "primary.700",
                        "&:hover": {
                            backgroundColor: "primary.100",
                        },
                    },
                }}
            >
                <ListItemIcon sx={{ minWidth: 28 }}>
                    <FontAwesomeIcon
                        icon={isExpanded ? faChevronDown : faChevronRight}
                        className="text-gray-400 w-3 h-3"
                    />
                </ListItemIcon>
                <ListItemIcon sx={{ minWidth: 28 }}>
                    <FontAwesomeIcon
                        icon={isExpanded ? faFolderOpen : faFolder}
                        className={`w-4 h-4 ${isSelected ? "text-primary-600" : "text-blue-500"}`}
                    />
                </ListItemIcon>
                <ListItemText
                    primary={site.site_name || site.site_code}
                    primaryTypographyProps={{
                        variant: "body2",
                        fontWeight: 500,
                        noWrap: true,
                    }}
                />
                <Typography variant="caption" color="text.secondary">
                    ({deviceCount})
                </Typography>
            </ListItemButton>

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 4 }}>
                    {isLoading ? (
                        <ListItemButton disabled sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                                <CircularProgress size={12} thickness={5} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Loading devices..."
                                primaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
                            />
                        </ListItemButton>
                    ) : devices.length > 0 ? (
                        devices.map((device) => {
                            const isDeviceSelected = selectedDeviceId === device.id;
                            return (
                                <ListItemButton
                                    key={device.id}
                                    selected={isDeviceSelected}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeviceSelect?.(device.id);
                                    }}
                                    sx={{
                                        borderRadius: 1,
                                        mb: 0.5,
                                        py: 0.5,
                                        px: 1.5,
                                        "&.Mui-selected": {
                                            backgroundColor: "primary.50",
                                            color: "primary.700",
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                        {getDeviceIcon(
                                            device.type as string,
                                            `w-3.5 h-3.5 ${isDeviceSelected ? "text-primary-600" : "text-gray-400"}`
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={device.device_name}
                                        primaryTypographyProps={{
                                            variant: "body2",
                                            noWrap: true,
                                            color: isDeviceSelected ? "primary.700" : "text.primary",
                                        }}
                                    />
                                </ListItemButton>
                            );
                        })
                    ) : (
                        <ListItemButton disabled sx={{ py: 0.5 }}>
                            <ListItemText
                                primary="No devices"
                                primaryTypographyProps={{ variant: "caption", fontStyle: "italic", color: "text.secondary" }}
                            />
                        </ListItemButton>
                    )}
                </List>
            </Collapse>
        </Box>
    );
}

export default function TopologySiteTree({
    onSiteSelect,
    onDeviceSelect,
    selectedSiteId,
    selectedDeviceId,
}: TopologySiteTreeProps) {
    // Fetch all sites
    const { data: sitesData, isLoading, error } = $api.useQuery("get", "/local-sites/", {
        params: {
            query: {
                page: 1,
                page_size: 100,
            },
        },
    });

    const sites = useMemo(() => sitesData?.sites || [], [sitesData?.sites]);

    // Group sites by city
    const sitesByCity = useMemo(() => {
        return sites.reduce((acc, site) => {
            const city = site.city || "Other";
            if (!acc[city]) {
                acc[city] = [];
            }
            acc[city].push(site);
            return acc;
        }, {} as Record<string, LocalSite[]>);
    }, [sites]);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" p={4} height="100%">
                <CircularProgress size={32} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={2} m={2} bgcolor="error.50" color="error.main" borderRadius={1} border={1} borderColor="error.100">
                <Typography variant="body2">{((error as Error)?.message) || "Failed to load sites"}</Typography>
            </Box>
        );
    }

    return (
        <Box height="100%" sx={{ overflowY: "auto", bgcolor: "background.paper", borderRight: 1, borderColor: "divider" }}>
            <Box p={2} borderBottom={1} borderColor="divider">
                <Typography variant="subtitle2" fontWeight={600} textTransform="uppercase" color="text.primary">
                    Sites
                </Typography>
            </Box>

            <Box p={1}>
                {Object.entries(sitesByCity).map(([city, citySites]) => (
                    <Box key={city} mb={2}>
                        <Typography
                            variant="caption"
                            fontWeight={600}
                            color="text.secondary"
                            textTransform="uppercase"
                            sx={{ px: 1, py: 0.5, display: "block", letterSpacing: "0.05em" }}
                        >
                            {city}
                        </Typography>

                        <List disablePadding>
                            {citySites.map((site) => (
                                <SiteItem
                                    key={site.id}
                                    site={site}
                                    isSelected={selectedSiteId === site.id}
                                    selectedDeviceId={selectedDeviceId}
                                    onSiteSelect={onSiteSelect}
                                    onDeviceSelect={onDeviceSelect}
                                />
                            ))}
                        </List>
                    </Box>
                ))}

                {sites.length === 0 && (
                    <Box p={4} textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                            No sites found
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
