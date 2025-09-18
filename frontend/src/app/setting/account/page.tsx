"use client";

import { useState, useEffect, Fragment, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    userService,
    UserProfile,
    UserRole,
    UserListResponse,
    APIError,
} from "@/services/userService";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { useSnackbar } from "@/hooks/useSnackbar";
import { UserModal } from "@/components/modals/UserModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import {
    AccountHeader,
    AccountErrorMessage,
    UserTable,
    AccountPagination,
    AccountSkeleton,
} from "@/components/account";

export function AccountContent() {
    const { token } = useAuth();
    const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
    });
    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: "add" as "add" | "edit",
        user: undefined as UserProfile | undefined,
    });
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        userId: "",
        userName: "",
        isLoading: false,
    });

    // Open confirm modal for delete
    const openDeleteConfirm = (userId: string, userName: string) => {
        setConfirmModal({
            isOpen: true,
            userId,
            userName,
            isLoading: false,
        });
    };

    // Close confirm modal
    const closeConfirmModal = () => {
        setConfirmModal({
            isOpen: false,
            userId: "",
            userName: "",
            isLoading: false,
        });
    };

    // Delete user (called from confirm modal)
    const deleteUser = async () => {
        if (!token) {
            setError("No authentication token found");
            return;
        }

        setConfirmModal(prev => ({ ...prev, isLoading: true }));

        try {
            await userService.deleteUser(token, confirmModal.userId);
            // Refresh the user list
            await fetchUsersData(pagination.page, pagination.pageSize);
            showSuccess(`User "${confirmModal.userName}" deleted successfully!`, "Success");
            closeConfirmModal();
        } catch (err) {
            console.error("Error deleting user:", err);
            if (err instanceof APIError) {
                showError(err.message, "Delete Failed");
                setError(err.message);
            } else {
                showError("Failed to delete user", "Delete Failed");
                setError("Failed to delete user");
            }
        } finally {
            setConfirmModal(prev => ({ ...prev, isLoading: false }));
        }
    };

    // Load users on component mount
    const fetchUsersData = useCallback(
        async (page = 1, pageSize = 10) => {
            if (!token) {
                setError("No authentication token found");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response: UserListResponse = await userService.getAllUsers(
                    token,
                    page,
                    pageSize
                );
                setUsers(response.users);
                setPagination({
                    page: response.page,
                    pageSize: response.page_size,
                    total: response.total,
                    totalPages: response.total_pages,
                });
            } catch (err) {
                console.error("Error fetching users:", err);
                // Don't call showError here to prevent infinite loop
                if (err instanceof APIError) {
                    setError(err.message);
                } else {
                    setError("Failed to fetch users");
                }
            } finally {
                setLoading(false);
            }
        },
        [token]
    );

    useEffect(() => {
        // Only fetch if we have a token
        if (token) {
            fetchUsersData();
        }
    }, [token, fetchUsersData]);

    // Modal handlers
    const openAddModal = () => {
        setModalState({
            isOpen: true,
            mode: "add",
            user: undefined,
        });
    };

    const openEditModal = (user: UserProfile) => {
        setModalState({
            isOpen: true,
            mode: "edit",
            user: user,
        });
    };

    const closeModal = () => {
        setModalState({
            isOpen: false,
            mode: "add",
            user: undefined,
        });
    };

    const handleModalSuccess = () => {
        // Refresh the user list after successful add/edit
        fetchUsersData(pagination.page, pagination.pageSize);
    };

    const handlePageChange = (page: number) => {
        fetchUsersData(page, pagination.pageSize);
    };


    if (loading) {
        return <AccountSkeleton />;
    }

  return (
        <Fragment>
            <div className="space-y-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                <AccountHeader onAddUser={openAddModal} />
                
                <AccountErrorMessage error={error} />
                
                <UserTable 
                    users={users}
                    onEditUser={openEditModal}
                    onDeleteUser={openDeleteConfirm}
                />
                
                <AccountPagination 
                    pagination={pagination}
                    onPageChange={handlePageChange}
                />
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

            {/* User Modal */}
            {token && (
                <UserModal
                    isOpen={modalState.isOpen}
                    onClose={closeModal}
                    mode={modalState.mode}
                    user={modalState.user}
                    onSuccess={handleModalSuccess}
                    token={token}
                />
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={deleteUser}
                title="Delete User"
                message={`Are you sure you want to delete user "${confirmModal.userName}"? This action cannot be undone and will permanently remove the user from the system.`}
                confirmText="Delete User"
                cancelText="Cancel"
                type="danger"
                isLoading={confirmModal.isLoading}
            />
        </Fragment>
    );
}
