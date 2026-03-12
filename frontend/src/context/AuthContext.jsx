import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Expose this so internal profile updates don't need a hard page reload
  const updateUserSession = (newUserData) => {
    setUser((prevUser) => ({ ...prevUser, ...newUserData }));
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentUserResponse = await authService.getCurrentUser();
        
        if (currentUserResponse) {
          const userData = currentUserResponse.data?.data || currentUserResponse.data || currentUserResponse;
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const loggedInUser = response.data?.data?.user || response.data?.user;
    setUser(loggedInUser);
    setIsAuthenticated(true);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, updateUserSession }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
