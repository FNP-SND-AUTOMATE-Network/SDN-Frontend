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
    Alert
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired, faMagic } from '@fortawesome/free-solid-svg-icons';
import { $api } from '@/lib/apiv2/fetch';

interface IPPickerProps {
    onIpSelect: (ip: string) => void;
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

    // 3. Auto Allocate First Free IP
    const { refetch: fetchFirstFree, isFetching: isFetchingFreeIp, error: freeIpError } = $api.useQuery(
        "get",
        "/ipam/subnets/{subnet_id}/first_free" as any,
        { params: { path: { subnet_id: selectedSubnet } } },
        { enabled: false } // Only fetch manually on button click
    );

    const handleAllocate = async () => {
        if (!selectedSubnet) return;
        setAllocatedIp(null);
        const res = (await fetchFirstFree()) as any;
        if (res.data) {
            // Check based on API response structure. Schema describes it might return direct string or an object with ip_address
            const ip = typeof res.data === 'string' ? res.data : (res.data as any).ip_address || (res.data as any).ip;
            setAllocatedIp(ip);
        }
    };

    const handleConfirm = () => {
        if (allocatedIp) {
            onIpSelect(allocatedIp);
            handleClose();
        }
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedSection('');
        setSelectedSubnet('');
        setAllocatedIp(null);
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
                IPAM Select
            </Button>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600, borderBottom: 1, borderColor: "divider", pb: 1.5 }}>
                    Allocate IP from IPAM
                </DialogTitle>
                <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        Select a section and subnet to automatically find the next available IP address.
                    </Typography>

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
                                    Suggested IP:
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
