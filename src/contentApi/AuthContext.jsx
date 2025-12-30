import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    console.error("useAuth must be used within an AuthProvider");
    return {
      user: null,
      token: null,
      isAuthenticated: () => false,
      login: () => { },
      logout: () => {
        // Fallback logout
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/authentication/login';
      },
      role: null,
      hasRole: () => false,
    };
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) {
      sessionStorage.setItem("sessionActive", "true");
      return JSON.parse(localUser);
    }
    return null;
  });
  console.log("Final user Data : ", user);

  const [token, setToken] = useState(() => localStorage.getItem("access_token") || null);

  // Helper function to check user roles
  const hasRole = (requiredRole) => {
    if (!user?.roles) return false;
    return user.roles.includes(requiredRole);
  };

  // Simple authentication check - just check if we have token and user
  const isAuthenticated = () => {
    return !!(token && user && sessionStorage.getItem("sessionActive"));
  };

  // Check for browser session
  useEffect(() => {
    if (!sessionStorage.getItem("sessionActive")) {
      // Browser was closed and reopened
      setUser(null);
      setToken(null);
      localStorage.clear();
      return;
    }
  }, []);

  const login = (userData, authToken) => {
    // Create enriched user data with dynamic field names based on role
    const enrichedUserData = {
      ...userData,
      role: userData.role,
      [`${userData.role}Id`]: userData.id,
      [`${userData.role}Name`]: userData.name
    };

    console.log("Setting Auth State:", {
      userData: enrichedUserData,
      authToken,
      timestamp: new Date().toISOString(),
    });

    setUser(enrichedUserData);
    setToken(authToken);
    localStorage.setItem("user", JSON.stringify(enrichedUserData));
    localStorage.setItem("token", authToken);
    sessionStorage.setItem("sessionActive", "true");

    // Set token as HTTP cookie for backend authentication
    document.cookie = `token=${authToken}; path=/; secure; samesite=strict`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    const rememberedPassword = localStorage.getItem("rememberedPassword");
    localStorage.clear();
    sessionStorage.clear();

    // Clear the token cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    if (rememberedUsername) {
      localStorage.setItem("rememberedUsername", rememberedUsername);
    }
    if (rememberedPassword) {
      localStorage.setItem("rememberedPassword", rememberedPassword);
    }
  };

  // Get the role-specific ID and name fields
  const roleSpecificId = user ? user[`${user.role}Id`] : null;
  const roleSpecificName = user ? user[`${user.role}Name`] : null;

  const contextValue = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    role: user?.role,
    hasRole,
  };

  // Add role-specific properties only if user and role exist
  if (user?.role) {
    contextValue[`${user.role}Id`] = roleSpecificId;
    contextValue[`${user.role}Name`] = roleSpecificName;
  }



  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};