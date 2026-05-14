import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Navbar.module.css";

function UserAvatar({ name }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";
  return <div className={styles.avatar}>{initials}</div>;
}

function LogoutModal({ isOpen, onConfirm, onCancel, loading }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.logoutOverlay}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onCancel(); }}
      role="presentation"
    >
      <div
        className={styles.logoutModal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        aria-describedby="logout-desc"
      >
        {/* Icon */}
        <div className={styles.logoutIconWrap} aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        <h2 id="logout-title" className={styles.logoutTitle}>Sign out?</h2>
        <p id="logout-desc" className={styles.logoutDesc}>
          You'll need to sign in again to access your account.
        </p>

        <div className={styles.logoutActions}>
          <button
            type="button"
            className={styles.logoutCancelBtn}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.logoutConfirmBtn}
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const { isAuthenticated, isAdmin, initializing, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const dropdownRef = useRef(null);

  const openLogoutModal = useCallback(() => {
    setDropdownOpen(false);
    setMenuOpen(false);
    setLogoutModalOpen(true);
  }, []);

  const handleLogoutCancel = useCallback(() => {
    setLogoutModalOpen(false);
  }, []);

  const handleLogoutConfirm = useCallback(async () => {
    setLogoutLoading(true);
    try {
      await logout();
      navigate("/login");
    } finally {
      setLogoutLoading(false);
      setLogoutModalOpen(false);
    }
  }, [logout, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleOutsideClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [dropdownOpen]);

  return (
    <>
    <nav className={styles.navbar}>
      <div className={styles.navInner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>TuneIn</span>
        </Link>

        {/* Hamburger for mobile */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span className={menuOpen ? styles.barOpen : styles.bar} />
          <span className={menuOpen ? styles.barOpen : styles.bar} />
          <span className={menuOpen ? styles.barOpen : styles.bar} />
        </button>

        {/* Nav links */}
        <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ""}`}>
          {/* Hide auth-dependent UI while the session is being restored to prevent flash */}
          {!initializing && (
            isAuthenticated ? (
              <>
                {/* Admin Dashboard link — only visible to admins */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={styles.adminBtn}
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}

                {/* Avatar with dropdown */}
                <div className={styles.avatarWrapper} ref={dropdownRef}>
                  <button
                    className={styles.avatarBtn}
                    onClick={() => setDropdownOpen((o) => !o)}
                    aria-label="Open user menu"
                    aria-expanded={dropdownOpen}
                    aria-haspopup="menu"
                  >
                    <UserAvatar name={user?.name} />
                  </button>

                  <div
                    className={`${styles.dropdown} ${dropdownOpen ? styles.dropdownOpen : ""}`}
                    role="menu"
                  >
                    {/* 1. Display name — non-clickable plain text */}
                    <span className={styles.dropdownName} role="menuitem" aria-disabled="true">
                      {user?.name || "User"}
                    </span>

                    <div className={styles.dropdownDivider} />

                    {/* 2. Profile link */}
                    <Link
                      to="/profile"
                      className={styles.dropdownItem}
                      role="menuitem"
                      onClick={() => {
                        setDropdownOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      Profile
                    </Link>

                    {/* 3. Logout */}
                    <button
                      className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                      role="menuitem"
                      onClick={openLogoutModal}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className={styles.signupBtn} onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>

    <LogoutModal
      isOpen={logoutModalOpen}
      onConfirm={handleLogoutConfirm}
      onCancel={handleLogoutCancel}
      loading={logoutLoading}
    />
    </>
  );
}