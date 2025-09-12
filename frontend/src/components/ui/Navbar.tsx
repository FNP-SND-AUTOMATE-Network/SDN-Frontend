"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons";

interface NavbarProps {
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ className = "" }) => {
  const { user, isAuthenticated, logout, getUserInitials, getUserDisplayName } =
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

  if (!isAuthenticated) {
    // Show login/register buttons for non-authenticated users
    return (
      <nav
        className={`bg-white shadow-sm border-b border-primary-100 ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/images/SDN-image1.png"
                alt="SDN Logo"
                width={120}
                height={40}
                className="h-12 w-auto cursor-pointer"
                priority
              />
            </Link>
            </div>
            <div className="flex items-center space-x-4">
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
      className={`bg-white shadow-sm border-b border-primary-100 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/images/SDN-image1.png"
                alt="SDN Logo"
                width={120}
                height={40}
                className="h-12 w-auto cursor-pointer"
                priority
              />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
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
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <FontAwesomeIcon icon={faChevronDown} />
                </svg>
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
