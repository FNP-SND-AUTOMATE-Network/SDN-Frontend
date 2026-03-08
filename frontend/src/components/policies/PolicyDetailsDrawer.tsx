import React from 'react';
import {
    Drawer, Box, Typography, IconButton, Divider, Chip, Stack, Grid
} from '@mui/material';
import {
    Close as CloseIcon,
    AccountTree as ConnectivityIcon,
    AltRoute as SteeringIcon,
    Security as AclIcon,
    Circle as CircleIcon
} from '@mui/icons-material';
import { components } from "@/lib/apiv2/schema";

type FlowRule = components["schemas"]["FlowRuleItem"];

interface PolicyDetailsDrawerProps {
    open: boolean;
    onClose: () => void;
    rule: FlowRule | null;
}

const getCategoryInfo = (flowType: string) => {
    const iconProps = { fontSize: "small" as const, sx: { color: 'primary.main', fontSize: '16px' } };
    switch (flowType) {
        case 'base': return { category: 'Connectivity', name: 'Base L1 Forwarding', icon: <ConnectivityIcon {...iconProps} /> };
        case 'arp-flood': return { category: 'Connectivity', name: 'ARP Flood', icon: <ConnectivityIcon {...iconProps} /> };
        case 'default-gateway': return { category: 'Connectivity', name: 'Default Gateway', icon: <ConnectivityIcon {...iconProps} /> };

        case 'l2-mac': return { category: 'Traffic_Steering', name: 'L2 MAC Steer', icon: <SteeringIcon {...iconProps} /> };
        case 'l3-ip': return { category: 'Traffic_Steering', name: 'L3 IP Steer', icon: <SteeringIcon {...iconProps} /> };
        case 'l3-subnet': return { category: 'Traffic_Steering', name: 'L3 Subnet Steer', icon: <SteeringIcon {...iconProps} /> };
        case 'l4-port': return { category: 'Traffic_Steering', name: 'L4 Port Steer', icon: <SteeringIcon {...iconProps} /> };

        case 'block-mac': return { category: 'ACL_Security', name: 'Block MAC', icon: <AclIcon {...iconProps} /> };
        case 'block-ip': return { category: 'ACL_Security', name: 'Block IP', icon: <AclIcon {...iconProps} /> };
        case 'block-port': return { category: 'ACL_Security', name: 'Block Port', icon: <AclIcon {...iconProps} /> };
        case 'whitelist-port': return { category: 'ACL_Security', name: 'Whitelist Port', icon: <AclIcon {...iconProps} /> };
        case 'icmp-control': return { category: 'ACL_Security', name: 'ICMP Control', icon: <AclIcon {...iconProps} /> };

        default: return { category: 'Custom', name: flowType || 'Unknown', icon: <ConnectivityIcon {...iconProps} /> };
    }
};

const getStatusTheme = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE': return { bg: '#e8f5e9', text: '#2e7d32', label: 'Active' }; // green
        case 'PENDING': return { bg: '#fff3e0', text: '#ed6c02', label: 'Pending' }; // orange
        case 'FAILED': return { bg: '#ffebee', text: '#d32f2f', label: 'Failed' }; // red
        default: return { bg: '#f5f5f5', text: '#757575', label: 'Other' }; // grey
    }
};

const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(date);
    } catch {
        return dateString;
    }
};

export const PolicyDetailsDrawer: React.FC<PolicyDetailsDrawerProps> = ({ open, onClose, rule }) => {
    if (!rule) return null;

    const { name, icon, category } = getCategoryInfo(rule.flow_type || '');
    const statusTheme = getStatusTheme(rule.status || '');

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 400 }, p: 0 }
            }}
        >
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                        <Typography variant="h6" fontWeight={600}>Flow Details</Typography>
                        <Typography variant="body2" color="text.secondary">Detailed information about this flow rule</Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small" sx={{ mt: -0.5, mr: -0.5 }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Badges */}
                <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 3 }}>
                    <Chip
                        icon={<CircleIcon sx={{ fontSize: '10px !important', color: `${statusTheme.text} !important` }} />}
                        label={statusTheme.label}
                        size="small"
                        sx={{
                            bgcolor: statusTheme.bg,
                            color: statusTheme.text,
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor: statusTheme.bg,
                            '& .MuiChip-label': { px: 1 }
                        }}
                    />
                    <Chip
                        icon={icon as React.ReactElement}
                        label={category}
                        size="small"
                        sx={{
                            bgcolor: '#f0f4ff',
                            color: 'primary.main',
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor: '#e0eaff'
                        }}
                    />
                </Stack>
                <Divider sx={{ mx: -3, mb: 3 }} />

                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    {/* Section 1 */}
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Flow ID</Typography>
                            <Typography variant="body1" >{rule.id || '-'}</Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Node ID</Typography>
                            <Typography variant="body1" >{rule.node_id || '-'}</Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Policy Name</Typography>
                            <Typography variant="subtitle1" fontWeight={500}>{name}</Typography>
                        </Box>
                    </Stack>

                    <Divider sx={{ my: 3 }} />

                    {/* Section 2 */}
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Table ID</Typography>
                            <Typography variant="subtitle1" fontWeight={500}>{rule.table_id !== undefined ? rule.table_id : '-'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Priority</Typography>
                            <Typography variant="subtitle1" fontWeight={500}>{rule.priority !== undefined ? rule.priority : '-'}</Typography>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Section 3 */}
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Created At</Typography>
                            <Typography variant="body2">{formatDate(rule.created_at)}</Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Last Updated</Typography>
                            <Typography variant="body2">{formatDate(rule.updated_at)}</Typography>
                        </Box>
                    </Stack>
                </Box>
            </Box>
        </Drawer>
    );
};
