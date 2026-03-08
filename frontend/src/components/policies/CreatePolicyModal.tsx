import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Stepper, Step, StepLabel, Typography, IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { StepTargetDevice } from './wizard-steps/StepTargetDevice';
import { StepPolicyCategory } from './wizard-steps/StepPolicyCategory';
import { StepPolicyConfig } from './wizard-steps/StepPolicyConfig';
import { $api } from '@/lib/apiv2/fetch';
import { useSnackbar } from '@/hooks/useSnackbar';
import { MuiSnackbar } from '@/components/ui/MuiSnackbar';

interface CreatePolicyModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const steps = ['Select Target Device', 'Select Policy Category', 'Configure Policy'];

export const CreatePolicyModal: React.FC<CreatePolicyModalProps> = ({ open, onClose, onSuccess }) => {
    const [activeStep, setActiveStep] = useState(0);

    // Form State
    const [selectedNodeId, setSelectedNodeId] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedFlowType, setSelectedFlowType] = useState<string>('');
    const [formData, setFormData] = useState<any>({});
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

    const addFlowMutation = $api.useMutation('post', '/api/v1/nbi/devices/{node_id}/flows/connectivity/base');
    const addArpFloodMutation = $api.useMutation('post', '/api/v1/nbi/devices/{node_id}/flows/connectivity/arp-flood');
    const addDefaultGatewayMutation = $api.useMutation('post', '/api/v1/nbi/devices/{node_id}/flows/connectivity/default-gateway');

    const addMacSteerMutation = $api.useMutation('post', '/api/v1/nbi/devices/{node_id}/flows/steering/l2-mac');
    const addIpSteerMutation = $api.useMutation('post', '/api/v1/nbi/devices/{node_id}/flows/steering/l3-ip');
    const addSubnetSteerMutation = $api.useMutation('post', '/api/v1/nbi/devices/{node_id}/flows/steering/l3-subnet');
    const addPortSteerMutation = $api.useMutation('post', '/api/v1/nbi/devices/{node_id}/flows/steering/l4-port');

    const addAclMacMutation = $api.useMutation('post', '/api/v1/nbi/devices/{node_id}/flows/acl/block-mac');
    const addAclIpMutation = $api.useMutation('post', '/api/v1/nbi/devices/{node_id}/flows/acl/block-ip');
    const addAclPortDropMutation = $api.useMutation('post', '/api/v1/nbi/devices/{node_id}/flows/acl/block-port');
    const addAclPortWhitelistMutation = $api.useMutation('post', '/api/v1/nbi/devices/{node_id}/flows/acl/whitelist-port');
    const addAclIcmpMutation = $api.useMutation('post', '/api/v1/nbi/devices/{node_id}/flows/acl/icmp-control');

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleClose = () => {
        setActiveStep(0);
        setSelectedNodeId('');
        setSelectedCategory('');
        setSelectedFlowType('');
        setFormData({});
        onClose();
    };

    const handleSubmit = async () => {
        try {
            const params = { path: { node_id: selectedNodeId } };
            const payload: any = { ...formData }; // Assume formData is correctly shaped by StepPolicyConfig

            let mutationToCall;

            switch (selectedFlowType) {
                case 'base': mutationToCall = addFlowMutation; break;
                case 'arp-flood': mutationToCall = addArpFloodMutation; break;
                case 'default-gateway': mutationToCall = addDefaultGatewayMutation; break;

                case 'l2-mac': mutationToCall = addMacSteerMutation; break;
                case 'l3-ip': mutationToCall = addIpSteerMutation; break;
                case 'l3-subnet': mutationToCall = addSubnetSteerMutation; break;
                case 'l4-port': mutationToCall = addPortSteerMutation; break;

                case 'block-mac': mutationToCall = addAclMacMutation; break;
                case 'block-ip': mutationToCall = addAclIpMutation; break;
                case 'block-port': mutationToCall = addAclPortDropMutation; break;
                case 'whitelist-port': mutationToCall = addAclPortWhitelistMutation; break;
                case 'icmp-control': mutationToCall = addAclIcmpMutation; break;

                default:
                    throw new Error("Unknown flow type selected");
            }

            // Await execution of the dynamic mutation
            await mutationToCall.mutateAsync({
                params: params,
                body: payload
            } as any);

            showSnackbar('success', `Successfully added ${selectedFlowType} policy!`);
            onSuccess();
            handleClose();
        } catch (error: any) {
            console.error("Failed to add policy:", error);
            let errorMsg = error.message || 'Unknown error';

            // Check for FastAPI validation error array shape
            if (error.detail && Array.isArray(error.detail)) {
                errorMsg = error.detail.map((err: any) => err.msg).join(' | ');
            } else if (error.detail && typeof error.detail === 'string') {
                errorMsg = error.detail;
            }

            showSnackbar('error', `Error: ${errorMsg}`);
        }
    };

    // Step Renders - To be implemented in separate files
    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <StepTargetDevice
                        nodeId={selectedNodeId}
                        setNodeId={setSelectedNodeId}
                    />
                );
            case 1:
                return (
                    <StepPolicyCategory
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        selectedFlowType={selectedFlowType}
                        setSelectedFlowType={setSelectedFlowType}
                    />
                );
            case 2:
                return (
                    <StepPolicyConfig
                        nodeId={selectedNodeId}
                        category={selectedCategory}
                        flowType={selectedFlowType}
                        formData={formData}
                        setFormData={setFormData}
                    />
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography component="div" variant="h6" fontWeight="bold">Add New Flow Policy</Typography>
                <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>
                <Box sx={{ p: 4, flex: 1, overflowY: 'auto' }}>
                    {renderStepContent(activeStep)}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button onClick={handleClose} color="inherit" sx={{ mr: 'auto' }}>
                    Cancel
                </Button>
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                >
                    Back
                </Button>
                {activeStep === steps.length - 1 ? (
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                ) : (
                    <Button
                        disabled={
                            (activeStep === 0 && !selectedNodeId) ||
                            (activeStep === 1 && (!selectedCategory || !selectedFlowType))
                        }
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                )}
            </DialogActions>

            {/* Render Snackbar instance tied to this Modal */}
            <MuiSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                title={snackbar.title}
                onClose={hideSnackbar}
            />
        </Dialog>
    );
};
