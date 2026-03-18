import { useState, useEffect } from "react";
import api, { setAccessToken } from "../api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(name, email, password) {
    const { data } = await api.post("/signup", { name, email, password });
    setAccessToken(data.access_token);
    const profile = await api.get("/profile");
    setUser(profile.data);
  }

  async function login(email, password) {
    const { data } = await api.post("/login", { email, password });
    setAccessToken(data.access_token);
    const profile = await api.get("/profile");
    setUser(profile.data);
  }

  async function logout() {
    await api.delete("/logout");
    setAccessToken(null);
    setUser(null);
  }

  // 👇 Silent refresh on app load
  async function bootstrapAuth() {
    try {
      const { data } = await api.post("/refresh", {}, { withCredentials: true });
      setAccessToken(data.access_token);
      const profile = await api.get("/profile");
      setUser(profile.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bootstrapAuth();
  }, []);

  return { user, signup, login, logout, loading };
}