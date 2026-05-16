import React, { useState, useEffect } from "react";
import styles from "./AddToPlaylistModal.module.css";
import { fetchPlaylists, addSongToPlaylist } from "../../services/playlistService";

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconMusic() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/**
 * AddToPlaylistModal
 * Props:
 *   song       — the song object to add
 *   onClose    — callback to close the modal
 *   onAdded    — optional callback(playlistId, playlistName) after successfully adding
 */
export function AddToPlaylistModal({ song, onClose, onAdded }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState(null); // playlistId being processed
  const [added, setAdded] = useState({}); // { [playlistId]: true }
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchPlaylists()
      .then((data) => {
        setPlaylists(data);
        // Pre-mark playlists that already contain this song
        const alreadyIn = {};
        data.forEach((p) => {
          if (p.songs?.some((s) => s.id === song.id)) {
            alreadyIn[p.id] = true;
          }
        });
        setAdded(alreadyIn);
      })
      .finally(() => setLoading(false));
  }, [song.id]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleAdd(playlist) {
    if (added[playlist.id]) return; // already in playlist
    setAddingTo(playlist.id);
    setError("");
    try {
      await addSongToPlaylist(playlist.id, song.id);
      setAdded((prev) => ({ ...prev, [playlist.id]: true }));
      onAdded?.(playlist.id, playlist.name);
    } catch {
      setError(`Failed to add to "${playlist.name}". Please try again.`);
    } finally {
      setAddingTo(null);
    }
  }

  const artistNames = song.artists?.map((a) => a.name).join(", ") || "Unknown Artist";

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>Add to Playlist</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </div>

        {/* Song info */}
        <div className={styles.songInfo}>
          {song.album?.coverUrl ? (
            <img src={song.album.coverUrl} alt={song.album.name} className={styles.songThumb} />
          ) : (
            <div className={styles.songThumbFallback}>
              <IconMusic />
            </div>
          )}
          <div className={styles.songMeta}>
            <span className={styles.songName}>{song.name}</span>
            <span className={styles.songArtist}>{artistNames}</span>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Playlist list */}
        <div className={styles.listWrapper}>
          {loading ? (
            <div className={styles.loadingState}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeletonItem}>
                  <div className={styles.skeletonAvatar} />
                  <div className={styles.skeletonText}>
                    <div className={styles.skeletonLine} style={{ width: "60%" }} />
                    <div className={styles.skeletonLine} style={{ width: "35%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You have no playlists yet.</p>
              <p className={styles.emptyHint}>Create a playlist from the sidebar first.</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {playlists.map((playlist) => {
                const isAdded = !!added[playlist.id];
                const isAdding = addingTo === playlist.id;
                const initials = playlist.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <li key={playlist.id} className={styles.listItem}>
                    <button
                      className={`${styles.playlistBtn} ${isAdded ? styles.playlistBtnAdded : ""}`}
                      onClick={() => handleAdd(playlist)}
                      disabled={isAdded || isAdding}
                    >
                      <div className={styles.playlistAvatar}>
                        {playlist.coverUrl ? (
                          <img src={playlist.coverUrl} alt={playlist.name} className={styles.playlistAvatarImg} />
                        ) : (
                          <span className={styles.playlistAvatarInitials}>{initials}</span>
                        )}
                      </div>
                      <div className={styles.playlistInfo}>
                        <span className={styles.playlistName}>{playlist.name}</span>
                        <span className={styles.playlistSongCount}>
                          {playlist.songCount} {playlist.songCount === 1 ? "song" : "songs"}
                        </span>
                      </div>
                      <div className={styles.playlistAction}>
                        {isAdding ? (
                          <span className={styles.spinner} />
                        ) : isAdded ? (
                          <span className={styles.addedIcon}>
                            <IconCheck />
                          </span>
                        ) : (
                          <span className={styles.addIcon}>
                            <IconPlus />
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}
      </div>
    </div>
  );
}