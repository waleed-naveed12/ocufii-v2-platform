import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated (check sessionStorage for token)
    const checkAuth = async () => {
      try {
        const token = sessionStorage.getItem("ocufii_admin_auth_token");
        const userData = sessionStorage.getItem("ocufii_admin_user_session");

        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, token) => {
    sessionStorage.setItem("ocufii_admin_auth_token", token);
    sessionStorage.setItem(
      "ocufii_admin_user_session",
      JSON.stringify(userData),
    );

    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem("ocufii_admin_auth_token");
    sessionStorage.removeItem("ocufii_admin_user_session");
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    setUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
