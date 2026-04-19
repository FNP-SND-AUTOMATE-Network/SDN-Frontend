import React, { useState, useEffect } from 'react';
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
    Chip,
    IconButton,
    Breadcrumbs,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Lan as LanIcon,
    NavigateBefore as PrevIcon,
    NavigateNext as NextIcon,
} from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic } from '@fortawesome/free-solid-svg-icons';
import { $api } from '@/lib/apiv2/fetch';

const PICKER_PAGE_SIZE = 256;

interface IPPickerProps {
    onIpSelect: (ip: string, subnetId?: string) => void;
    disabled?: boolean;
}

export default function IPPicker({ onIpSelect, disabled }: IPPickerProps) {
    const [open, setOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectedSubnet, setSelectedSubnet] = useState<string>('');
    const [allocatedIp, setAllocatedIp] = useState<string | null>(null);
    // Breadcrumb navigation for child subnets
    const [subnetBreadcrumbs, setSubnetBreadcrumbs] = useState<{ id: string; label: string }[]>([]);
    // Pagination state for space map
    const [spaceMapPage, setSpaceMapPage] = useState(0);

    // Reset page when subnet changes
    useEffect(() => { setSpaceMapPage(0); }, [selectedSubnet]);

    // 1. Fetch Sections
    const { data: sectionsData, isLoading: isLoadingSections } = $api.useQuery(
        "get",
        "/ipam/sections",
        {},
        { enabled: open }
    );
    const sections = (sectionsData as any)?.items || (sectionsData as any)?.sections || [];

    // 2. Fetch Subnets based on Section (root subnets)
    const { data: subnetsData, isLoading: isLoadingSubnets } = $api.useQuery(
        "get",
        "/ipam/sections/{section_id}/subnets",
        { params: { path: { section_id: selectedSection } } },
        { enabled: open && !!selectedSection }
    );
    const subnets = (subnetsData as any)?.items || (subnetsData as any)?.subnets || [];

    // 3. Fetch Child Subnets for current selected subnet
    const { data: childSubnetsData, isLoading: isLoadingChildren } = $api.useQuery(
        "get",
        "/ipam/subnets/{subnet_id}/children",
        { params: { path: { subnet_id: selectedSubnet } } },
        { enabled: open && !!selectedSubnet }
    );
    const childSubnets = (childSubnetsData as any)?.subnets || [];

    // 4. Fetch Space Map with pagination
    const spaceMapOffset = spaceMapPage * PICKER_PAGE_SIZE;
    const { data: spaceMapData, isLoading: isSpaceMapLoading, isFetching: isSpaceMapFetching } = $api.useQuery(
        "get",
        "/ipam/subnets/{subnet_id}/space-map",
        {
            params: {
                path: { subnet_id: selectedSubnet },
                query: { offset: spaceMapOffset, limit: PICKER_PAGE_SIZE } as any,
            },
        },
        { enabled: open && !!selectedSubnet, keepPreviousData: true }
    );
    const spaceMapAddresses = spaceMapData?.addresses || [];
    const totalHosts = spaceMapData?.total_hosts || 0;
    const totalPages = Math.max(1, Math.ceil(totalHosts / PICKER_PAGE_SIZE));
    const hasMore = (spaceMapData as any)?.has_more ?? false;

    // 5. Auto Allocate First Free IP (Manual trigger)
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
        setSubnetBreadcrumbs([]);
        setSpaceMapPage(0);
    };

    const handleSelectIp = (ip: string, status: string) => {
        if (status.toLowerCase().includes('free') || status.toLowerCase().includes('available') || status.toLowerCase().includes('reserved')) {
            setAllocatedIp(ip);
        }
    };

    // Navigate into a child subnet
    const handleDrillDown = (childSubnet: any) => {
        // Push current subnet to breadcrumbs before navigating
        setSubnetBreadcrumbs(prev => [
            ...prev,
            { id: selectedSubnet, label: `${childSubnet._parentLabel || ''}` }
        ]);
        setSelectedSubnet(childSubnet.id);
        setAllocatedIp(null);
    };

    // Navigate back via breadcrumb
    const handleBreadcrumbBack = (index: number) => {
        const target = subnetBreadcrumbs[index];
        setSelectedSubnet(target.id);
        setSubnetBreadcrumbs(prev => prev.slice(0, index));
        setAllocatedIp(null);
    };

    // Navigate back to root subnet selection
    const handleBackToSubnetSelect = () => {
        if (subnetBreadcrumbs.length > 0) {
            const last = subnetBreadcrumbs[subnetBreadcrumbs.length - 1];
            setSelectedSubnet(last.id);
            setSubnetBreadcrumbs(prev => prev.slice(0, -1));
        }
        setAllocatedIp(null);
    };

    // Handle subnet selection from dropdown (initial selection)
    const handleSubnetSelect = (subnetId: string) => {
        setSelectedSubnet(subnetId);
        setSubnetBreadcrumbs([]);
        setAllocatedIp(null);
        setSpaceMapPage(0);
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
        } else if (lower.includes('dhcp')) {
            baseBg = "secondary.50";
            baseColor = "secondary.dark";
            baseBorder = "secondary.300";
        } else if (lower.includes('gateway')) {
            baseBg = "secondary.50";
            baseColor = "secondary.dark";
            baseBorder = "secondary.300";
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

    // Get current subnet label for display
    const currentSubnetObj = subnets.find((s: any) => s.id === selectedSubnet);
    const currentSubnetLabel = currentSubnetObj
        ? `${currentSubnetObj.subnet}/${currentSubnetObj.mask || ''}`
        : (spaceMapData ? `${spaceMapData.subnet}/${spaceMapData.mask}` : selectedSubnet);

    return (
        <>
            <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => setOpen(true)}
                disabled={disabled}
                startIcon={<LanIcon />}
                sx={{ 
                    height: '40px', 
                    borderRadius: 1.5,
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
                                    setSubnetBreadcrumbs([]);
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
                                onChange={(e) => handleSubnetSelect(e.target.value)}
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
                                        {sub.subnet}/{sub.mask} {sub.description ? `— ${sub.description}` : ''}
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
                            {/* Header with breadcrumbs */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {subnetBreadcrumbs.length > 0 && (
                                        <IconButton size="small" onClick={handleBackToSubnetSelect} sx={{ mr: 0.5 }}>
                                            <ArrowBackIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        Space Map — {currentSubnetLabel}
                                    </Typography>
                                    {totalPages > 1 && spaceMapAddresses.length > 0 && (
                                        <Chip
                                            label={`${spaceMapAddresses[0].ip} — ${spaceMapAddresses[spaceMapAddresses.length - 1].ip}`}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{ fontSize: "0.7rem" }}
                                        />
                                    )}
                                    {isSpaceMapFetching && <CircularProgress size={14} />}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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

                            {/* Breadcrumb trail */}
                            {subnetBreadcrumbs.length > 0 && (
                                <Breadcrumbs separator="›" sx={{ fontSize: '0.75rem' }}>
                                    {subnetBreadcrumbs.map((bc, idx) => (
                                        <Typography
                                            key={idx}
                                            variant="caption"
                                            sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                                            onClick={() => handleBreadcrumbBack(idx)}
                                        >
                                            {bc.label || 'Parent'}
                                        </Typography>
                                    ))}
                                    <Typography variant="caption" color="text.primary" fontWeight={600}>
                                        {currentSubnetLabel}
                                    </Typography>
                                </Breadcrumbs>
                            )}

                            {/* Child Subnets - show as clickable chips to drill down */}
                            {!isLoadingChildren && childSubnets.length > 0 && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                        Child Subnets (click to drill down):
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {childSubnets.map((child: any) => (
                                            <Chip
                                                key={child.id}
                                                icon={<LanIcon sx={{ fontSize: 14 }} />}
                                                label={`${child.subnet}/${child.mask}${child.description ? ` — ${child.description}` : ''}`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                onClick={() => handleDrillDown({ ...child, _parentLabel: currentSubnetLabel })}
                                                sx={{
                                                    cursor: 'pointer',
                                                    fontWeight: 500,
                                                    '&:hover': { bgcolor: 'primary.50', borderColor: 'primary.main' }
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                            {isLoadingChildren && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CircularProgress size={14} />
                                    <Typography variant="caption" color="text.secondary">Loading child subnets...</Typography>
                                </Box>
                            )}
                            
                            {isSpaceMapLoading && spaceMapAddresses.length === 0 ? (
                                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : spaceMapAddresses.length > 0 ? (
                                <Box>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexWrap: 'wrap', 
                                        gap: 1,
                                        maxHeight: 300,
                                        overflowY: 'auto',
                                        p: 1,
                                        opacity: isSpaceMapFetching ? 0.5 : 1,
                                        transition: 'opacity 0.2s',
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

                                    {/* Pagination controls */}
                                    {totalPages > 1 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                disabled={spaceMapPage === 0 || isSpaceMapFetching}
                                                onClick={() => setSpaceMapPage(p => Math.max(0, p - 1))}
                                                startIcon={<PrevIcon />}
                                                sx={{ textTransform: 'none', minWidth: 80 }}
                                            >
                                                Prev
                                            </Button>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                Page {spaceMapPage + 1} / {totalPages}
                                                {isSpaceMapFetching && ' …'}
                                            </Typography>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                disabled={!hasMore || isSpaceMapFetching}
                                                onClick={() => setSpaceMapPage(p => p + 1)}
                                                endIcon={<NextIcon />}
                                                sx={{ textTransform: 'none', minWidth: 80 }}
                                            >
                                                Next
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {childSubnets.length > 0 ? 'This subnet contains child subnets. Select one above to view IPs.' : 'No space map data available.'}
                                    </Typography>
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
