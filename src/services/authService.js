import axiosInstance, { axiosPublic } from "./axiosInstance";

/**
 * Auth API service — uses axiosPublic (no interceptors) to avoid circular
 * dependency with the interceptor setup that calls these methods.
 *
 * Actual API response shapes (backend uses snake_case):
 *
 * POST login      → { access_token: string, user: { id, name, email } }
 * POST signup     → { access_token: string, user: { id, name, email } }
 * DELETE logout   → 200 OK (clears HttpOnly cookie server-side)
 * POST refresh    → { access_token: string, user?: { id, name, email } }
 *
 * normalizeAuth() converts snake_case → camelCase so the rest of the app
 * always works with { accessToken, user }.
 */
function normalizeAuth(data) {
  return {
    accessToken: data.access_token ?? data.accessToken ?? null,
    user: data.user ?? null,
  };
}

export const authService = {
  async login(email, password) {
    const response = await axiosPublic.post("/login", { email, password });
    return normalizeAuth(response.data);
  },

  async signup(name, email, password) {
    const response = await axiosPublic.post("/signup", { name, email, password });
    return normalizeAuth(response.data);
  },

  async logout() {
    // Must use axiosInstance (authenticated) so the request interceptor
    // attaches the Authorization: Bearer <token> header — the backend's
    // authorize_request middleware requires it to identify the session.
    const response = await axiosInstance.delete("/logout");
    return response.data;
  },

  async refresh() {
    const response = await axiosPublic.post("/refresh");
    return normalizeAuth(response.data);
  },
};