import React, { createContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../api/axios";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);

  useEffect(() => {
    setAuthToken(token);
    if (!token) { setUser(null); return; }
    api.get("/auth/me").then(r => setUser(r.data.user)).catch(() => {
      setToken(""); localStorage.removeItem("token"); setUser(null);
    });
  }, [token]);

  const value = useMemo(() => ({
    user, token,
    async login(email, password) {
      const r = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", r.data.token);
      setToken(r.data.token);
      setUser(r.data.user);
    },
    async register(payload) {
      const r = await api.post("/auth/register", payload);
      localStorage.setItem("token", r.data.token);
      setToken(r.data.token);
      setUser(r.data.user);
    },
    logout() {
      localStorage.removeItem("token");
      setToken("");
      setUser(null);
    }
  }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}