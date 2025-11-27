/**
 * Authentication Context
 * 
 * Provides authentication state and functions throughout the app.
 * Handles login, logout, and session persistence.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as api from '../lib/api';

// Create the auth context
const AuthContext = createContext(null);

/**
 * AuthProvider component wraps the app and provides auth state
 */
export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Only run on client side
      if (typeof window === 'undefined') return;

      // Check if we have a token stored
      if (api.isAuthenticated()) {
        try {
          // Validate token and get user info
          const data = await api.getCurrentUser();
          setCustomer(data.customer);
        } catch (error) {
          // Token is invalid, clear it
          console.error('Session expired:', error.message);
          api.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Logs in a customer with email and phone
   * 
   * @param {string} email - Customer email
   * @param {string} phone - Customer phone number
   */
  const login = async (email, phone) => {
    const data = await api.login(email, phone);
    setCustomer(data.customer);
    return data;
  };

  /**
   * Logs out the current customer
   */
  const logout = () => {
    api.logout();
    setCustomer(null);
    router.push('/login');
  };

  // Context value with auth state and functions
  const value = {
    customer,
    loading,
    login,
    logout,
    isAuthenticated: !!customer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * @returns Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

