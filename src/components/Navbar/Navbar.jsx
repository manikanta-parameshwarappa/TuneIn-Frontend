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

export function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = useCallback(async () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    await logout();
    navigate("/login");
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
          {isAuthenticated ? (
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
                    onClick={handleLogout}
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
          )}
        </div>
      </div>
    </nav>
  );
}