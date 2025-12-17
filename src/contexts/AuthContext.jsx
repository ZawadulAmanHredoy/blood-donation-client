// client/src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { loginApi } from "../api/authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore from localStorage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  // Apply auth after login/register
  const applyAuth = (data) => {
    if (!data?.token || !data?.user) {
      throw new Error("Invalid auth response from server.");
    }

    setToken(data.token);
    setUser(data.user);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  // Login using email/password (Login page)
  const loginWithCredentials = async (email, password) => {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }
    const data = await loginApi({ email, password });
    applyAuth(data);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    applyAuth,
    loginWithCredentials,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
