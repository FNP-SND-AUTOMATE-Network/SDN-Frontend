"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faGear,
  faRightFromBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

interface NavbarProps {
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ className = "" }) => {
  const { user, isAuthenticated, logout, getUserDisplayName, isLoading } =
    useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-primary-100 ${className}`}
      >
        <div className="max-w-12xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-start items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <div className="items-center">
                  <span className="text-2xl font-bold text-primary-600 font-sf-pro-display">
                    CMNS-SDN
                  </span>
                  <br />
                  <span className="text-sm text-secondary-400 font-sf-pro-text">
                    Control and Management Network System
                  </span>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4 ml-auto">
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (!isAuthenticated) {
    // Show login/register buttons for non-authenticated users
    return (
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-primary-100 ${className}`}
      >
        <div className="max-w-12xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-start items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <div className="items-center">
                  <span className="text-2xl font-bold text-primary-600 font-sf-pro-display">
                    CMNS-SDN
                  </span>
                  <br />
                  <span className="text-sm text-secondary-400 font-sf-pro-text">
                    Control and Management Network System
                  </span>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4 ml-auto">
              <Link href="/login">
                <Button variant="outline" className="px-4 py-2 text-sm">
                  เข้าสู่ระบบ
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" className="px-4 py-2 text-sm">
                  สมัครสมาชิก
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Show user info and logout for authenticated users
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-primary-100 ${className}`}
    >
      <div className="max-w-12xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <div className="items-center">
                <span className="text-2xl font-bold text-primary-600 font-sf-pro-display">
                  CMNS-SDN
                </span>
                <br />
                <span className="text-sm text-secondary-400 font-sf-pro-text">
                  Control and Management Network System
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            {/* User Avatar and Name */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* User Avatar */}
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
                  <FontAwesomeIcon icon={faUser} />
                </div>

                {/* User Name */}
                <span className="text-gray-700 font-medium font-sf-pro-text">
                  {getUserDisplayName() || "Loading..."}
                </span>

                {/* Dropdown arrow */}
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 font-sf-pro-text">
                      {user?.name} {user?.surname}
                    </p>
                    <p className="text-xs text-gray-500 font-sf-pro-text">
                      {user?.email}
                    </p>
                    <p className="text-xs text-primary-600 font-sf-pro-text">
                      {user?.role}
                    </p>
                  </div>

                  {/* Settings - Only for ADMIN and OWNER */}

                  <div className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <Link href="/setting">
                      <Button
                        variant="outline"
                        className="w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors items-center space-x-2"
                      >
                        <FontAwesomeIcon icon={faGear} className="w-4 h-4" />
                        <span>Settings</span>
                      </Button>
                    </Link>
                  </div>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                  >
                    <FontAwesomeIcon
                      icon={faRightFromBracket}
                      className="w-4 h-4"
                    />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
