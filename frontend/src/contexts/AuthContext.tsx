"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
  has_strong_mfa?: boolean;
  totp_enabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null; // Kept for backward compatibility, will be null
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User, accessToken?: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  getUserDisplayName: () => string;
  getUserInitials: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from API on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authApi.me();
        console.log('[Auth] /auth/me response:', JSON.stringify(userData));
        setUser(userData as User);
      } catch (error: any) {
        // 401 = ไม่ได้ Login เป็นเรื่องปกติ ไม่ต้องตะโกน Error
        if (error?.status === 401 || error?.status === 0) {
          console.log('[Auth] Not authenticated — skipping.');
        } else {
          console.error('[Auth] Unexpected error loading user:', error);
        }
        setUser(null);
      } finally {
        // Add small delay to prevent flicker
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = (userData: User, accessToken?: string) => {
    // Validate user data
    if (!userData.id || !userData.email || !userData.name || !userData.surname) {
      console.error("Invalid user data provided to login:", userData);
      return;
    }
    
    setUser(userData);
    setIsLoading(false);
  };

  // Update user data function
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
  };

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Failed to logout from API API', err);
    }
    
    setUser(null);
    setToken(null);
    setIsLoading(false); // Set loading to false immediately
    localStorage.removeItem('registration_email'); // Clear any leftover registration data
    
    // Redirect to home page
    window.location.href = '/';
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name || !user.surname) return '';
    const firstNameInitial = user.name.charAt(0).toUpperCase();
    const surnameInitial = user.surname.charAt(0).toUpperCase();
    return `${firstNameInitial}.${surnameInitial}`;
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user || !user.name || !user.surname) return '';
    const firstNameInitial = user.name.charAt(0).toUpperCase();
    const surnameInitial = user.surname.charAt(0).toLowerCase();
    return `${user.name}.${surnameInitial}`;
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    getUserDisplayName,
    getUserInitials,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
