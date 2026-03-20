import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * AdminRoute — wraps routes that require the "admin" role.
 *
 * Behaviour:
 *  - While the auth context is initialising → show spinner (prevents flash).
 *  - If not authenticated → redirect to /login with `from` state preserved.
 *  - If authenticated but NOT admin → redirect to /403 (access denied).
 *  - Otherwise → render <Outlet />.
 */
export function AdminRoute() {
  const { isAuthenticated, isAdmin, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}