"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { useSnackbar } from "@/hooks/useSnackbar";
import { $api, fetchClient } from "@/lib/apiv2/fetch";
import { useQueryClient } from "@tanstack/react-query";
import { Container, Stack } from "@mui/material";
import {
    ProfileHeader,
    ErrorMessage,
    PersonalInformation,
    ChangePasswordSection,
    ProfileSkeleton,
    DeviceCredentialsSection,
} from "@/components/profile";
import { UserProfile } from "@/services/userService";

export default function ProfilePage() {
    const { isAuthenticated, updateUser } = useAuth();
    const { snackbar, showSuccess, showError, showWarning, hideSnackbar } = useSnackbar();
    const queryClient = useQueryClient();

    // Form states
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        email: "",
    });

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    // Query User Profile
    const { data: userProfile, isLoading, error: queryError } = $api.useQuery(
        "get",
        "/users/profile/me",
        {
            params: {},
        },
        {
            enabled: isAuthenticated,
            onSuccess: (data: Record<string, unknown>) => {
                setFormData({
                    name: (data?.name as string) || "",
                    surname: (data?.surname as string) || "",
                    email: (data?.email as string) || "",
                });
            },
        }
    );

    const error = queryError ? (queryError as Error).message || "Failed to fetch user profile" : null;

    // Handle inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Update logic using fetchClient
    const updateUserProfile = async () => {
        if (!isAuthenticated || !userProfile) return;

        try {
            setSaving(true);

            const { error: updateError } = await fetchClient.PUT("/users/{user_id}", {
                params: {
                    path: { user_id: userProfile.id as string },
                },
                body: {
                    name: formData.name,
                    surname: formData.surname,
                    email: formData.email,
                }
            });

            if (updateError) throw updateError;

            showSuccess("Profile updated successfully!");

            // Update AuthContext explicitly (if needed by context, otherwise query invalidation handles state)
            updateUser({
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
            });

            // Refetch
            queryClient.invalidateQueries({ queryKey: ["get", "/users/me"] });

            setIsEditing(false);
        } catch (err: unknown) {
            console.error("Error updating profile:", err);
            showError(err instanceof Error ? err.message : (err as { detail?: { msg?: string }[] })?.detail?.[0]?.msg || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const changePassword = async () => {
        if (!isAuthenticated || !userProfile) return;

        if (passwordData.new_password !== passwordData.confirm_password) {
            showWarning("New passwords do not match");
            return;
        }

        if (passwordData.new_password.length < 8) {
            showWarning("New password must be at least 8 characters long");
            return;
        }

        try {
            setSaving(true);

            const { error: updateError } = await fetchClient.POST("/users/{user_id}/change-password", {
                params: {
                    path: { user_id: userProfile.id as string },
                },
                body: {
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password,
                }
            });

            if (updateError) throw updateError;

            showSuccess("Password changed successfully!");

            // Clear password fields
            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });

        } catch (err: unknown) {
            console.error("Error changing password:", err);
            showError(err instanceof Error ? err.message : (err as { detail?: { msg?: string }[] })?.detail?.[0]?.msg || "Failed to change password");
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEditing = () => {
        setIsEditing(false);
        if (userProfile) {
            setFormData({
                name: userProfile.name || "",
                surname: userProfile.surname || "",
                email: userProfile.email || "",
            });
        }
    };

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <ProfileSkeleton />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack spacing={4}>
                <ProfileHeader
                    title="Profile Settings"
                    description="Manage your personal information and account settings"
                />

                <ErrorMessage error={error} />

                <PersonalInformation
                    userProfile={userProfile as UserProfile}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    formData={formData}
                    onInputChange={handleInputChange}
                    onSave={updateUserProfile}
                    onCancel={handleCancelEditing}
                    saving={saving}
                />

                <ChangePasswordSection
                    passwordData={passwordData}
                    onPasswordChange={handlePasswordChange}
                    onChangePassword={changePassword}
                    saving={saving}
                />

                <DeviceCredentialsSection />
            </Stack>

            <MuiSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={hideSnackbar}
            />
        </Container>
    );
}