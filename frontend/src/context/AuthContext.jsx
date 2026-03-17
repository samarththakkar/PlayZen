import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,            setUser]            = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [authError,       setAuthError]       = useState(null);

  // Prevent duplicate simultaneous auth checks
  const checkingRef = useRef(false);

  /* ─────────────────────────────────────────────
     RESTORE SESSION ON MOUNT
  ───────────────────────────────────────────── */
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        const response = await authService.getCurrentUser();

        if (response) {
          // Normalise across different response shapes
          const userData =
            response.data?.data ||
            response.data       ||
            response;

          if (userData && (userData._id || userData.id)) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        // 401 is expected when not logged in — not an error worth surfacing
        if (error?.response?.status !== 401) {
          console.error('[AuthContext] Session restore failed:', error?.message || error);
          setAuthError('Session restore failed. Please sign in again.');
        }
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        checkingRef.current = false;
      }
    };

    checkAuthStatus();
  }, []);

  /* ─────────────────────────────────────────────
     LOGIN
  ───────────────────────────────────────────── */
  const login = useCallback(async (credentials) => {
    setAuthError(null);
    try {
      const response = await authService.login(credentials);

      // Normalise across different response shapes
      const loggedInUser =
        response.data?.data?.user ||
        response.data?.user       ||
        response.data?.data       ||
        response.data;

      if (!loggedInUser) {
        throw new Error('Invalid login response — no user data returned.');
      }

      setUser(loggedInUser);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message                 ||
        'Login failed. Please try again.';
      setAuthError(message);
      throw error; // Re-throw so login pages can show field errors
    }
  }, []);

  /* ─────────────────────────────────────────────
     LOGOUT
  ───────────────────────────────────────────── */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Even if the server call fails, clear local state
      console.warn('[AuthContext] Logout API call failed:', error?.message);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
    }
  }, []);

  /* ─────────────────────────────────────────────
     UPDATE SESSION (profile edits, avatar change)
  ───────────────────────────────────────────── */
  const updateUserSession = useCallback((newUserData) => {
    setUser((prev) => {
      if (!prev) return newUserData;
      return { ...prev, ...newUserData };
    });
  }, []);

  /* ─────────────────────────────────────────────
     CLEAR AUTH ERROR (call from login/signup forms)
  ───────────────────────────────────────────── */
  const clearAuthError = useCallback(() => setAuthError(null), []);

  /* ─────────────────────────────────────────────
     CONTEXT VALUE
  ───────────────────────────────────────────── */
  const value = {
    user,
    isAuthenticated,
    loading,
    authError,
    login,
    logout,
    updateUserSession,
    clearAuthError,
  };

  // Don't render the app until auth is resolved
  // This prevents flashing protected routes before the session check completes
  if (loading) return null;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};