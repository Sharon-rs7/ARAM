import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeRole = (rawRole) => {
    if (!rawRole) return null;
    let r = String(rawRole).toUpperCase().replace(/^ROLE_/, "");
    if (r === "HELPER") r = "VOLUNTEER";
    return r;
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedRole = localStorage.getItem("role");
    const storedUser = localStorage.getItem("user");

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

      const effectiveRole = normalizeRole(parsedUser?.role || storedRole);
      setRole(effectiveRole);
      setUser(parsedUser || (effectiveRole ? { role: effectiveRole } : null));
    }
    setLoading(false);
  }, []);

  const saveAuth = (authData) => {
    if (!authData) return;
    const token = authData.accessToken || authData.token;
    const rawRole = authData.role || authData.user?.role;
    const cleanRole = normalizeRole(rawRole);

    let authUser = authData.user || (cleanRole ? { role: cleanRole } : null);
    if (authUser && cleanRole) {
      authUser = { ...authUser, role: cleanRole };
    }

    if (token) localStorage.setItem("accessToken", token);
    if (authData.refreshToken) localStorage.setItem("refreshToken", authData.refreshToken);
    if (authUser) localStorage.setItem("user", JSON.stringify(authUser));
    if (cleanRole) localStorage.setItem("role", cleanRole);

    setAccessToken(token);
    setRole(cleanRole);
    setUser(authUser);
  };

  const clearAuth = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    setAccessToken(null);
    setRole(null);
    setUser(null);
  };

  const login = (authData) => {
    saveAuth(authData);
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
