import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./AdminDashboard.module.css";

const stats = [
  { label: "Total Users", value: "—", icon: "👤" },
  { label: "Active Sessions", value: "—", icon: "🟢" },
  { label: "Tracks Uploaded", value: "—", icon: "🎵" },
  { label: "Reports Pending", value: "—", icon: "⚠️" },
];

const quickActions = [
  { label: "Manage Artists", description: "Add, edit, or remove artists from the catalogue.", icon: "🎤", to: "/admin/artists" },
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
          <div className={styles.headerBadge}>Admin</div>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back,{" "}
            <span className={styles.adminName}>{user?.name ?? "Administrator"}</span>. You have
            full administrative access.
          </p>
        </div>
      </header>

      <div className={styles.container}>
        {/* Stats overview */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Overview</h2>
          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <span className={styles.statIcon}>{stat.icon}</span>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

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
                  <span className={styles.actionIcon}>{action.icon}</span>
                  <div className={styles.actionBody}>
                    <span className={styles.actionLabel}>{action.label}</span>
                    <span className={styles.actionDesc}>{action.description}</span>
                  </div>
                  <span className={styles.actionArrow}>›</span>
                </Link>
              ) : (
                <button key={action.label} className={styles.actionCard} type="button">
                  <span className={styles.actionIcon}>{action.icon}</span>
                  <div className={styles.actionBody}>
                    <span className={styles.actionLabel}>{action.label}</span>
                    <span className={styles.actionDesc}>{action.description}</span>
                  </div>
                  <span className={styles.actionArrow}>›</span>
                </button>
              )
            )}
          </div>
        </section>

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
      </div>
    </main>
  );
}