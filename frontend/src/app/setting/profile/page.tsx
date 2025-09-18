"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService, UserProfile, APIError } from "@/services/userService";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { useSnackbar } from "@/hooks/useSnackbar";
import {
    ProfileHeader,
    ErrorMessage,
    PersonalInformation,
    ChangePasswordSection,
    ProfileSkeleton,
} from "@/components/profile";

export default function ProfilePage() {
    const { token, updateUser } = useAuth();
    const { snackbar, showSuccess, showError, showWarning, hideSnackbar } =
        useSnackbar();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form data state
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        email: "",
    });

    // Password change state
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    // Fetch user profile data
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!token) {
                setError("No authentication token found");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const profile = await userService.getMyProfile(token);
                setUserProfile(profile);
                setFormData({
                    name: profile.name || "",
                    surname: profile.surname || "",
                    email: profile.email || "",
                });
            } catch (err) {
                console.error("Error fetching user profile:", err);
                if (err instanceof APIError) {
                    setError(err.message);
                } else {
                    setError("Failed to fetch user profile");
                }
                showError("Failed to fetch user profile");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [token]); // ลบ showError ออกจาก dependency array

    // Handle input changes for personal information
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle password input changes
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Update user profile
    const updateUserProfile = async () => {
        if (!token || !userProfile) {
            setError("No authentication token or user profile found");
            return;
        }

        try {
            setSaving(true);
            setError(null);

            await userService.updateProfile(token, userProfile.id, {
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
            });

            showSuccess("Profile updated successfully!");

            // Update AuthContext with new data
            updateUser({
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
            });

            // Reload data after successful update
            const updatedProfile = await userService.getMyProfile(token);
            setUserProfile(updatedProfile);
        } catch (err) {
            console.error("Error updating profile:", err);
            if (err instanceof APIError) {
                setError(err.message);
                showError(err.message);
            } else {
                setError("Failed to update profile");
                showError("Failed to update profile");
            }
        } finally {
            setSaving(false);
        }
    };

    // Change password
    const changePassword = async () => {
        if (!token || !userProfile) {
            setError("No authentication token or user profile found");
            return;
        }

        if (passwordData.new_password !== passwordData.confirm_password) {
            setError("New passwords do not match");
            showWarning("New passwords do not match");
            return;
        }

        if (passwordData.new_password.length < 8) {
            setError("New password must be at least 8 characters long");
            showWarning("New password must be at least 8 characters long");
            return;
        }

        try {
            setSaving(true);
            setError(null);

            await userService.changePassword(token, userProfile.id, {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
            });

            showSuccess("Password changed successfully!");

            // Clear password fields
            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });
        } catch (err) {
            console.error("Error changing password:", err);
            if (err instanceof APIError) {
                setError(err.message);
                showError(err.message);
            } else {
                setError("Failed to change password");
                showError("Failed to change password");
            }
        } finally {
            setSaving(false);
        }
    };

    // Handle save personal information
    const handleSavePersonalInfo = async () => {
        try {
            await updateUserProfile();
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating profile:", err);
        }
    };

    // Handle cancel editing
    const handleCancelEditing = () => {
        setIsEditing(false);
        // Reset form data to original values
        if (userProfile) {
            setFormData({
                name: userProfile.name || "",
                surname: userProfile.surname || "",
                email: userProfile.email || "",
            });
        }
    };

    if (loading) {
        return <ProfileSkeleton />;
    }

    return (
        <div>
            <div className="space-y-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                <ProfileHeader
                    title="Profile Settings"
                    description="Manage your personal information and account settings"
                />

                <ErrorMessage error={error} />

                <PersonalInformation
                    userProfile={userProfile}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    formData={formData}
                    onInputChange={handleInputChange}
                    onSave={handleSavePersonalInfo}
                    onCancel={handleCancelEditing}
                    saving={saving}
                />

                <ChangePasswordSection
                    passwordData={passwordData}
                    onPasswordChange={handlePasswordChange}
                    onChangePassword={changePassword}
                    saving={saving}
                />
            </div>

            {/* MuiSnackbar for notifications */}
            <MuiSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={hideSnackbar}
            />
        </div>
    );
}