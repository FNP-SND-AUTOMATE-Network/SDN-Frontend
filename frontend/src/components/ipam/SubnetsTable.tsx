"use client";

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Collapse,
    Typography,
    Box,
    CircularProgress,
    Chip,
    Button
} from "@mui/material";
import {
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowRight as KeyboardArrowRightIcon,
    AccountTree as AccountTreeIcon
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { $api } from "@/lib/apiv2/fetch";
import Link from "next/link";
import { components } from "@/lib/apiv2/schema";

type SubnetResponse = components["schemas"]["SubnetResponse"];

interface SubnetsTableProps {
    subnets: SubnetResponse[];
    onRefresh: () => void;
}

export default function SubnetsTable({
    subnets,
    onRefresh,
}: SubnetsTableProps) {
    const { token } = useAuth();
    const [expandedSubnets, setExpandedSubnets] = useState<Set<string>>(
        new Set()
    );
    // Keep track of which subnets we are currently expanding to show loading state
    const [loadingChildren, setLoadingChildren] = useState<Set<string>>(
        new Set()
    );

    const toggleExpand = (subnetId: string) => {
        const newExpanded = new Set(expandedSubnets);
        if (newExpanded.has(subnetId)) {
            newExpanded.delete(subnetId);
        } else {
            newExpanded.add(subnetId);
        }
        setExpandedSubnets(newExpanded);
    };

    const SubnetRow = ({ subnet, level = 0 }: { subnet: SubnetResponse, level?: number }) => {
        const isExpanded = expandedSubnets.has(subnet.id);
        const paddingLeft = level * 24 + 16;
        
        // Fetch children if expanded
        const { data: childrenData, isLoading } = $api.useQuery(
            "get",
            "/ipam/subnets/{subnet_id}/children",
            {
                params: { path: { subnet_id: subnet.id } }
            },
            {
                enabled: isExpanded && !!token
            }
        );

        const children = childrenData?.subnets || [];
        // Determine dynamically if it has children from some property if available, otherwise assume it might until expanded.
        const hasChildren = true; // In phpIPAM we don't always know without fetching, or we assume folder subnets have children. For now, show expand button always if possible or if it's a known folder.

        return (
            <React.Fragment>
                <TableRow sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                    <TableCell sx={{ pl: `${paddingLeft}px`, width: 48 }}>
                        <IconButton
                            size="small"
                            onClick={() => toggleExpand(subnet.id)}
                            sx={{ color: "text.secondary" }}
                        >
                            {isLoading ? (
                                <CircularProgress size={16} />
                            ) : isExpanded ? (
                                <KeyboardArrowDownIcon fontSize="small" />
                            ) : (
                                <KeyboardArrowRightIcon fontSize="small" />
                            )}
                        </IconButton>
                    </TableCell>
                    <TableCell>
                        <Box component={Link} href={`/ipam/subnets/${subnet.id}`} sx={{ color: "primary.main", fontWeight: 500, textDecoration: "none", "&:hover": { color: "primary.dark" } }}>
                            {subnet.subnet}
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" color="text.secondary">
                            /{subnet.mask}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                            {subnet.description || "-"}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        {subnet.vlan_id ? (
                            <Chip size="small" label={`VLAN ${subnet.vlan_id}`} color="info" variant="outlined" />
                        ) : (
                            <Typography variant="body2" color="text.disabled">-</Typography>
                        )}
                    </TableCell>
                    <TableCell align="center">
                        <Button
                            component={Link}
                            href={`/ipam/subnets/${subnet.id}`}
                            size="small"
                            color="primary"
                            sx={{ textTransform: "none", fontWeight: 500 }}
                        >
                            View Details
                        </Button>
                    </TableCell>
                </TableRow>
                {isExpanded && children.map((childSubnet) => (
                    <SubnetRow key={childSubnet.id} subnet={childSubnet as any} level={level + 1} />
                ))}
            </React.Fragment>
        );
    };

    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <Table size="medium">
                <TableHead sx={{ bgcolor: "background.default" }}>
                    <TableRow>
                        <TableCell sx={{ width: 48 }}></TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Subnet</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Mask</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>VLAN</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {subnets.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                <AccountTreeIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    No subnets found
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        subnets.map((subnet) => (
                            <SubnetRow key={subnet.id} subnet={subnet} level={0} />
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
