import { axiosPublic } from "./axiosInstance";

/**
 * Auth API service — uses axiosPublic (no interceptors) to avoid circular
 * dependency with the interceptor setup that calls these methods.
 *
 * Assumed API response shapes:
 *
 * POST login      → { accessToken: string, user: { id, name, email } }
 * POST signup     → { accessToken: string, user: { id, name, email } }
 * DELETE logout     → 200 OK (clears HttpOnly cookie server-side)
 * POST refresh    → { accessToken: string, user?: { id, name, email } }
 *                         (also sets new HttpOnly refresh-token cookie)
 */
export const authService = {
  async login(email, password) {
    const response = await axiosPublic.post("/login", { email, password });
    return response.data;
  },

  async signup(name, email, password) {
    const response = await axiosPublic.post("/signup", { name, email, password });
    return response.data;
  },

  async logout() {
    const response = await axiosPublic.delete("/logout");
    return response.data;
  },

  async refresh() {
    const response = await axiosPublic.post("/refresh");
    return response.data;
  },
};