// client/src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getStoredAuth() {
  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  let user = null;
  try {
    if (userJson) user = JSON.parse(userJson);
  } catch {
    user = null;
  }
  return { token, user };
}

export function AuthProvider({ children }) {
  const [{ token, user }, setAuth] = useState(() => getStoredAuth());
  const [loading, setLoading] = useState(false);

  // Keep localStorage in sync
  const setAuthState = (newToken, newUser) => {
    if (newToken && newUser) {
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      setAuth({ token: newToken, user: newUser });
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuth({ token: null, user: null });
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to login");
      }

      const { token: t, user: u } = data;
      setAuthState(t, u);
      return { user: u };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to register");
      }

      const { token: t, user: u } = data;
      setAuthState(t, u);
      return { user: u };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthState(null, null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    setUser: (updater) => {
      // allow updating user from profile page
      setAuth((prev) => {
        const currentUser =
          typeof updater === "function" ? updater(prev.user) : updater;
        if (currentUser) {
          localStorage.setItem("user", JSON.stringify(currentUser));
          return { ...prev, user: currentUser };
        } else {
          localStorage.removeItem("user");
          return { ...prev, user: null };
        }
      });
    },
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
