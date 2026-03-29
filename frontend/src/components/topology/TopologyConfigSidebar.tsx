"use client";

import React from "react";
import {
    Box,
    List,
    ListItemButton,
    ListItemText,
    Collapse,
    Typography,
    Stack,
    Chip,
} from "@mui/material";
import { ExpandMore, ChevronRight } from "@mui/icons-material";
import { StagedIntent } from "./config-panels/types";

// Types
type SidebarItem = { key: string; label: string; expandable: boolean };

interface NetworkInterface {
    name: string;
}

// Data
const ALL_SIDEBAR_ITEMS: SidebarItem[] = [
    { key: "setting", label: "SETTING", expandable: false },
    { key: "routing", label: "ROUTING", expandable: true },
    { key: "interface", label: "INTERFACE", expandable: true },
    { key: "vlan", label: "VLAN", expandable: false },
    { key: "dhcp", label: "DHCP", expandable: false },
];

function getSidebarItems(deviceType?: string): SidebarItem[] {
    switch (deviceType) {
        case "ROUTER":
            return ALL_SIDEBAR_ITEMS.filter((i) => i.key !== "vlan");
        case "SWITCH":
            return ALL_SIDEBAR_ITEMS.filter((i) => i.key !== "routing" && i.key !== "dhcp");
        default:
            return ALL_SIDEBAR_ITEMS;
    }
}

export const SUB_ITEMS: Record<string, { key: string; label: string }[]> = {
    routing: [
        { key: "routing-static", label: "Static Route" },
        { key: "routing-ospf", label: "OSPF" },
    ],
};

interface TopologyConfigSidebarProps {
    deviceType?: string;
    activeSection: string;
    setActiveSection: (key: string) => void;
    expandedSections: Set<string>;
    toggleSection: (key: string) => void;
    discoveredInterfaces: NetworkInterface[];
    stagedIntents: StagedIntent[];
    handleRemoveStaged: (index: number) => void;
}

export function TopologyConfigSidebar({
    deviceType,
    activeSection,
    setActiveSection,
    expandedSections,
    toggleSection,
    discoveredInterfaces,
    stagedIntents,
    handleRemoveStaged,
}: TopologyConfigSidebarProps) {
    
    const handleSidebarClick = (key: string, expandable: boolean) => {
        if (expandable) {
            toggleSection(key);
        } else {
            setActiveSection(key);
        }
    };

    return (
        <Box
            sx={{
                width: 200,
                borderRight: 1,
                borderColor: "divider",
                bgcolor: "grey.50",
                overflowY: "auto",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
            }}
        >
            <List disablePadding dense sx={{ flex: 1 }}>
                {getSidebarItems(deviceType).map((item) => {
                    const isActive = activeSection === item.key ||
                        (item.key === "routing" && activeSection.startsWith("routing-")) ||
                        (item.key === "interface" && activeSection.startsWith("interface-"));
                    const isExpanded = expandedSections.has(item.key);

                    let subItems = SUB_ITEMS[item.key];
                    if (item.key === "interface") {
                        subItems = [...discoveredInterfaces]
                            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }))
                            .map(iface => ({
                                key: `interface-${iface.name}`,
                                label: iface.name,
                            }));
                    }

                    return (
                        <React.Fragment key={item.key}>
                            <ListItemButton
                                onClick={() => handleSidebarClick(item.key, item.expandable)}
                                selected={isActive}
                                sx={{
                                    borderLeft: 3,
                                    borderColor: isActive ? "primary.main" : "transparent",
                                    py: 1,
                                }}
                            >
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        variant: "caption",
                                        fontWeight: 700,
                                        letterSpacing: "0.05em",
                                    }}
                                />
                                {item.expandable && (isExpanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />)}
                            </ListItemButton>
                            {item.expandable && subItems && (
                                <Collapse in={isExpanded}>
                                    <List disablePadding dense>
                                        {subItems.map((sub) => (
                                            <ListItemButton
                                                key={sub.key}
                                                onClick={() => setActiveSection(sub.key)}
                                                selected={activeSection === sub.key}
                                                sx={{ pl: 4, py: 0.75 }}
                                            >
                                                <ListItemText
                                                    primary={sub.label}
                                                    primaryTypographyProps={{ variant: "body2", fontSize: "0.75rem" }}
                                                />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Collapse>
                            )}
                        </React.Fragment>
                    );
                })}
            </List>

            {/* Pending Changes Counter in Sidebar */}
            {stagedIntents.length > 0 && (
                <Box sx={{ p: 1.5, borderTop: 1, borderColor: "divider" }}>
                    <Typography variant="caption" fontWeight={600} color="warning.dark" display="block" gutterBottom>
                        Pending ({stagedIntents.length})
                    </Typography>
                    <Stack spacing={0.5} sx={{ maxHeight: 120, overflowY: "auto" }}>
                        {stagedIntents.map((s, i) => (
                            <Chip
                                key={i}
                                label={s.label || s.intent}
                                size="small"
                                variant="outlined"
                                color="warning"
                                onDelete={() => handleRemoveStaged(i)}
                                sx={{ fontSize: "0.65rem", height: 24, justifyContent: "space-between" }}
                            />
                        ))}
                    </Stack>
                </Box>
            )}
        </Box>
    );
}
