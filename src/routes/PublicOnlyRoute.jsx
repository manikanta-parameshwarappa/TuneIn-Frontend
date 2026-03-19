import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * PublicOnlyRoute — wraps routes that should only be accessible to
 * unauthenticated users (e.g. /login, /signup).
 *
 * - While the auth context is initialising (checking the HttpOnly cookie),
 *   show a spinner to avoid flashing the login form to an already-logged-in user.
 * - If the user IS authenticated, redirect them to the home page.
 * - Otherwise render the public page normally via <Outlet />.
 */
export function PublicOnlyRoute() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}