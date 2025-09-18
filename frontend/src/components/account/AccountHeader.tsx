"use client";

interface AccountHeaderProps {
  onAddUser: () => void;
}

export default function AccountHeader({ onAddUser }: AccountHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold text-gray-900 font-sf-pro-display">
        User Management
      </h2>
      <button
        onClick={onAddUser}
        className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors font-sf-pro-text"
      >
        Add New User
      </button>
    </div>
  );
}
