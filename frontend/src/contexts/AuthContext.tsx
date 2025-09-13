"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User, accessToken: string) => void;
  logout: () => void;
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

  // Helper function to check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Consider invalid token as expired
    }
  };

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          // Check if token is expired
          if (isTokenExpired(storedToken)) {
            console.log('Token expired, clearing user data');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            localStorage.removeItem('registration_email');
            setUser(null);
            setToken(null);
          } else {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          }
        } else {
          // No token or user data found
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Clear invalid data
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('registration_email');
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
  const login = (userData: User, accessToken: string) => {
    console.log("AuthContext.login called with:", {
      userData,
      accessToken: accessToken ? "present" : "missing"
    });
    
    // Validate user data
    if (!userData.id || !userData.email || !userData.name || !userData.surname) {
      console.error("Invalid user data provided to login:", userData);
      return;
    }
    
    if (!accessToken) {
      console.error("No access token provided to login");
      return;
    }
    
    setUser(userData);
    setToken(accessToken);
    setIsLoading(false); // Set loading to false immediately
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log("User logged in successfully:", userData);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsLoading(false); // Set loading to false immediately
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('registration_email'); // Clear any leftover registration data
    
    // Redirect to home page
    window.location.href = '/';
  };

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

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
