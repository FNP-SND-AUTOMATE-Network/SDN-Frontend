"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 font-sf-pro-text"
      >
        {label}
        {required && <span className="text-danger-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-sf-pro-text ${
            error
              ? "border-danger-500 focus:ring-danger-500 focus:border-danger-500"
              : "border-gray-300 hover:border-gray-400"
          }`}
        />
        
        {/* Password visibility toggle button */}
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          tabIndex={-1}
        >
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="h-4 w-4"
          />
        </button>
      </div>
      
      {error && (
        <p className="text-sm text-danger-600 font-sf-pro-text">{error}</p>
      )}
    </div>
  );
};
