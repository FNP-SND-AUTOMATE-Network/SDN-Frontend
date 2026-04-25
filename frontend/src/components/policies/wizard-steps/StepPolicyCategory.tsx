import React from 'react';
import { Box, Typography, Card, CardActionArea } from '@mui/material';
import { Grid } from '@mui/material';
import {
    Cable as ConnectivityIcon,
    AltRoute as SteeringIcon,
    Security as SecurityIcon
} from '@mui/icons-material';

interface StepPolicyCategoryProps {
    selectedCategory: string;
    setSelectedCategory: (cat: string) => void;
    selectedFlowType: string;
    setSelectedFlowType: (type: string) => void;
}

const CATEGORIES = [
    {
        id: 'connectivity',
        title: 'Connectivity',
        icon: <ConnectivityIcon fontSize="large" color="primary" />,
        description: 'Basic L1/L2 forwarding and routing rules',
        flows: [
            { id: 'base', label: 'Base L1 Forwarding' },
            { id: 'arp-flood', label: 'ARP Flood' },
            { id: 'default-gateway', label: 'Default Gateway' }
        ]
    },
    {
        id: 'steering',
        title: 'Traffic Steering',
        icon: <SteeringIcon fontSize="large" color="secondary" />,
        description: 'Advanced routing and port redirection',
        flows: [
            { id: 'l2-mac', label: 'L2 MAC Steer' },
            { id: 'l3-ip', label: 'L3 IP Steer' },
            { id: 'l3-subnet', label: 'L3 Subnet Steer' },
            { id: 'l4-port', label: 'L4 Port TCP/UDP Redirect' }
        ]
    },
    {
        id: 'acl',
        title: 'ACL & Security',
        icon: <SecurityIcon fontSize="large" color="error" />,
        description: 'Access control and traffic filtering',
        flows: [
            { id: 'block-mac', label: 'Block MAC' },
            { id: 'block-ip', label: 'Block IP / Blacklist' },
            { id: 'block-port', label: 'Block Port' },
            { id: 'whitelist-port', label: 'Whitelist Port' },
            { id: 'icmp-control', label: 'ICMP (Ping) Control' }
        ]
    }
];

export const StepPolicyCategory: React.FC<StepPolicyCategoryProps> = ({
    selectedCategory,
    setSelectedCategory,
    selectedFlowType,
    setSelectedFlowType
}) => {
    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom textAlign="center">
                Select Flow Policy Category
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
                Choose the type of policy you want to enforce onto the node.
            </Typography>

            <Grid container spacing={3}>
                {CATEGORIES.map((cat) => (
                    <Grid size={{ xs: 12, md: 4 }} key={cat.id}>
                        <Card
                            variant="outlined"
                            sx={{
                                height: '100%',
                                borderRadius: 3,
                                borderColor: selectedCategory === cat.id ? 'primary.main' : 'divider',
                                bgcolor: selectedCategory === cat.id ? 'primary.50' : 'background.paper',
                                transition: 'all 0.2s',
                                ...(selectedCategory === cat.id && {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                })
                            }}
                        >
                            <CardActionArea
                                onClick={() => {
                                    setSelectedCategory(cat.id);
                                    setSelectedFlowType(''); // reset flow type when category changes
                                }}
                                sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'background.paper', mr: 2, display: 'flex' }}>
                                        {cat.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={700}>{cat.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">{cat.description}</Typography>
                                    </Box>
                                </Box>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Show flow types for the selected category */}
            {selectedCategory && (
                <Box sx={{ mt: 5 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Select Specific Flow Rule Type:
                    </Typography>
                    <Grid container spacing={2}>
                        {CATEGORIES.find(c => c.id === selectedCategory)?.flows.map(flow => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={flow.id}>
                                <Box
                                    onClick={() => setSelectedFlowType(flow.id)}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: selectedFlowType === flow.id ? 'primary.main' : 'divider',
                                        bgcolor: selectedFlowType === flow.id ? 'primary.50' : 'background.paper',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s',
                                        fontWeight: selectedFlowType === flow.id ? 600 : 400,
                                        color: selectedFlowType === flow.id ? 'primary.dark' : 'text.primary',
                                        '&:hover': {
                                            borderColor: 'primary.light',
                                            bgcolor: 'grey.50'
                                        }
                                    }}
                                >
                                    {flow.label}
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
};
