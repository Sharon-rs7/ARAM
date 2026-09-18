import { createContext, useContext, useState, useEffect } from "react";
import { normalizeRole } from "@/utils/roleLabels";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const storedRole = localStorage.getItem("role") || sessionStorage.getItem("role");
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

    if (token) {
      setAccessToken(token);
      
      let parsedUser = null;
      if (storedUser) {
        try {
          parsedUser = JSON.parse(storedUser);
        } catch (e) {
          parsedUser = null;
        }
      }

      const rawRole = parsedUser?.backendRole || parsedUser?.role || storedRole;
      const cleanRole = normalizeRole(rawRole);

      if (parsedUser) {
        parsedUser.role = cleanRole;
        parsedUser.backendRole = rawRole;
      }

      setRole(cleanRole);
      setUser(parsedUser || (cleanRole ? { role: cleanRole, backendRole: rawRole } : null));
    }
    setLoading(false);
  }, []);

  const saveAuth = (authData, rememberMe = true) => {
    if (!authData) return;
    const token = authData.accessToken || authData.token;
    const rawRole = authData.role || authData.user?.role;
    const cleanRole = normalizeRole(rawRole);

    let authUser = authData.user || (cleanRole ? { role: cleanRole } : null);
    if (authUser && cleanRole) {
      authUser = { ...authUser, role: cleanRole, backendRole: rawRole };
    }

    const storage = rememberMe ? localStorage : sessionStorage;
    const oldStorage = rememberMe ? sessionStorage : localStorage;

    // Clear opposite storage
    oldStorage.removeItem("accessToken");
    oldStorage.removeItem("refreshToken");
    oldStorage.removeItem("user");
    oldStorage.removeItem("role");

    if (token) storage.setItem("accessToken", token);
    if (authData.refreshToken) storage.setItem("refreshToken", authData.refreshToken);
    if (authUser) storage.setItem("user", JSON.stringify(authUser));
    if (cleanRole) storage.setItem("role", cleanRole);

    setAccessToken(token);
    setRole(cleanRole);
    setUser(authUser);
  };

  const clearAuth = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");

    setAccessToken(null);
    setRole(null);
    setUser(null);
  };

  const login = (authData, rememberMe = true) => {
    saveAuth(authData, rememberMe);
  };

  const logout = () => {
    clearAuth();
  };

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        accessToken,
        token: accessToken,
        isAuthenticated,
        login,
        logout,
        saveAuth,
        clearAuth,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
