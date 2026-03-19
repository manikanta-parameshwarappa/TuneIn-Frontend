import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Home.module.css";

const FEATURES = [
  {
    icon: "🎵",
    title: "Millions of Tracks",
    text: "Stream any song, album, or playlist from an ever-growing library of music across every genre.",
  },
  {
    icon: "🎧",
    title: "High-Quality Audio",
    text: "Experience studio-quality sound with lossless audio streaming up to 320 kbps.",
  },
  {
    icon: "📻",
    title: "Curated Stations",
    text: "Discover new music with personalised radio stations powered by your listening habits.",
  },
  {
    icon: "📱",
    title: "Listen Anywhere",
    text: "Seamlessly switch between your phone, tablet, and desktop without missing a beat.",
  },
  {
    icon: "🔀",
    title: "Smart Playlists",
    text: "Auto-generated playlists that evolve with your taste — always fresh, always relevant.",
  },
  {
    icon: "🌐",
    title: "Offline Mode",
    text: "Download your favourite tracks and listen without an internet connection, wherever you are.",
  },
];

export function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <main>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <span>♪</span> Now Streaming
          </div>

          {isAuthenticated ? (
            <>
              <h1 className={styles.heroTitle}>
                Welcome back,{" "}
                <span className={styles.accent}>{user?.name?.split(" ")[0] || "Listener"}</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Your music is waiting. Pick up where you left off and let the rhythm take over.
              </p>
              <div className={styles.welcomeBanner} style={{ marginTop: 0 }}>
                <h2>🎶 Your Personal Stage</h2>
                <p>
                  Explore your library, discover new artists, and share the music you love with the world.
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className={styles.heroTitle}>
                Music for{" "}
                <span className={styles.accent}>every moment</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Discover, stream, and share an ever-expanding mix of music from emerging and
                major artists around the world.
              </p>
              <div className={styles.ctaGroup}>
                <Link to="/signup" className={styles.ctaPrimary}>
                  <span>🎵</span> Start Listening Free
                </Link>
                <Link to="/login" className={styles.ctaSecondary}>
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section className={styles.features}>
        <div className={styles.featuresInner}>
          <p className={styles.sectionLabel}>Why TuneIn</p>
          <h2 className={styles.sectionTitle}>Everything you need to enjoy music</h2>
          <p className={styles.sectionSub}>
            Beautifully crafted for music lovers who demand the best experience.
          </p>
          <div className={styles.cardsGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.card}>
                <div className={styles.cardIcon}>{f.icon}</div>
                <h3 className={styles.cardTitle}>{f.title}</h3>
                <p className={styles.cardText}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}