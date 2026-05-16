
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { usePlayer } from "../../context/PlayerContext";
import { useLike } from "../../context/LikeContext";
import { PlaylistSidebar } from "../../components/PlaylistSidebar/PlaylistSidebar";
import { AddToPlaylistModal } from "../../components/AddToPlaylistModal/AddToPlaylistModal";
import { fetchSongs } from "../../services/songService";
import { fetchAlbums } from "../../services/albumService";
import { fetchArtists } from "../../services/artistService";
import styles from "./Home.module.css";

function formatDuration(seconds) {
  if (!seconds) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// ── Icons ────────────────────────────────────────────────────────────────────

function IconPlay() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function IconHeart({ filled }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconMusic() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconDisc() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconMic() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconTrendingUp() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconAddToQueue() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function IconPlaylistAdd() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 17H3" />
      <path d="M15 7H3" />
      <path d="M7 12H3" />
      <circle cx="18" cy="16" r="4" />
      <path d="M18 14v4" />
      <path d="M16 16h4" />
    </svg>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function AlbumCardSkeleton() {
  return (
    <div className={styles.albumCardSkeleton}>
      <div className={styles.skeletonCover} />
      <div
        className={styles.skeletonLine}
        style={{ width: "75%", height: "13px", marginTop: "0.6rem" }}
      />
      <div
        className={styles.skeletonLine}
        style={{ width: "50%", height: "11px", marginTop: "0.4rem" }}
      />
    </div>
  );
}

function ArtistCardSkeleton() {
  return (
    <div className={styles.artistCardSkeleton}>
      <div className={styles.skeletonCircle} />
      <div
        className={styles.skeletonLine}
        style={{ width: "60%", height: "12px", marginTop: "0.6rem" }}
      />
      <div
        className={styles.skeletonLine}
        style={{ width: "40%", height: "10px", marginTop: "0.3rem" }}
      />
    </div>
  );
}

function SongRowSkeleton() {
  return (
    <div className={styles.songRowSkeleton}>
      <div
        className={styles.skeletonLine}
        style={{ width: "24px", height: "24px", borderRadius: "4px" }}
      />
      <div
        className={styles.skeletonLine}
        style={{ width: "36px", height: "36px", borderRadius: "6px", flexShrink: 0 }}
      />
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.3rem" }}
      >
        <div className={styles.skeletonLine} style={{ width: "55%", height: "12px" }} />
        <div className={styles.skeletonLine} style={{ width: "35%", height: "10px" }} />
      </div>
      <div className={styles.skeletonLine} style={{ width: "40px", height: "10px" }} />
    </div>
  );
}

// ── AlbumCard ─────────────────────────────────────────────────────────────────

function AlbumCard({ album, songs }) {
  const [hovered, setHovered] = useState(false);
  const { playQueue, currentSong, isPlaying, togglePlay } = usePlayer();
  const year = album.releasedDate
    ? new Date(album.releasedDate).getFullYear()
    : null;
  const albumSongs = songs.filter(
    (s) => s.albumId === album.id || s.album?.id === album.id
  );
  const isCurrentAlbum = albumSongs.some((s) => s.id === currentSong?.id);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isCurrentAlbum) {
      togglePlay();
    } else if (albumSongs.length > 0) {
      playQueue(albumSongs, 0);
    }
  };

  return (
    <div
      className={styles.albumCard}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.albumCoverWrapper}>
        {album.avatarUrl ? (
          <img
            src={album.avatarUrl}
            alt={album.name}
            className={styles.albumCover}
          />
        ) : (
          <div className={styles.albumCoverFallback}>
            <IconDisc />
          </div>
        )}
        <div
          className={`${styles.albumPlayOverlay} ${
            hovered ? styles.albumPlayOverlayVisible : ""
          }`}
        >
          <button
            className={`${styles.albumPlayBtn} ${
              isCurrentAlbum && isPlaying ? styles.albumPlayBtnActive : ""
            }`}
            aria-label={`Play ${album.name}`}
            onClick={handlePlay}
          >
            {isCurrentAlbum && isPlaying ? <IconPause /> : <IconPlay />}
          </button>
        </div>
      </div>
      <div className={styles.albumCardBody}>
        <p className={styles.albumCardName} title={album.name}>
          {album.name}
        </p>
        <p className={styles.albumCardMeta}>
          {album.musicDirectorName && (
            <span>{album.musicDirectorName}</span>
          )}
          {album.musicDirectorName && year && (
            <span className={styles.dot}>·</span>
          )}
          {year && <span>{year}</span>}
        </p>
      </div>
    </div>
  );
}

