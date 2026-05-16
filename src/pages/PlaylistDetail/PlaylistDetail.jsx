import React, { useState, useEffect, useCallback } from "react";
import styles from "./PlaylistDetail.module.css";
import { fetchPlaylist } from "../../services/playlistService";
import { removeSongFromPlaylist } from "../../services/playlistService";
import { toggleLike } from "../../services/likeService";
import { usePlayer } from "../../context/PlayerContext";

// ── SVG Icons ────────────────────────────────────────────────────────────────
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

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function IconMusic() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconAddToQueue() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function formatDuration(seconds) {
  if (!seconds) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── SongRow (inside playlist detail) ─────────────────────────────────────────
function PlaylistSongRow({ song, index, allSongs, onRemove, onLikeToggle }) {
  const [hovered, setHovered] = useState(false);
  const { playSong, currentSong, isPlaying, togglePlay, addToQueue } = usePlayer();
  const artistNames = song.artists?.map((a) => a.name).join(", ") || "Unknown Artist";

  const isCurrent = currentSong?.id === song.id;
  const isThisPlaying = isCurrent && isPlaying;

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, allSongs);
    }
  };

  const handleAddToQueue = (e) => {
    e.stopPropagation();
    addToQueue(song);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    onLikeToggle(song.id);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove(song.id);
  };

  return (
    <div
      className={`${styles.songRow} ${isCurrent ? styles.songRowPlaying : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handlePlay}
    >
      {/* Index / Play button */}
      <div className={styles.songRowIndex}>
        {hovered || isCurrent ? (
          <button className={styles.songRowPlayBtn} aria-label={isThisPlaying ? "Pause" : "Play"}>
            {isThisPlaying ? <IconPause /> : <IconPlay />}
          </button>
        ) : (
          <span className={`${styles.songRowNum} ${isCurrent ? styles.songRowNumPlaying : ""}`}>
            {index + 1}
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <div className={styles.songRowThumb}>
        {song.album?.coverUrl ? (
          <img src={song.album.coverUrl} alt={song.album.name} className={styles.songThumbImg} />
        ) : (
          <div className={styles.songThumbFallback}><IconMusic /></div>
        )}
      </div>

      {/* Info */}
      <div className={styles.songRowInfo}>
        <span className={`${styles.songRowName} ${isCurrent ? styles.songRowNamePlaying : ""}`}>
          {song.name}
        </span>
        <span className={styles.songRowArtist}>{artistNames}</span>
      </div>

      {/* Album */}
      <span className={styles.songRowAlbum}>{song.album?.name || "—"}</span>

      {/* Actions */}
      <div className={styles.songRowActions}>
        <button
          className={`${styles.actionBtn} ${hovered ? styles.actionBtnVisible : ""}`}
          aria-label="Add to queue"
          title="Add to queue"
          onClick={handleAddToQueue}
        >
          <IconAddToQueue />
        </button>
        <button
          className={`${styles.actionBtn} ${styles.likeBtn} ${song.liked ? styles.likeBtnActive : ""} ${(hovered || song.liked) ? styles.actionBtnVisible : ""}`}
          aria-label={song.liked ? "Unlike song" : "Like song"}
          title={song.liked ? "Unlike" : "Like"}
          onClick={handleLike}
        >
          <IconHeart filled={song.liked} />
        </button>
        <button
          className={`${styles.actionBtn} ${styles.removeBtn} ${hovered ? styles.actionBtnVisible : ""}`}
          aria-label="Remove from playlist"
          title="Remove from playlist"
          onClick={handleRemove}
        >
          <IconTrash />
        </button>
      </div>

      {/* Duration */}
      <span className={styles.songRowDuration}>{formatDuration(song.duration)}</span>
    </div>
  );
}

// ── PlaylistDetail ────────────────────────────────────────────────────────────
export function PlaylistDetail({ playlistId, onBack }) {
  const { playQueue, currentSong, isPlaying, togglePlay } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load playlist + its songs
  const loadPlaylist = useCallback(async () => {
    if (!playlistId) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchPlaylist(playlistId);
      if (!data) {
        setError("Playlist not found.");
        return;
      }
      setPlaylist(data);
      setSongs(data.songs || []);
    } catch {
      setError("Failed to load playlist.");
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  // Play all songs in playlist
  const handlePlayAll = () => {
    if (!songs.length) return;
    const isCurrentPlaylist = songs.some((s) => s.id === currentSong?.id);
    if (isCurrentPlaylist) {
      togglePlay();
    } else {
      playQueue(songs, 0);
    }
  };

  // Remove song from playlist (optimistic)
  const handleRemoveSong = async (songId) => {
    setSongs((prev) => prev.filter((s) => s.id !== songId));
    try {
      await removeSongFromPlaylist(playlistId, songId);
      setPlaylist((prev) => prev ? { ...prev, songCount: Math.max(0, (prev.songCount || 1) - 1) } : prev);
    } catch {
      // Rollback by reloading
      loadPlaylist();
    }
  };

  // Toggle like on a song (optimistic)
  const handleLikeToggle = async (songId) => {
    setSongs((prev) =>
      prev.map((s) => s.id === songId ? { ...s, liked: !s.liked } : s)
    );
    try {
      await toggleLike(songId);
    } catch {
      // Rollback
      setSongs((prev) =>
        prev.map((s) => s.id === songId ? { ...s, liked: !s.liked } : s)
      );
    }
  };

  const isPlaylistPlaying = isPlaying && songs.some((s) => s.id === currentSong?.id);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.heroSkeleton}>
          <div className={styles.skeletonCover} />
          <div className={styles.skeletonMeta}>
            <div className={styles.skeletonLine} style={{ width: "40%", height: "12px" }} />
            <div className={styles.skeletonLine} style={{ width: "70%", height: "24px" }} />
            <div className={styles.skeletonLine} style={{ width: "50%", height: "14px" }} />
          </div>
        </div>
        <div className={styles.songList}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.songRowSkeleton}>
              <div className={styles.skeletonLine} style={{ width: "24px", height: "24px", borderRadius: "4px" }} />
              <div className={styles.skeletonLine} style={{ width: "36px", height: "36px", borderRadius: "6px", flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <div className={styles.skeletonLine} style={{ width: "55%", height: "12px" }} />
                <div className={styles.skeletonLine} style={{ width: "35%", height: "10px" }} />
              </div>
              <div className={styles.skeletonLine} style={{ width: "40px", height: "10px" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>{error}</p>
          <button className={styles.backBtn} onClick={onBack}>← Back</button>
        </div>
      </div>
    );
  }

  if (!playlist) return null;

  // ── Playlist cover ────────────────────────────────────────────────────────
  const initials = playlist.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={styles.container}>
      {/* ── Hero section ── */}
      <div className={styles.hero}>
        <div className={styles.heroCover}>
          {playlist.coverUrl ? (
            <img src={playlist.coverUrl} alt={playlist.name} className={styles.heroCoverImg} />
          ) : (
            <div className={styles.heroCoverFallback}>
              <span className={styles.heroCoverInitials}>{initials}</span>
            </div>
          )}
        </div>
        <div className={styles.heroInfo}>
          <span className={styles.heroType}>PLAYLIST</span>
          <h1 className={styles.heroTitle}>{playlist.name}</h1>
          {playlist.description && (
            <p className={styles.heroDescription}>{playlist.description}</p>
          )}
          <p className={styles.heroMeta}>
            {songs.length} {songs.length === 1 ? "song" : "songs"}
          </p>
          <div className={styles.heroActions}>
            <button
              className={`${styles.playAllBtn} ${isPlaylistPlaying ? styles.playAllBtnPaused : ""}`}
              onClick={handlePlayAll}
              disabled={songs.length === 0}
            >
              {isPlaylistPlaying ? <IconPause /> : <IconPlay />}
              {isPlaylistPlaying ? "Pause" : "Play All"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Song list ── */}
      {songs.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><IconMusic /></div>
          <p>This playlist has no songs yet.</p>
          <p className={styles.emptyHint}>Add songs using the + button in the song list.</p>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div className={styles.songListHeader}>
            <span className={styles.songColNum}>#</span>
            <span style={{ gridColumn: "2 / 4" }}>Title</span>
            <span className={styles.songColAlbum}>Album</span>
            <span />
            <span className={styles.songColDuration}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
          </div>

          <div className={styles.songList}>
            {songs.map((song, i) => (
              <PlaylistSongRow
                key={song.id}
                song={song}
                index={i}
                allSongs={songs}
                onRemove={handleRemoveSong}
                onLikeToggle={handleLikeToggle}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}