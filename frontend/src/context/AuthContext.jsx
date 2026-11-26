import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { apiRequest } from "../services/api";

const SESSION_KEY = "people-pay-session";
const AuthContext = createContext(null);

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const login = useCallback(async (credentials) => {
    const response = await apiRequest("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    const nextSession = { token: response.token, user: response.user };
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    return nextSession;
  }, []);

  const logout = useCallback(async () => {
    if (session?.token) {
      try {
        await apiRequest("/logout", { method: "DELETE", token: session.token });
      } catch {
        // Clear the local session even if the API is unavailable.
      }
    }
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, [session?.token]);

  const value = useMemo(() => ({
    token: session?.token || null,
    user: session?.user || null,
    login,
    logout,
  }), [session, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