// ── ArtistCard ────────────────────────────────────────────────────────────────

function ArtistCard({ artist, songs }) {
  const [hovered, setHovered] = useState(false);
  const { playQueue, currentSong, isPlaying, togglePlay } = usePlayer();
  const initials = artist.name
    ? artist.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  const artistSongs = songs.filter((s) =>
    s.artists?.some((a) => a.id === artist.id)
  );
  const isCurrentArtist = artistSongs.some((s) => s.id === currentSong?.id);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isCurrentArtist) {
      togglePlay();
    } else if (artistSongs.length > 0) {
      playQueue(artistSongs, 0);
    }
  };

  return (
    <div
      className={styles.artistCard}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.artistAvatarWrapper}>
        {artist.avatarUrl ? (
          <img
            src={artist.avatarUrl}
            alt={artist.name}
            className={styles.artistAvatar}
          />
        ) : (
          <div className={styles.artistAvatarFallback}>
            <span className={styles.artistInitials}>{initials}</span>
          </div>
        )}
        <div
          className={`${styles.artistPlayOverlay} ${
            hovered ? styles.artistPlayOverlayVisible : ""
          }`}
        >
          <button
            className={styles.artistPlayBtn}
            aria-label={`Play ${artist.name}`}
            onClick={handlePlay}
          >
            {isCurrentArtist && isPlaying ? <IconPause /> : <IconPlay />}
          </button>
        </div>
      </div>
      <p className={styles.artistName} title={artist.name}>
        {artist.name}
      </p>
      <p className={styles.artistLabel}>Artist</p>
    </div>
  );
}

// ── SongRow ───────────────────────────────────────────────────────────────────

