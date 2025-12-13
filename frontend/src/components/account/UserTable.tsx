"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faCircleXmark, faCross, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { UserProfile, UserRole } from "@/services/userService";

interface UserTableProps {
  users: UserProfile[];
  onEditUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string, userName: string) => void;
}

export default function UserTable({
  users,
  onEditUser,
  onDeleteUser,
}: UserTableProps) {
  const getRoleBadge = (role: UserRole) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
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
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    return hasStrongMfa
      ? `${baseClasses} bg-green-100 text-green-800`
      : `${baseClasses} bg-yellow-100 text-yellow-800`;
  };

  const getEmailVerifiedBadge = (emailVerified: boolean) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    return emailVerified
      ? `${baseClasses} bg-green-100 text-green-800`
      : `${baseClasses} bg-red-100 text-red-800`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
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
                          {(user.name?.[0] || "") + (user.surname?.[0] || "")}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name && user.surname
                          ? `${user.name} ${user.surname}`
                          : "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getRoleBadge(user.role)}>{user.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getEmailVerifiedBadge(user.email_verified)}>
                    {user.email_verified ? "Verified" : "Not Verified"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getMfaBadge(user.has_strong_mfa)}>
                    {user.has_strong_mfa ? (
                      <FontAwesomeIcon icon={faCheckCircle} />
                    ) : (
                      <FontAwesomeIcon icon={faCircleXmark} />
                    )}
                    {user.has_strong_mfa ? " Enabled" : " Disabled"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditUser(user)}
                      className="text-primary-600 hover:text-primary-900"
                      title="Edit user"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() =>
                        onDeleteUser(user.id, user.name || user.email)
                      }
                      className="text-red-600 hover:text-red-900"
                      title="Delete user"
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
  );
}
