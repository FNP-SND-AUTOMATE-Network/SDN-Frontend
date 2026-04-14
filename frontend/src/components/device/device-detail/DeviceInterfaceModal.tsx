"use client";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Stack,
    Box,
} from "@mui/material";
import { Close, Cable } from "@mui/icons-material";
import { InterfaceDiscoveryResponse } from "@/services/deviceNetworkService";
import { DeviceInterfaceForm } from "./DeviceInterfaceForm";

type NetworkInterface = InterfaceDiscoveryResponse["interfaces"][0];

interface DeviceInterfaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    interfaceData: NetworkInterface | null;
    mode: "view" | "edit";
    deviceId: string;
    onSuccess: (msg?: string) => void;
}

export function DeviceInterfaceModal({
    isOpen,
    onClose,
    interfaceData,
    mode,
    deviceId,
    onSuccess,
}: DeviceInterfaceModalProps) {
    if (!interfaceData) return null;

    const isEdit = mode === "edit";

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 1 } }}
        >
            <DialogTitle sx={{ pb: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: isEdit ? "primary.50" : "grey.100",
                                color: isEdit ? "primary.main" : "text.secondary",
                            }}
                        >
                            <Cable />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={600} sx={{ fontSize: 18 }}>
                                {isEdit ? "Edit Interface:" : "View Interface:"} {interfaceData.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {interfaceData.type} - {interfaceData.mac_address}
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton onClick={onClose} size="small">
                        <Close fontSize="small" />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
                <DeviceInterfaceForm
                    interfaceData={interfaceData}
                    mode={mode}
                    deviceId={deviceId}
                    onSuccess={(msg) => {
                        onSuccess(msg);
                        onClose();
                    }}
                    onCancel={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}
