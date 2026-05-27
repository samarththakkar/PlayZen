import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import authService from '../services/authService';
import toast from '../utils/toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,            setUser]            = useState(() => {
    const token = localStorage.getItem('playzen_accessToken');
    if (!token) return null;
    const saved = localStorage.getItem('playzen_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('playzen_accessToken');
    if (!token) return false;
    const saved = localStorage.getItem('playzen_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return !!(parsed && (parsed._id || parsed.id));
      } catch (e) {}
    }
    return false;
  });
  const [loading,         setLoading]         = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const hasUrlToken = params.get('accessToken');
    const token = localStorage.getItem('playzen_accessToken') || hasUrlToken;
    const user = localStorage.getItem('playzen_user');
    if (!token && !user) return false;
    return true;
  });

  const googleSuccessToastShownRef = useRef(false);

  // Display Google login success toast and clean URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'success' && !googleSuccessToastShownRef.current) {
      googleSuccessToastShownRef.current = true;
      toast.success('Successfully logged in with Google!');
      const cleanSearch = window.location.search
        .replace(/[?&]login=success/, '')
        .replace(/[?&]accessToken=[^&]*/, '')
        .replace(/[?&]refreshToken=[^&]*/, '')
        .replace(/^&/, '?')
        .replace(/^\?$/, '');
      const newUrl = window.location.pathname + cleanSearch;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);
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

      // Extract OAuth tokens from URL if present
      const params = new URLSearchParams(window.location.search);
      const urlAccessToken = params.get('accessToken');
      const urlRefreshToken = params.get('refreshToken');
      if (urlAccessToken) {
        localStorage.setItem('playzen_accessToken', urlAccessToken);
      }
      if (urlRefreshToken) {
        localStorage.setItem('playzen_refreshToken', urlRefreshToken);
      }

      const hasToken = localStorage.getItem('playzen_accessToken') || urlAccessToken;

      if (!hasToken) {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('playzen_user');
        localStorage.removeItem('playzen_accessToken');
        localStorage.removeItem('playzen_refreshToken');
        setLoading(false);
        checkingRef.current = false;
        return;
      }

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
            localStorage.setItem('playzen_user', JSON.stringify(userData));
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
        localStorage.removeItem('playzen_user');
        localStorage.removeItem('playzen_accessToken');
        localStorage.removeItem('playzen_refreshToken');
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

      const accessToken = response.data?.data?.accessToken || response.data?.accessToken;
      const refreshToken = response.data?.data?.refreshToken || response.data?.refreshToken;
      if (accessToken) localStorage.setItem('playzen_accessToken', accessToken);
      if (refreshToken) localStorage.setItem('playzen_refreshToken', refreshToken);

      setUser(loggedInUser);
      setIsAuthenticated(true);
      localStorage.setItem('playzen_user', JSON.stringify(loggedInUser));
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
     REGISTER
  ───────────────────────────────────────────── */
  const register = useCallback(async (userData) => {
    setAuthError(null);
    try {
      const response = await authService.register(userData);

      const registeredUser =
        response.data?.data?.user ||
        response.data?.user       ||
        response.data?.data       ||
        response.data;

      if (!registeredUser) {
        throw new Error('Invalid registration response — no user data returned.');
      }

      const accessToken = response.data?.data?.accessToken || response.data?.accessToken;
      const refreshToken = response.data?.data?.refreshToken || response.data?.refreshToken;
      if (accessToken) localStorage.setItem('playzen_accessToken', accessToken);
      if (refreshToken) localStorage.setItem('playzen_refreshToken', refreshToken);

      setUser(registeredUser);
      setIsAuthenticated(true);
      localStorage.setItem('playzen_user', JSON.stringify(registeredUser));
      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message                 ||
        'Registration failed. Please try again.';
      setAuthError(message);
      throw error;
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
      localStorage.removeItem('playzen_user');
      localStorage.removeItem('playzen_accessToken');
      localStorage.removeItem('playzen_refreshToken');
    }
  }, []);

  /* ─────────────────────────────────────────────
     UPDATE SESSION (profile edits, avatar change)
  ───────────────────────────────────────────── */
  const updateUserSession = useCallback((newUserData) => {
    setUser((prev) => {
      const updated = prev ? { ...prev, ...newUserData } : newUserData;
      if (updated) {
        localStorage.setItem('playzen_user', JSON.stringify(updated));
        if (newUserData.accessToken) {
          localStorage.setItem('playzen_accessToken', newUserData.accessToken);
        }
        if (newUserData.refreshToken) {
          localStorage.setItem('playzen_refreshToken', newUserData.refreshToken);
        }
      } else {
        localStorage.removeItem('playzen_user');
        localStorage.removeItem('playzen_accessToken');
        localStorage.removeItem('playzen_refreshToken');
      }
      return updated;
    });
  }, []);

  /* ─────────────────────────────────────────────
     CLEAR AUTH ERROR (call from login/signup forms)
  ───────────────────────────────────────────── */
  const clearAuthError = useCallback(() => setAuthError(null), []);

  // Cross-tab storage change sync listener for auth session and profile
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'playzen_user') {
        try {
          if (e.newValue) {
            const parsedUser = JSON.parse(e.newValue);
            setUser(prev => {
              if (JSON.stringify(prev) === JSON.stringify(parsedUser)) return prev;
              return parsedUser;
            });
            setIsAuthenticated(true);
          } else {
            setUser(prev => {
              if (prev === null) return prev;
              return null;
            });
            setIsAuthenticated(false);
            localStorage.removeItem('playzen_accessToken');
            localStorage.removeItem('playzen_refreshToken');
          }
        } catch (err) {
          console.error('[AuthContext] Error parsing playzen_user from storage event:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync token refresh failure (logout) in current tab
  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      setIsAuthenticated(false);
    };
    window.addEventListener('playzen-logout', handleLogoutEvent);
    return () => window.removeEventListener('playzen-logout', handleLogoutEvent);
  }, []);

  /* ─────────────────────────────────────────────
     CONTEXT VALUE
  ───────────────────────────────────────────── */
  const value = {
    user,
    isAuthenticated,
    loading,
    authError,
    login,
    register,
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