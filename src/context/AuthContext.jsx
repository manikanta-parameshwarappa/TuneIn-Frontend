import React, { createContext, useState, useCallback, useRef, useEffect } from "react";
import { authService } from "../services/authService";
import { setupAxiosInterceptors } from "../services/axiosInstance";
import { userService } from "../services/userService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  // true while we're checking if a session exists on first load
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  // Stable refs so interceptor callbacks always see latest values
  const accessTokenRef = useRef(accessToken);
  accessTokenRef.current = accessToken;

  /**
   * Attempt a silent token refresh using the HttpOnly cookie.
   * Returns the new access token string, or throws on failure.
   */
  const refreshAccessToken = useCallback(async () => {
    const data = await authService.refresh();
    const token = data.accessToken;
    if (!token) {
      // Refresh succeeded HTTP-wise but returned no token — treat as failure
      throw new Error("No access token in refresh response");
    }
    setAccessToken(token);
    if (data.user) setUser(data.user);
    return token;
  }, []);

  /**
   * Called by the interceptor when a refresh attempt fails.
   * Force a full logout of in-memory state.
   */
  const handleRefreshFail = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  // Wire up Axios interceptors once on mount
  useEffect(() => {
    const eject = setupAxiosInterceptors(
      () => accessTokenRef.current,
      refreshAccessToken,
      handleRefreshFail
    );
    return eject; // clean up on unmount
  }, [refreshAccessToken, handleRefreshFail]);

  // On first load: try a silent refresh to restore session from HttpOnly cookie,
  // then fetch the full profile so avatarUrl is available immediately.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshAccessToken();
        // Hydrate avatarUrl (and dob) that the auth token doesn't carry
        try {
          const profile = await userService.getProfile();
          if (!cancelled && profile) {
            setUser((prev) => prev ? { ...prev, avatarUrl: profile.avatarUrl } : prev);
          }
        } catch (_) {
          // Non-fatal — avatar just won't show until Profile page is visited
        }
      } catch (_) {
        // No valid session — that's fine, user is simply not logged in
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      // Update the ref immediately so axiosInstance interceptor can attach the
      // Bearer token on the very next request (getProfile below) without waiting
      // for a React re-render cycle.
      accessTokenRef.current = data.accessToken;
      setAccessToken(data.accessToken);
      setUser(data.user);
      // Hydrate avatarUrl from the full profile — the auth response doesn't
      // include avatar_url, so without this the navbar shows initials only
      // even when the user already has a photo uploaded.
      try {
        const profile = await userService.getProfile();
        if (profile) {
          setUser((prev) => prev ? { ...prev, avatarUrl: profile.avatarUrl } : prev);
        }
      } catch (_) {
        // Non-fatal — initials will show instead of avatar photo
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const data = await authService.signup(name, email, password);
      // Update the ref immediately so axiosInstance interceptor can attach the
      // Bearer token on the very next request (getProfile below) without waiting
      // for a React re-render cycle.
      accessTokenRef.current = data.accessToken;
      setAccessToken(data.accessToken);
      setUser(data.user);
      // Hydrate avatarUrl from the full profile — the auth response doesn't
      // include avatar_url, so without this the navbar shows initials only
      // even when the user already has a photo uploaded.
      try {
        const profile = await userService.getProfile();
        if (profile) {
          setUser((prev) => prev ? { ...prev, avatarUrl: profile.avatarUrl } : prev);
        }
      } catch (_) {
        // Non-fatal — initials will show instead of avatar photo
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || "Signup failed",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (_) {
      // Ignore server errors on logout — clear local state regardless
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const isAdmin = !!accessToken && user?.role === "admin";

  const value = {
    user,
    setUser,
    accessToken,
    initializing,
    loading,
    isAuthenticated: !!accessToken,
    isAdmin,
    login,
    signup,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}