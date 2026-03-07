"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/hooks/useSnackbar";
import { $api, fetchClient } from "@/lib/apiv2/fetch";
import { useQueryClient } from "@tanstack/react-query";
import {
    Button,
    Chip,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Skeleton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface DeviceCredentialsSectionProps {
    onSuccess?: () => void;
}

export default function DeviceCredentialsSection({
    onSuccess,
}: DeviceCredentialsSectionProps) {
    const { token } = useAuth();
    const { showSuccess, showError, showWarning } = useSnackbar();
    const queryClient = useQueryClient();

    const [saving, setSaving] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    // Data State
    const [credentialData, setCredentialData] = useState({
        device_username: "",
        device_password: "",
    });

    // Query Device Credentials
    const { data: credentialsRes, isLoading } = $api.useQuery(
        "get",
        "/device-credentials/",
        {
            params: {},
        },
        {
            enabled: !!token, // Ensure we check if user is logged in
            onSuccess: (data: Record<string, unknown>) => {
                setCredentialData((prev) => ({
                    ...prev,
                    device_username: (data?.device_username as string) || "",
                }));
            },
        }
    );

    const hasExistingCredentials = !!credentialsRes?.id;
    const isPasswordSaved = credentialsRes?.has_password;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentialData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const togglePasswordVisibility = () => {
        setShowPasswords((prev) => !prev);
    };

    // Actions
    const handleSaveCredentials = async () => {
        if (!token) return;

        if (!credentialData.device_username.trim() && !hasExistingCredentials) {
            showWarning("Device username is required");
            return;
        }

        try {
            setSaving(true);

            let res, error;

            // If credentials exist, PUT (update) instead of POST (create)
            if (hasExistingCredentials) {
                // Prepare update payload (only send what changed or exists)
                const updatePayload: Record<string, string> = {};
                if (credentialData.device_username.trim()) {
                    updatePayload.device_username = credentialData.device_username;
                }
                if (credentialData.device_password) {
                    updatePayload.device_password = credentialData.device_password;
                }

                ({ data: res, error } = await fetchClient.PUT("/device-credentials/", {
                    body: updatePayload,
                }));
            } else {
                // Create new
                if (!credentialData.device_password) {
                    showWarning("Device password is required for new credentials");
                    setSaving(false);
                    return;
                }
                ({ data: res, error } = await fetchClient.POST("/device-credentials/", {
                    body: {
                        device_username: credentialData.device_username,
                        device_password: credentialData.device_password,
                    },
                }));
            }

            if (error) throw error;

            showSuccess(res?.message || "Device credentials saved successfully!");

            // Reset password field to empty
            setCredentialData({
                device_username: "",
                device_password: "",
            });

            // Refetch stats
            queryClient.invalidateQueries({
                queryKey: ["get", "/device-credentials/"],
            });

            if (onSuccess) onSuccess();
        } catch (err: unknown) {
            console.error("Error saving device credentials:", err);
            showError(
                err instanceof Error
                    ? err.message
                    : (err as { detail?: { msg?: string }[] })?.detail?.[0]?.msg ||
                    "Failed to save device credentials"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCredentials = async () => {
        if (!token || !hasExistingCredentials) return;

        if (
            !confirm(
                "Are you sure you want to delete your device credentials? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            setSaving(true);

            const { data: res, error } = await fetchClient.DELETE(
                "/device-credentials/"
            );

            if (error) throw error;

            showSuccess(res?.message || "Device credentials deleted successfully!");

            // Refetch stats
            queryClient.invalidateQueries({
                queryKey: ["get", "/device-credentials/"],
            });
        } catch (err: unknown) {
            console.error("Error deleting device credentials:", err);
            showError(
                err instanceof Error
                    ? err.message
                    : (err as { detail?: { msg?: string }[] })?.detail?.[0]?.msg ||
                    "Failed to delete device credentials"
            );
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
                <Stack spacing={2}>
                    <Skeleton variant="rounded" width="100%" height={56} />
                    <Skeleton variant="rounded" width="100%" height={56} />
                </Stack>
            </Paper>
        );
    }

    return (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
            >
                <Typography variant="h6" fontWeight={500}>
                    Device Credentials
                </Typography>
                {hasExistingCredentials && (
                    <Chip label="Saved" color="success" size="small" variant="outlined" />
                )}
            </Stack>

            <Grid container spacing={3}>
                {/* Username */}
                <Grid size={{ xs: 12 }}>
                    <TextField
                        fullWidth
                        label="Device Username"
                        name="device_username"
                        value={credentialData.device_username}
                        onChange={handleInputChange}
                        variant="outlined"
                        placeholder="Enter device username"
                    />
                </Grid>

                {/* Password */}
                <Grid size={{ xs: 12 }}>
                    <Typography
                        variant="caption"
                        color="success.main"
                        display="block"
                        mb={1}
                        textAlign="right"
                        sx={{ visibility: isPasswordSaved ? "visible" : "hidden" }}
                    >
                        Currently saved
                    </Typography>
                    <TextField
                        fullWidth
                        label="Device Password"
                        name="device_password"
                        type={showPasswords ? "text" : "password"}
                        value={credentialData.device_password}
                        onChange={handleInputChange}
                        variant="outlined"
                        placeholder={
                            isPasswordSaved && !credentialData.device_password
                                ? "••••••••"
                                : "Enter new device password"
                        }
                        helperText={
                            isPasswordSaved
                                ? "Leave blank to keep existing password"
                                : ""
                        }
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={togglePasswordVisibility}
                                        edge="end"
                                        disabled={isPasswordSaved && !credentialData.device_password}
                                    >
                                        {showPasswords ? (
                                            <Visibility fontSize="small" />
                                        ) : (
                                            <VisibilityOff fontSize="small" />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
            </Grid>

            <Stack direction="row" spacing={2} mt={4}>
                <Button
                    variant="contained"
                    onClick={handleSaveCredentials}
                    disabled={
                        saving ||
                        (!credentialData.device_username &&
                            !credentialData.device_password)
                    }
                >
                    {saving
                        ? "Saving..."
                        : hasExistingCredentials
                            ? "Update Credentials"
                            : "Save Credentials"}
                </Button>

                {hasExistingCredentials && (
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDeleteCredentials}
                        disabled={saving}
                        sx={{ ml: "auto" }}
                    >
                        Delete
                    </Button>
                )}
            </Stack>
        </Paper>
    );
}