function SongRow({ song, index, allSongs, onLikeToggle, onAddToPlaylist }) {
  const [hovered, setHovered] = useState(false);
  const { playSong, currentSong, isPlaying, togglePlay, addToQueue } =
    usePlayer();
  const { isLiked } = useLike();
  const artistNames =
    song.artists?.map((a) => a.name).join(", ") || "Unknown Artist";
  const isCurrent = currentSong?.id === song.id;
  const isThisPlaying = isCurrent && isPlaying;
  const liked = isLiked(song.id);

  const handlePlay = () => {
    isCurrent ? togglePlay() : playSong(song, allSongs);
  };

  const handleAddToQueue = (e) => {
    e.stopPropagation();
    addToQueue(song);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    onLikeToggle(song.id);
  };

  const handleAddToPlaylist = (e) => {
    e.stopPropagation();
    onAddToPlaylist(song);
  };

  return (
    <div
      className={`${styles.songRow} ${isCurrent ? styles.songRowPlaying : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handlePlay}
    >
      {/* Index / play button */}
      <div className={styles.songRowIndex}>
        {hovered || isCurrent ? (
          <button
            className={styles.songRowPlayBtn}
            aria-label={isThisPlaying ? "Pause" : "Play"}
          >
            {isThisPlaying ? <IconPause /> : <IconPlay />}
          </button>
        ) : (
          <span
            className={`${styles.songRowNum} ${
              isCurrent ? styles.songRowNumPlaying : ""
            }`}
          >
            {index + 1}
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <div className={styles.songRowThumb}>
        {song.album?.coverUrl ? (
          <img
            src={song.album.coverUrl}
            alt={song.album.name}
            className={styles.songThumbImg}
          />
        ) : (
          <div className={styles.songThumbFallback}>
            <IconMusic />
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.songRowInfo}>
        <span
          className={`${styles.songRowName} ${
            isCurrent ? styles.songRowNamePlaying : ""
          }`}
        >
          {song.name}
        </span>
        <span className={styles.songRowArtist}>{artistNames}</span>
      </div>

      {/* Album */}
      <span className={styles.songRowAlbum}>{song.album?.name || "—"}</span>

      {/* Actions */}
      <div className={styles.songRowActions}>
        <button
          className={`${styles.songRowQueueBtn} ${
            hovered ? styles.songRowQueueBtnVisible : ""
          }`}
          aria-label="Add to queue"
          title="Add to queue"
          onClick={handleAddToQueue}
        >
          <IconAddToQueue />
        </button>
        <button
          className={`${styles.songRowQueueBtn} ${
            hovered ? styles.songRowQueueBtnVisible : ""
          }`}
          aria-label="Add to playlist"
          title="Add to playlist"
          onClick={handleAddToPlaylist}
        >
          <IconPlaylistAdd />
        </button>
        <button
          className={`${styles.songRowLike} ${
            liked ? styles.songRowLikeActive : ""
          }`}
          aria-label={liked ? "Unlike song" : "Like song"}
          title={liked ? "Unlike" : "Like"}
          onClick={handleLike}
        >
          <IconHeart filled={liked} />
        </button>
      </div>

      {/* Duration */}
      <span className={styles.songRowDuration}>
        {formatDuration(song.duration)}
      </span>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ icon, title, count, showAll, onShowAll }) {
  return (
    <div className={styles.sectionHeader}>
      <div className={styles.sectionHeaderLeft}>
        <span className={styles.sectionIcon}>{icon}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {count != null && (
          <span className={styles.sectionCount}>{count}</span>
        )}
      </div>
      {showAll && (
        <button className={styles.seeAllBtn} onClick={onShowAll}>
          See all <IconChevronRight />
        </button>
      )}
    </div>
  );
}

function QuickStatCard({ label, value, color }) {
  return (
    <div className={styles.quickStat}>
      <span className={styles.quickStatValue} style={{ color }}>
        {value}
      </span>
      <span className={styles.quickStatLabel}>{label}</span>
    </div>
  );
}

// ── FeaturedCard ──────────────────────────────────────────────────────────────

function FeaturedCard({ item, type, songs }) {
  const { playSong, playQueue, currentSong, isPlaying, togglePlay } =
    usePlayer();
  if (!item) return null;
  const coverUrl = item.avatarUrl || item.album?.coverUrl || null;
  const subtitle =
    type === "album"
      ? item.musicDirectorName || "Album"
      : type === "artist"
      ? "Artist"
      : item.artists?.map((a) => a.name).join(", ") || "Track";

  const handlePlay = () => {
    if (type === "track") {
      currentSong?.id === item.id ? togglePlay() : playSong(item, songs);
    } else if (type === "album") {
      const s = songs.filter(
        (s) => s.albumId === item.id || s.album?.id === item.id
      );
      if (s.length) playQueue(s, 0);
    } else if (type === "artist") {
      const s = songs.filter((s) =>
        s.artists?.some((a) => a.id === item.id)
      );
      if (s.length) playQueue(s, 0);
    }
  };

  const isCurrent = type === "track" && currentSong?.id === item.id;
  const isThisPlaying = isCurrent && isPlaying;

  return (
    <div className={styles.featuredCard} onClick={handlePlay}>
      <div className={styles.featuredCover}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={item.name}
            className={styles.featuredCoverImg}
          />
        ) : (
          <div className={styles.featuredCoverFallback}>
            {type === "album" ? (
              <IconDisc />
            ) : type === "artist" ? (
              <IconMic />
            ) : (
              <IconMusic />
            )}
          </div>
        )}
      </div>
      <div className={styles.featuredInfo}>
        <span className={styles.featuredType}>{type.toUpperCase()}</span>
        <h3 className={styles.featuredName}>{item.name}</h3>
        <p className={styles.featuredSubtitle}>{subtitle}</p>
        <button className={styles.featuredPlayBtn}>
          {isThisPlaying ? <IconPause /> : <IconPlay />}{" "}
          {isThisPlaying ? "Pause" : "Play Now"}
        </button>
      </div>
    </div>
  );
}

// ── Main Home component ───────────────────────────────────────────────────────

export function Home() {
  const { isAuthenticated, user } = useAuth();
  const { currentSong } = usePlayer();
  const { toggleLike } = useLike();
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllSongs, setShowAllSongs] = useState(false);
  const [showAllAlbums, setShowAllAlbums] = useState(false);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      try {
        const [songsRes, albumsRes, artistsRes] = await Promise.allSettled([
          fetchSongs(),
          fetchAlbums(),
          fetchArtists(),
        ]);
        setSongs(songsRes.status === "fulfilled" ? songsRes.value : []);
        setAlbums(albumsRes.status === "fulfilled" ? albumsRes.value : []);
        setArtists(artistsRes.status === "fulfilled" ? artistsRes.value : []);
      } catch {
        /* noop */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAuthenticated]);

  // Like toggle via global LikeContext (persists across all views)
  const handleLikeToggle = useCallback(async (songId) => {
    await toggleLike(songId);
  }, [toggleLike]);

  const displayedSongs = showAllSongs ? songs : songs.slice(0, 10);
  const displayedAlbums = showAllAlbums ? albums : albums.slice(0, 8);
  const featuredAlbum = albums[0] || null;
  const featuredArtist = artists[0] || null;

  // ── Public view ───────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <main className={styles.publicMain}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <span>♪</span> Now Streaming
            </div>
            <h1 className={styles.heroTitle}>
              Music for{" "}
              <span className={styles.accent}>every moment</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Discover, stream, and share an ever-expanding mix of music from
              emerging and major artists around the world.
            </p>
            <div className={styles.ctaGroup}>
              <Link to="/signup" className={styles.ctaPrimary}>
                <span>🎵</span> Start Listening Free
              </Link>
              <Link to="/login" className={styles.ctaSecondary}>
                Sign In
              </Link>
            </div>
          </div>
          <div className={styles.heroDecor} aria-hidden="true">
            <div className={`${styles.floatCard} ${styles.floatCard1}`}>
              <div
                className={styles.floatCardCover}
                style={{
                  background: "linear-gradient(135deg,#1E3A8A,#3B82F6)",
                }}
              />
              <div className={styles.floatCardInfo}>
                <span>Featured Mix</span>
                <span>Trending Now</span>
              </div>
            </div>
            <div className={`${styles.floatCard} ${styles.floatCard2}`}>
              <div
                className={styles.floatCardCover}
                style={{
                  background: "linear-gradient(135deg,#6d28d9,#8b5cf6)",
                }}
              />
              <div className={styles.floatCardInfo}>
                <span>Late Night Vibes</span>
                <span>Chill &amp; Relax</span>
              </div>
            </div>
            <div className={`${styles.floatCard} ${styles.floatCard3}`}>
              <div
                className={styles.floatCardCover}
                style={{
                  background: "linear-gradient(135deg,#065f46,#34d399)",
                }}
              />
              <div className={styles.floatCardInfo}>
                <span>Top Charts</span>
                <span>This Week</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <div className={styles.featuresInner}>
            <p className={styles.sectionLabel}>Why TuneIn</p>
            <h2 className={styles.featuresSectionTitle}>
              Everything you need to enjoy music
            </h2>
            <div className={styles.featuresGrid}>
              {[
                {
                  icon: "🎵",
                  title: "Millions of Tracks",
                  text: "Stream any song from an ever-growing library across every genre.",
                },
                {
                  icon: "🎧",
                  title: "High-Quality Audio",
                  text: "Experience studio-quality sound with lossless streaming up to 320 kbps.",
                },
                {
                  icon: "📻",
                  title: "Curated Stations",
                  text: "Discover new music with personalised stations powered by your taste.",
                },
                {
                  icon: "🔀",
                  title: "Smart Playlists",
                  text: "Auto-generated playlists that evolve with your listening habits.",
                },
                {
                  icon: "📱",
                  title: "Listen Anywhere",
                  text: "Seamlessly switch between phone, tablet, and desktop without missing a beat.",
                },
                {
                  icon: "🌐",
                  title: "Offline Mode",
                  text: "Download favourites and listen without an internet connection.",
                },
              ].map((f) => (
                <div key={f.title} className={styles.featureCard}>
                  <div className={styles.featureCardIcon}>{f.icon}</div>
                  <h3 className={styles.featureCardTitle}>{f.title}</h3>
                  <p className={styles.featureCardText}>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ── Authenticated view ────────────────────────────────────────────────────
  return (
    <>
      <div
        className={styles.appLayout}
        style={currentSong ? { height: "calc(100vh - 72px - 90px)" } : {}}
      >
        {/* Sidebar */}
        <PlaylistSidebar
          onSelectPlaylist={(p) => {
            if (p?.id) navigate(`/playlist/${p.id}`);
          }}
          songs={songs}
        />

        {/* Main content — home feed */}
        <main className={styles.mainContent}>
            {/* Greeting */}
            <section className={styles.greetingSection}>
              <div className={styles.greetingInner}>
                <div className={styles.greetingText}>
                  <h1 className={styles.greetingTitle}>
                    {getTimeGreeting()},{" "}
                    <span className={styles.greetingName}>
                      {user?.name?.split(" ")[0] || "Listener"}
                    </span>{" "}
                    👋
                  </h1>
                  <p className={styles.greetingSubtitle}>
                    Here&apos;s what&apos;s trending in your world today.
                  </p>
                </div>
                {!loading && (
                  <div className={styles.quickStats}>
                    <QuickStatCard
                      label="Songs"
                      value={songs.length}
                      color="#3B82F6"
                    />
                    <QuickStatCard
                      label="Albums"
                      value={albums.length}
                      color="#8b5cf6"
                    />
                    <QuickStatCard
                      label="Artists"
                      value={artists.length}
                      color="#34d399"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Featured */}
            {!loading && (featuredAlbum || featuredArtist) && (
              <section className={styles.featuredSection}>
                <SectionHeader icon={<IconTrendingUp />} title="Featured" />
                <div className={styles.featuredRow}>
                  {featuredAlbum && (
                    <FeaturedCard item={featuredAlbum} type="album" songs={songs} />
                  )}
                  {featuredArtist && (
                    <FeaturedCard item={featuredArtist} type="artist" songs={songs} />
                  )}
                  {songs[0] && (
                    <FeaturedCard item={songs[0]} type="track" songs={songs} />
                  )}
                </div>
              </section>
            )}
            {loading && (
              <section className={styles.featuredSection}>
                <SectionHeader icon={<IconTrendingUp />} title="Featured" />
                <div className={styles.featuredRow}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={styles.featuredCardSkeleton}>
                      <div className={styles.skeletonCover} />
                      <div
                        style={{
                          flex: 1,
                          padding: "1rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        <div
                          className={styles.skeletonLine}
                          style={{ width: "40%", height: "10px" }}
                        />
                        <div
                          className={styles.skeletonLine}
                          style={{ width: "70%", height: "16px" }}
                        />
                        <div
                          className={styles.skeletonLine}
                          style={{ width: "50%", height: "12px" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Albums */}
            <section className={styles.contentSection}>
              <SectionHeader
                icon={<IconDisc />}
                title="Albums"
                count={albums.length || null}
                showAll={albums.length > 8}
                onShowAll={() => setShowAllAlbums((v) => !v)}
              />
              <div className={styles.albumsGrid}>
                {loading
                  ? [...Array(8)].map((_, i) => <AlbumCardSkeleton key={i} />)
                  : displayedAlbums.length > 0
                  ? displayedAlbums.map((album) => (
                      <AlbumCard key={album.id} album={album} songs={songs} />
                    ))
                  : (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}><IconDisc /></div>
                      <p>No albums yet</p>
                    </div>
                  )
                }
              </div>
            </section>

            {/* Artists */}
            <section className={styles.contentSection}>
              <SectionHeader
                icon={<IconMic />}
                title="Artists"
                count={artists.length || null}
              />
              <div className={styles.artistsRow}>
                {loading
                  ? [...Array(6)].map((_, i) => <ArtistCardSkeleton key={i} />)
                  : artists.length > 0
                  ? artists.map((artist) => (
                      <ArtistCard key={artist.id} artist={artist} songs={songs} />
                    ))
                  : (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}><IconMic /></div>
                      <p>No artists yet</p>
                    </div>
                  )
                }
              </div>
            </section>

            {/* Songs */}
            <section className={styles.contentSection}>
              <SectionHeader
                icon={<IconMusic />}
                title="Songs"
                count={songs.length || null}
                showAll={songs.length > 10}
                onShowAll={() => setShowAllSongs((v) => !v)}
              />

              {/* Column headers */}
              {!loading && songs.length > 0 && (
                <div className={styles.songListHeader}>
                  <span className={styles.songColNum}>#</span>
                  <span style={{ gridColumn: "2 / 4" }}>Title</span>
                  <span className={styles.songColAlbum}>Album</span>
                  <span />
                  <span className={styles.songColDuration}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                </div>
              )}

              <div className={styles.songList}>
                {loading
                  ? [...Array(6)].map((_, i) => <SongRowSkeleton key={i} />)
                  : displayedSongs.length > 0
                  ? displayedSongs.map((song, i) => (
                      <SongRow
                        key={song.id}
                        song={song}
                        index={i}
                        allSongs={songs}
                        onLikeToggle={handleLikeToggle}
                        onAddToPlaylist={setAddToPlaylistSong}
                      />
                    ))
                  : (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}><IconMusic /></div>
                      <p>No songs yet</p>
                    </div>
                  )
                }
              </div>

              {!loading && songs.length > 10 && (
                <button
                  className={styles.showMoreBtn}
                  onClick={() => setShowAllSongs((v) => !v)}
                >
                  {showAllSongs ? "Show less" : `Show all ${songs.length} songs`}
                </button>
              )}
            </section>
          </main>
      </div>

      {/* Add to Playlist modal */}
      {addToPlaylistSong && (
        <AddToPlaylistModal
          song={addToPlaylistSong}
          onClose={() => setAddToPlaylistSong(null)}
        />
      )}
    </>
  );
}
