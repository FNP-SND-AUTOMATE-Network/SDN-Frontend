import React, { useEffect } from 'react';
import { Box, Typography, TextField, Divider } from '@mui/material';
import Grid from '@mui/material/Grid';

interface StepPolicyConfigProps {
    nodeId: string;
    category: string;
    flowType: string;
    formData: any;
    setFormData: (data: any) => void;
}

export const StepPolicyConfig: React.FC<StepPolicyConfigProps> = ({
    nodeId,
    category,
    flowType,
    formData,
    setFormData
}) => {
    // Initialize standard fields on mount or type change
    useEffect(() => {
        setFormData((prev: any) => ({
            ...prev,
            // Default auto-generated ID if missing
            flow_id: prev.flow_id || `flow-${Date.now().toString().slice(-6)}`,
            priority: prev.priority || 100,
            table_id: prev.table_id || 0,
            // connectivity defaults
            in_port: prev.in_port || '',
            out_port: prev.out_port || '',
            src_mac: prev.src_mac || '',
            dst_mac: prev.dst_mac || '',
            gateway_ip: prev.gateway_ip || '',
            gateway_mac: prev.gateway_mac || '',
            router_port: prev.router_port || '',
            // steering defaults
            dst_ip: prev.dst_ip || '',
            dst_subnet: prev.dst_subnet || '',
            protocol: prev.protocol || 'TCP',
            dst_port: prev.dst_port || '',
            // acl defaults
            src_ip: prev.src_ip || '',
            port: prev.port || '',
            icmp_type: prev.icmp_type || 8,
            icmp_code: prev.icmp_code || 0,
        }));
    }, [flowType, setFormData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const renderDynamicFields = () => {
        switch (flowType) {
            // ==== CONNECTIVITY ====
            case 'base':
                return (
                    <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="In Port" name="in_port" value={formData.in_port || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Out Port" name="out_port" value={formData.out_port || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Source MAC" name="src_mac" value={formData.src_mac || ''} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Destination MAC" name="dst_mac" value={formData.dst_mac || ''} onChange={handleChange} />
                        </Grid>
                    </>
                );
            case 'arp-flood':
                return (
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" color="text.secondary">
                            ARP Flood policy simply matches ARP packets and sets action to FLOOD on Table 0.
                            No extra parameters needed.
                        </Typography>
                    </Grid>
                );
            case 'default-gateway':
                return (
                    <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Gateway IP" name="gateway_ip" value={formData.gateway_ip || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Gateway MAC" name="gateway_mac" value={formData.gateway_mac || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Router Port" name="router_port" value={formData.router_port || ''} onChange={handleChange} required />
                        </Grid>
                    </>
                );

            // ==== TRAFFIC STEERING ====
            case 'l2-mac':
                return (
                    <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Destination MAC" name="dst_mac" value={formData.dst_mac || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Output Port" name="out_port" value={formData.out_port || ''} onChange={handleChange} required />
                        </Grid>
                    </>
                );
            case 'l3-ip':
                return (
                    <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Destination IP" name="dst_ip" value={formData.dst_ip || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Output Port" name="out_port" value={formData.out_port || ''} onChange={handleChange} required />
                        </Grid>
                    </>
                );
            case 'l3-subnet':
                return (
                    <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Destination Subnet (e.g. 10.0.0.0/24)" name="dst_subnet" value={formData.dst_subnet || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Output Port" name="out_port" value={formData.out_port || ''} onChange={handleChange} required />
                        </Grid>
                    </>
                );
            case 'l4-port':
                return (
                    <>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="Protocol (TCP/UDP)" name="protocol" value={formData.protocol || 'TCP'} onChange={handleChange} required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="Destination Port" name="dst_port" type="number" value={formData.dst_port || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="Output Port" name="out_port" value={formData.out_port || ''} onChange={handleChange} required />
                        </Grid>
                    </>
                );

            // ==== ACL & SECURITY ====
            case 'block-mac':
                return (
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Source MAC to Drop" name="src_mac" value={formData.src_mac || ''} onChange={handleChange} required />
                    </Grid>
                );
            case 'block-ip':
                return (
                    <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Source IP" name="src_ip" value={formData.src_ip || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Destination IP" name="dst_ip" value={formData.dst_ip || ''} onChange={handleChange} required />
                        </Grid>
                    </>
                );
            case 'block-port':
            case 'whitelist-port':
                return (
                    <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Protocol (TCP/UDP)" name="protocol" value={formData.protocol || 'TCP'} onChange={handleChange} required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Target Port" name="port" type="number" value={formData.port || ''} onChange={handleChange} required />
                        </Grid>
                    </>
                );
            case 'icmp-control':
                return (
                    <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="ICMP Type (e.g. 8 for Echo Request)" name="icmp_type" type="number" value={formData.icmp_type || 8} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="ICMP Code" name="icmp_code" type="number" value={formData.icmp_code || 0} onChange={handleChange} />
                        </Grid>
                    </>
                );
            default:
                return (
                    <Grid size={{ xs: 12 }}>
                        <Typography color="error">Unknown Flow Type Selected</Typography>
                    </Grid>
                );
        }
    };
    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    Configure Policy Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Target Node: <strong>{nodeId}</strong> | Flow Type: <strong>{flowType}</strong>
                </Typography>
            </Box>

            <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                    Standard Policy Parameters
                </Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField fullWidth label="Flow ID" name="flow_id" value={formData.flow_id || ''} onChange={handleChange} required helperText="Unique identifier for the flow" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField fullWidth label="Priority" name="priority" type="number" value={formData.priority || 100} onChange={handleChange} required />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField fullWidth label="Table ID" name="table_id" type="number" value={formData.table_id || 0} onChange={handleChange} required />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                    Flow Match & Action Parameters
                </Typography>
                <Grid container spacing={3}>
                    {renderDynamicFields()}
                </Grid>
            </Box>
        </Box>
    );
};
