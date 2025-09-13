"use client";

// import { PageLayout } from "@/components/layout/PageLayout";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService, UserProfile, APIError } from "@/services/userService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faExclamationCircle,
    faUserPen,
    faEye,
    faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { useSnackbar } from "@/hooks/useSnackbar";

export default function ProfilePage() {
    const { token } = useAuth();
    const { snackbar, showSuccess, showError, showWarning, hideSnackbar } =
        useSnackbar();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

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

    // API functions
    const updateUserProfile = async () => {
        if (!token || !userProfile) {
            setError("No authentication token or user profile found");
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const updateData = {
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
            };

            const response = await userService.updateProfile(
                token,
                userProfile.id,
                updateData
            );
            setUserProfile(response.user);
            showSuccess("Profile updated successfully!", "Success");
        } catch (err) {
            console.error("Error updating user profile:", err);
            if (err instanceof APIError) {
                showError(err.message, "Update Failed");
                setError(err.message);
            } else {
                showError("Failed to update user profile", "Update Failed");
                setError("Failed to update user profile");
            }
        } finally {
            setSaving(false);
        }
    };

    const changePassword = async () => {
        if (!token || !userProfile) {
            setError("No authentication token or user profile found");
            return;
        }

        if (passwordData.new_password !== passwordData.confirm_password) {
            showWarning("New passwords do not match", "Validation Error");
            setError("New passwords do not match");
            return;
        }

        if (passwordData.new_password.length < 8) {
            showWarning(
                "New password must be at least 8 characters long",
                "Validation Error"
            );
            setError("New password must be at least 8 characters long");
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const passwordChangeData = {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
            };

            await userService.changePassword(
                token,
                userProfile.id,
                passwordChangeData
            );

            // Reset password form
            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });

            // Show success message
            showSuccess("Password changed successfully!", "Success");
        } catch (err) {
            console.error("Error changing password:", err);
            if (err instanceof APIError) {
                showError(err.message, "Password Change Failed");
                setError(err.message);
            } else {
                showError("Failed to change password", "Password Change Failed");
                setError("Failed to change password");
            }
        } finally {
            setSaving(false);
        }
    };

    // Load user profile on component mount
    const fetchUserProfile = useCallback(async () => {
        if (!token) {
            setError("No authentication token found");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const data = await userService.getMyProfile(token);
            setUserProfile(data);
            setFormData({
                name: data.name || "",
                surname: data.surname || "",
                email: data.email || "",
            });
        } catch (err) {
            console.error("Error fetching user profile:", err);
            // Don't call showError here to prevent infinite loop
            if (err instanceof APIError) {
                setError(err.message);
            } else {
                setError("Failed to fetch user profile");
            }
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        // Only fetch if we have a token
        if (token) {
            fetchUserProfile();
        }
    }, [token, fetchUserProfile]);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    if (loading) {
        return (
            <div className="mx-4 sm:mx-6 lg:mx-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="space-y-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 font-sf-pro-display">
                        Profile Settings
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage your personal information and account settings
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <FontAwesomeIcon
                                    icon={faExclamationCircle}
                                    className="h-5 w-5 text-red-400"
                                />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Personal Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Personal Information
                        </h3>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                <FontAwesomeIcon icon={faUserPen} className="h-4 w-4" />
                                <span className="text-sm font-medium">Edit</span>
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Enter your first name"
                                />
                            ) : (
                                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                                    {userProfile?.name || "N/A"}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="surname"
                                    value={formData.surname}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Enter your last name"
                                />
                            ) : (
                                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                                    {userProfile?.surname || "N/A"}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Enter your email"
                                />
                            ) : (
                                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                                    {userProfile?.email || "N/A"}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                                {userProfile?.role || "N/A"}
                            </div>
                        </div>
                    </div>
                    {isEditing && (
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={async () => {
                                    try {
                                        await updateUserProfile();
                                        setIsEditing(false);
                                        // Reload data after successful update
                                        await fetchUserProfile();
                                    } catch (err) {
                                        console.error("Error updating profile:", err);
                                    }
                                }}
                                disabled={saving}
                                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    // Reset form data to original values
                                    if (userProfile) {
                                        setFormData({
                                            name: userProfile.name || "",
                                            surname: userProfile.surname || "",
                                            email: userProfile.email || "",
                                        });
                                    }
                                }}
                                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Change Password
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? "text" : "password"}
                                    name="current_password"
                                    value={passwordData.current_password}
                                    onChange={handlePasswordChange}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("current")}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <FontAwesomeIcon
                                        icon={showPasswords.current ? faEyeSlash : faEye}
                                        className="h-4 w-4"
                                    />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? "text" : "password"}
                                    name="new_password"
                                    value={passwordData.new_password}
                                    onChange={handlePasswordChange}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("new")}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <FontAwesomeIcon
                                        icon={showPasswords.new ? faEyeSlash : faEye}
                                        className="h-4 w-4"
                                    />
                                </button>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? "text" : "password"}
                                    name="confirm_password"
                                    value={passwordData.confirm_password}
                                    onChange={handlePasswordChange}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("confirm")}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <FontAwesomeIcon
                                        icon={showPasswords.confirm ? faEyeSlash : faEye}
                                        className="h-4 w-4"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={changePassword}
                        disabled={saving}
                        className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? "Updating..." : "Update Password"}
                    </button>
                </div>

                {/* Account Status */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Account Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Verified
                            </label>
                            <div className="flex items-center">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${userProfile?.email_verified
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                >
                                    {userProfile?.email_verified ? "Verified" : "Not Verified"}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                MFA Status
                            </label>
                            <div className="flex items-center">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${userProfile?.has_strong_mfa
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}
                                >
                                    {userProfile?.has_strong_mfa ? "Enabled" : "Disabled"}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Created At
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                                {userProfile?.created_at
                                    ? new Date(userProfile.created_at).toLocaleDateString()
                                    : "N/A"}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Updated
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                                {userProfile?.updated_at
                                    ? new Date(userProfile.updated_at).toLocaleDateString()
                                    : "N/A"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MuiSnackbar for notifications */}
            <MuiSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                title={snackbar.title}
                onClose={hideSnackbar}
                autoHideDuration={6000}
            />
        </div>
    );
}
