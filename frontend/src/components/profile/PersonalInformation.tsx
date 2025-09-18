"use client";

import { useState } from "react";
import { UserProfile } from "@/services/userService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPen } from "@fortawesome/free-solid-svg-icons";

interface PersonalInformationProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  formData: {
    name: string;
    surname: string;
    email: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export default function PersonalInformation({
  userProfile,
  isEditing,
  setIsEditing,
  formData,
  onInputChange,
  onSave,
  onCancel,
  saving,
}: PersonalInformationProps) {
  return (
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
            onClick={onSave}
            disabled={saving}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
