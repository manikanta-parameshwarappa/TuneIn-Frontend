import React, { useState } from "react";
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
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navInner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>♪</span>
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
          <Link to="/" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          {isAuthenticated ? (
            <>
              {/* Profile section */}
              <div className={styles.profileSection}>
                <UserAvatar name={user?.name} />
                <span className={styles.userName}>{user?.name || "User"}</span>
              </div>
              <button
                className={styles.logoutBtn}
                onClick={() => { handleLogout(); setMenuOpen(false); }}
              >
                Logout
              </button>
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