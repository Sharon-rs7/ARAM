import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedRole = localStorage.getItem("role");
    const storedUser = localStorage.getItem("user");

    if (token && storedRole && storedUser) {
      setAccessToken(token);
      setRole(storedRole);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Fallback
        setUser({ role: storedRole });
      }
    }
    setLoading(false);
  }, []);

  const saveAuth = (authData) => {
    const { accessToken: token, refreshToken, user: authUser, role: authRole } = authData;

    if (token) localStorage.setItem("accessToken", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (authUser) localStorage.setItem("user", JSON.stringify(authUser));
    if (authRole) localStorage.setItem("role", authRole);

    setAccessToken(token);
    setRole(authRole);
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
      {!loading && children}
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
