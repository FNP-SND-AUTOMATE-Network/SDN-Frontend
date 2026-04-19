import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    CircularProgress,
    Alert,
    Tooltip,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired, faMagic } from '@fortawesome/free-solid-svg-icons';
import { $api } from '@/lib/apiv2/fetch';

interface IPPickerProps {
    onIpSelect: (ip: string, subnetId?: string) => void;
    disabled?: boolean;
}

export default function IPPicker({ onIpSelect, disabled }: IPPickerProps) {
    const [open, setOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectedSubnet, setSelectedSubnet] = useState<string>('');
    const [allocatedIp, setAllocatedIp] = useState<string | null>(null);

    // 1. Fetch Sections
    const { data: sectionsData, isLoading: isLoadingSections } = $api.useQuery(
        "get",
        "/ipam/sections",
        {},
        { enabled: open }
    );
    const sections = (sectionsData as any)?.items || (sectionsData as any)?.sections || [];

    // 2. Fetch Subnets based on Section
    const { data: subnetsData, isLoading: isLoadingSubnets } = $api.useQuery(
        "get",
        "/ipam/sections/{section_id}/subnets",
        { params: { path: { section_id: selectedSection } } },
        { enabled: open && !!selectedSection }
    );
    const subnets = (subnetsData as any)?.items || (subnetsData as any)?.subnets || [];

    // 3. Fetch Space Map based on Subnet
    const { data: spaceMapData, isLoading: isSpaceMapLoading } = $api.useQuery(
        "get",
        "/ipam/subnets/{subnet_id}/space-map",
        { params: { path: { subnet_id: selectedSubnet } } },
        { enabled: open && !!selectedSubnet }
    );
    const spaceMapAddresses = spaceMapData?.addresses || [];

    // 4. Auto Allocate First Free IP (Manual trigger)
    const { refetch: fetchFirstFree, isFetching: isFetchingFreeIp, error: freeIpError } = $api.useQuery(
        "get",
        "/ipam/subnets/{subnet_id}/first_free" as any,
        { params: { path: { subnet_id: selectedSubnet } } },
        { enabled: false }
    );

    const handleAllocate = async () => {
        if (!selectedSubnet) return;
        setAllocatedIp(null);
        const res = (await fetchFirstFree()) as any;
        if (res.data) {
            const ip = typeof res.data === 'string' ? res.data : (res.data as any).ip_address || (res.data as any).ip;
            setAllocatedIp(ip);
        }
    };

    const handleConfirm = () => {
        if (allocatedIp) {
            onIpSelect(allocatedIp, selectedSubnet || undefined);
            handleClose();
        }
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedSection('');
        setSelectedSubnet('');
        setAllocatedIp(null);
    };

    const handleSelectIp = (ip: string, status: string) => {
        if (status.toLowerCase().includes('free') || status.toLowerCase().includes('available') || status.toLowerCase().includes('reserved')) {
            setAllocatedIp(ip);
        }
    };

    // Helper functions for Box styles
    const getStatusStyles = (status: string, isSelected: boolean) => {
        const lower = status.toLowerCase();
        let baseBg = "grey.200";
        let baseColor = "grey.700";
        let baseBorder = "grey.300";
        let cursor = "default";
        let hover = {};

        if (lower.includes('free') || lower.includes('available')) {
            baseBg = "success.50";
            baseColor = "success.dark";
            baseBorder = "success.300";
            cursor = "pointer";
            hover = { bgcolor: "success.100", borderColor: "success.main" };
        } else if (lower.includes('used') || lower.includes('allocated') || lower.includes('active')) {
            baseBg = "info.50";
            baseColor = "info.dark";
            baseBorder = "info.300";
        } else if (lower.includes('offline') || lower.includes('retired')) {
            baseBg = "error.50";
            baseColor = "error.dark";
            baseBorder = "error.300";
        } else if (lower.includes('reserved')) {
            baseBg = "warning.50";
            baseColor = "warning.dark";
            baseBorder = "warning.300";
            cursor = "pointer";
            hover = { bgcolor: "warning.100", borderColor: "warning.main" };
        }

        if (isSelected) {
            baseBg = "primary.main";
            baseColor = "white";
            baseBorder = "primary.dark";
            hover = { bgcolor: "primary.dark" };
        }

        return {
            bgcolor: baseBg,
            color: baseColor,
            borderColor: baseBorder,
            cursor,
            "&:hover": hover
        };
    };

    return (
        <>
            <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => setOpen(true)}
                disabled={disabled}
                startIcon={<FontAwesomeIcon icon={faNetworkWired} />}
                sx={{ 
                    height: '40px', 
                    borderRadius: 1.5,
                    fontFamily: 'SF Pro Text, -apple-system, sans-serif',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: 'grey.300',
                    color: 'text.primary',
                    '&:hover': {
                        bgcolor: 'grey.50',
                        borderColor: 'grey.400'
                    }
                }}
            >
                IPAM
            </Button>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 600, borderBottom: 1, borderColor: "divider", pb: 1.5 }}>
                    Allocate IP from IPAM Space Map
                </DialogTitle>
                <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="section-select-label">Section</InputLabel>
                            <Select
                                labelId="section-select-label"
                                label="Section"
                                value={selectedSection}
                                onChange={(e) => {
                                    setSelectedSection(e.target.value);
                                    setSelectedSubnet('');
                                    setAllocatedIp(null);
                                }}
                                disabled={isLoadingSections}
                            >
                                <MenuItem value="" disabled>-- Select Section --</MenuItem>
                                {Array.isArray(sections) && sections.length === 0 && !isLoadingSections && (
                                    <MenuItem disabled>No Sections Found</MenuItem>
                                )}
                                {Array.isArray(sections) && sections.map((sec: any) => (
                                    <MenuItem key={sec.id} value={sec.id}>
                                        {sec.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel id="subnet-select-label">Subnet</InputLabel>
                            <Select
                                labelId="subnet-select-label"
                                label="Subnet"
                                value={selectedSubnet}
                                onChange={(e) => {
                                    setSelectedSubnet(e.target.value);
                                    setAllocatedIp(null);
                                }}
                                disabled={!selectedSection || isLoadingSubnets}
                            >
                                <MenuItem value="" disabled>
                                    {!selectedSection ? "Please select a Section first" : "-- Select Subnet --"}
                                </MenuItem>
                                {Array.isArray(subnets) && subnets.length === 0 && !!selectedSection && !isLoadingSubnets && (
                                    <MenuItem disabled>No Subnets Found in this Section</MenuItem>
                                )}
                                {Array.isArray(subnets) && subnets.map((sub: any) => (
                                    <MenuItem key={sub.id} value={sub.id}>
                                        {sub.subnet} {sub.name ? `(${sub.name})` : ''}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {selectedSubnet && (
                        <Box sx={{ 
                            p: 2, 
                            border: 1, 
                            borderColor: 'grey.200', 
                            borderRadius: 2, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 2,
                            minHeight: 200,
                            position: 'relative'
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2" fontWeight={600}>Space Map</Typography>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                                        <Typography variant="caption" color="text.secondary">Free</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'info.main' }} />
                                        <Typography variant="caption" color="text.secondary">Used</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                        <Typography variant="caption" color="text.secondary">Reserved</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                                        <Typography variant="caption" color="text.secondary">Offline</Typography>
                                    </Box>
                                </Box>
                            </Box>
                            
                            {isSpaceMapLoading ? (
                                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : spaceMapAddresses.length > 0 ? (
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: 1,
                                    maxHeight: 300,
                                    overflowY: 'auto',
                                    p: 1
                                }}>
                                    {spaceMapAddresses.map((entry, idx) => {
                                        const ipString = entry.ip;
                                        const lastOctet = ipString.split('.').pop() || ipString;
                                        const isSelected = allocatedIp === entry.ip;
                                        
                                        return (
                                            <Tooltip 
                                                key={idx} 
                                                title={
                                                    <Box sx={{ p: 0.5 }}>
                                                        <Typography variant="body2" fontWeight={600} display="block">{entry.ip}</Typography>
                                                        <Typography variant="caption" display="block">Status: {entry.status}</Typography>
                                                        {entry.hostname && <Typography variant="caption" display="block">Host: {entry.hostname}</Typography>}
                                                        {entry.description && <Typography variant="caption" display="block">Desc: {entry.description}</Typography>}
                                                    </Box>
                                                } 
                                                arrow
                                                placement="top"
                                            >
                                                <Box
                                                    onClick={() => handleSelectIp(entry.ip, entry.status)}
                                                    sx={{
                                                        minWidth: '40px',
                                                        height: '40px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: 1,
                                                        border: 1,
                                                        fontSize: '0.8rem',
                                                        fontWeight: 600,
                                                        fontFamily: 'SFMono-Regular, monospace',
                                                        transition: 'all 0.2s ease',
                                                        ...getStatusStyles(entry.status, isSelected)
                                                    }}
                                                >
                                                    .{lastOctet}
                                                </Box>
                                            </Tooltip>
                                        );
                                    })}
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">No space map data available.</Typography>
                                </Box>
                            )}
                        </Box>
                    )}

                    {freeIpError && (
                        <Alert severity="error">
                            No free IPs available in this subnet or an error occurred.
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Button
                            variant="outlined"
                            onClick={handleAllocate}
                            disabled={!selectedSubnet || isFetchingFreeIp}
                            startIcon={isFetchingFreeIp ? <CircularProgress size={16} /> : <FontAwesomeIcon icon={faMagic} />}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 500
                            }}
                        >
                            Find Free IP
                        </Button>
                        
                        {allocatedIp && (
                            <Box sx={{ 
                                flex: 1, 
                                p: 1, 
                                bgcolor: 'success.50', 
                                color: 'success.dark', 
                                borderRadius: 1, 
                                border: 1, 
                                borderColor: 'success.200', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1 
                            }}>
                                <Typography variant="body2" fontWeight={600}>
                                    Selected IP:
                                </Typography>
                                <Typography variant="body1" fontFamily="SFMono-Regular, monospace" fontWeight={700}>
                                    {allocatedIp}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, borderTop: 1, borderColor: "divider" }}>
                    <Button onClick={handleClose} color="inherit">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirm} 
                        disabled={!allocatedIp}
                        variant="contained" 
                        color="primary"
                    >
                        Use this IP
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
