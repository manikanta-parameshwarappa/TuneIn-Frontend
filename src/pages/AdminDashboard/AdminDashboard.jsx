import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./AdminDashboard.module.css";

// Overview stats removed temporarily; will be added back later.

const quickActions = [
  { label: "Manage Artists", description: "Add, edit, or remove artists from the catalogue.", icon: "🎤", to: "/admin/artists" },
  { label: "Manage Albums", description: "Create, edit, or remove albums.", icon: "💿", to: "/admin/albums" },
  { label: "Manage Songs", description: "Bulk upload audio, edit metadata, and delete tracks.", icon: "🎵", to: "/admin/songs" },
  { label: "Manage Users", description: "View, suspend, or remove user accounts.", icon: "👥", to: null },
  { label: "Content Moderation", description: "Review flagged tracks and playlists.", icon: "🛡️", to: null },
  { label: "System Logs", description: "Inspect application and access logs.", icon: "📋", to: null },
  { label: "Analytics", description: "Audience insights and streaming metrics.", icon: "📊", to: null },
];

export function AdminDashboard() {
  const { user } = useAuth();

  return (
    <main className={styles.page}>
      {/* Header banner */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <div className={styles.headerBadge}>Admin</div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Admin Dashboard</h1>
            </div>
            <p className={styles.subtitle}>
              Welcome back,{" "}
              <span className={styles.adminName}>{user?.name ?? "Administrator"}</span>. You have
              full administrative access.
            </p>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        {/* Main Content Area */}
        <div className={styles.mainContent}>
          {/* Quick actions */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div className={styles.actionsGrid}>
              {quickActions.map((action) =>
                action.to ? (
                  <Link
                    key={action.label}
                    to={action.to}
                    className={styles.actionCard}
                  >
                    <div className={styles.actionHeader}>
                      <span className={styles.actionIcon}>{action.icon}</span>
                      <span className={styles.actionArrow}>→</span>
                    </div>
                    <div className={styles.actionBody}>
                      <span className={styles.actionLabel}>{action.label}</span>
                      <span className={styles.actionDesc}>{action.description}</span>
                    </div>
                  </Link>
                ) : (
                  <button key={action.label} className={styles.actionCard} type="button">
                    <div className={styles.actionHeader}>
                      <span className={styles.actionIcon}>{action.icon}</span>
                      <span className={styles.actionArrow}>→</span>
                    </div>
                    <div className={styles.actionBody}>
                      <span className={styles.actionLabel}>{action.label}</span>
                      <span className={styles.actionDesc}>{action.description}</span>
                    </div>
                  </button>
                )
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Area */}
        <aside className={styles.sidebar}>
          {/* Current session info */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Current Session</h2>
            <div className={styles.sessionCard}>
              <div className={styles.sessionRow}>
                <span className={styles.sessionKey}>Logged in as</span>
                <span className={styles.sessionVal}>{user?.email ?? "—"}</span>
              </div>
              <div className={styles.sessionRow}>
                <span className={styles.sessionKey}>Role</span>
                <span className={`${styles.sessionVal} ${styles.roleTag}`}>admin</span>
              </div>
              <div className={styles.sessionRow}>
                <span className={styles.sessionKey}>User ID</span>
                <span className={styles.sessionVal}>{user?.id ?? "—"}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}