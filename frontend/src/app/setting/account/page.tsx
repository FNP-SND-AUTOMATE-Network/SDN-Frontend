"use client";

import { useState, useEffect, Fragment, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService, UserProfile, UserRole, UserListResponse, APIError } from "@/services/userService";
import { MuiSnackbar } from "@/components/ui/MuiSnackbar";
import { useSnackbar } from "@/hooks/useSnackbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

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
        totalPages: 0
    });

    // Delete user
    const deleteUser = async (userId: string, userName: string) => {
        if (!token) {
            setError("No authentication token found");
            return;
        }

        if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await userService.deleteUser(token, userId);
            // Refresh the user list
            await fetchUsersData(pagination.page, pagination.pageSize);
            showSuccess(`User "${userName}" deleted successfully!`, "Success");
        } catch (err) {
            console.error('Error deleting user:', err);
            if (err instanceof APIError) {
                showError(err.message, "Delete Failed");
                setError(err.message);
            } else {
                showError('Failed to delete user', "Delete Failed");
                setError('Failed to delete user');
            }
        }
    };

    // Load users on component mount
    const fetchUsersData = useCallback(async (page = 1, pageSize = 10) => {
        if (!token) {
            setError("No authentication token found");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const response: UserListResponse = await userService.getAllUsers(token, page, pageSize);
            setUsers(response.users);
            setPagination({
                page: response.page,
                pageSize: response.page_size,
                total: response.total,
                totalPages: response.total_pages
            });
        } catch (err) {
            console.error('Error fetching users:', err);
            // Don't call showError here to prevent infinite loop
            if (err instanceof APIError) {
                setError(err.message);
            } else {
                setError('Failed to fetch users');
            }
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        // Only fetch if we have a token
        if (token) {
            fetchUsersData();
        }
    }, [token, fetchUsersData]);

    const getRoleBadge = (role: UserRole) => {
        const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
        switch (role) {
            case "ADMIN":
                return `${baseClasses} bg-purple-100 text-purple-800`;
            case "OWNER":
                return `${baseClasses} bg-red-100 text-red-800`;
            case "ENGINEER":
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case "VIEWER":
                return `${baseClasses} bg-gray-100 text-gray-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const getMfaBadge = (hasStrongMfa: boolean) => {
        const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
        return hasStrongMfa 
            ? `${baseClasses} bg-green-100 text-green-800`
            : `${baseClasses} bg-yellow-100 text-yellow-800`;
    };

    const getEmailVerifiedBadge = (emailVerified: boolean) => {
        const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
        return emailVerified 
            ? `${baseClasses} bg-green-100 text-green-800`
            : `${baseClasses} bg-red-100 text-red-800`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

  return (
        <Fragment>
            <div className="space-y-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900 font-sf-pro-display">User Management</h2>
                <button 
                    onClick={() => alert('Create user functionality coming soon!')}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                    Add New User
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                                {error}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email Verified
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    MFA Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-primary-600">
                                                        {(user.name?.[0] || '') + (user.surname?.[0] || '')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.name && user.surname ? `${user.name} ${user.surname}` : 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={getRoleBadge(user.role)}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={getEmailVerifiedBadge(user.email_verified)}>
                                            {user.email_verified ? "Verified" : "Not Verified"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={getMfaBadge(user.has_strong_mfa)}>
                                            {user.has_strong_mfa ? "Enabled" : "Disabled"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(user.created_at).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => alert('Edit user functionality coming soon!')}
                                                className="text-primary-600 hover:text-primary-900"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button 
                                                onClick={() => deleteUser(user.id, user.name || user.email)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button 
                        onClick={() => fetchUsersData(pagination.page - 1, pagination.pageSize)}
                        disabled={pagination.page <= 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button 
                        onClick={() => fetchUsersData(pagination.page + 1, pagination.pageSize)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span> to{' '}
                            <span className="font-medium">
                                {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                            </span> of{' '}
                            <span className="font-medium">{pagination.total}</span> results
        </p>
      </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button 
                                onClick={() => fetchUsersData(pagination.page - 1, pagination.pageSize)}
                                disabled={pagination.page <= 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button 
                                onClick={() => fetchUsersData(pagination.page + 1, pagination.pageSize)}
                                disabled={pagination.page >= pagination.totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </nav>
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
        </Fragment>
  );
}