"use client";

import React, { useState, useEffect } from "react";
import { fetchClient } from "@/lib/apiv2/fetch";
import { components } from "@/lib/apiv2/schema";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    IconButton,
    Alert,
    CircularProgress,
    FormControlLabel,
    Checkbox,
    Typography,
    Box,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

type IpAddressResponse = components["schemas"]["IpAddressResponse"];

interface IPAddressFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    address?: IpAddressResponse | null; // For edit mode
    subnetId: string;
}

export default function IPAddressFormModal({
    isOpen,
    onClose,
    onSuccess,
    address,
    subnetId,
}: IPAddressFormModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [ip, setIp] = useState("");
    const [hostname, setHostname] = useState("");
    const [description, setDescription] = useState("");
    const [mac, setMac] = useState("");
    const [isGateway, setIsGateway] = useState(false);

    const isEditMode = !!address;

    // Reset form when modal opens/closes or address changes
    useEffect(() => {
        if (isOpen) {
            if (address) {
                setIp((address as any).ip || "");
                setHostname(address.hostname || "");
                setDescription(address.description || "");
                setMac(address.mac || "");
                setIsGateway((address as any).is_gateway === "1" || (address as any).is_gateway === 1);
            } else {
                setIp("");
                setHostname("");
                setDescription("");
                setMac("");
                setIsGateway(false);
            }
            setError(null);
        }
    }, [isOpen, address]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        setError(null);

        try {
            if (isEditMode && address) {
                const { error } = await fetchClient.PATCH("/ipam/addresses/{address_id}", {
                    params: { path: { address_id: address.id } },
                    body: {
                        hostname: hostname.trim() || undefined,
                        description: description.trim() || undefined,
                        mac: mac.trim() || undefined,
                        is_gateway: isGateway,
                    } as any, // Type cast to bypass swagger typing issues if any
                });
                if (error) throw new Error((error as any).message || "Failed to update IP address");
            } else {
                const { error } = await fetchClient.POST("/ipam/addresses", {
                    body: {
                        subnet_id: subnetId,
                        ip_address: ip.trim(),
                        hostname: hostname.trim() || undefined,
                        description: description.trim() || undefined,
                        mac: mac.trim() || undefined,
                        is_gateway: isGateway,
                    } as any,
                });
                if (error) throw new Error((error as any).message || "Failed to create IP address");
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save IP address");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onClose={!isLoading ? onClose : undefined} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {isEditMode ? "Edit IP Address" : "Add IP Address"}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    disabled={isLoading}
                    sx={{ color: "text.secondary" }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Box>
                            <TextField
                                fullWidth
                                label="IP Address"
                                value={ip}
                                onChange={(e) => setIp(e.target.value)}
                                required
                                disabled={isEditMode || isLoading}
                                placeholder="e.g. 192.168.1.1"
                                variant="outlined"
                            />
                            {isEditMode && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                                    IP address cannot be changed. Delete and create a new one if needed.
                                </Typography>
                            )}
                        </Box>

                        <TextField
                            fullWidth
                            label="Hostname"
                            value={hostname}
                            onChange={(e) => setHostname(e.target.value)}
                            disabled={isLoading}
                            placeholder="e.g. server01.example.com"
                            variant="outlined"
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isLoading}
                            placeholder="Enter description (optional)"
                            variant="outlined"
                            multiline
                            rows={2}
                        />

                        <TextField
                            fullWidth
                            label="MAC Address"
                            value={mac}
                            onChange={(e) => setMac(e.target.value)}
                            disabled={isLoading}
                            placeholder="e.g. 00:1A:2B:3C:4D:5E"
                            variant="outlined"
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isGateway}
                                    onChange={(e) => setIsGateway(e.target.checked)}
                                    color="primary"
                                    disabled={isLoading}
                                />
                            }
                            label="This is a Gateway"
                        />
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ p: 2, px: 3 }}>
                    <Button onClick={onClose} disabled={isLoading} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading || (!isEditMode && !ip.trim())}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isEditMode ? "Save Changes" : "Add IP Address"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
