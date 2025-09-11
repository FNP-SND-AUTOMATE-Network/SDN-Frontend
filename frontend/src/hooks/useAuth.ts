"use client";

import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Clear invalid data
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = (userData: User, accessToken: string) => {
    console.log("useAuth.login called with:", {
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
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log("User logged in successfully:", userData);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
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

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    getUserInitials,
    getUserDisplayName,
  };
};
