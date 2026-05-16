import React, { useState, useRef, useCallback, useEffect } from "react";
import styles from "./PlaylistSidebar.module.css";
import {
  fetchPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../../services/playlistService";
import { usePlayer } from "../../context/PlayerContext";

const MIN_WIDTH = 60;
const MAX_WIDTH = 420;
const DEFAULT_WIDTH = 280;
const COLLAPSED_WIDTH = 60;

// ── SVG Icons ────────────────────────────────────────────────────────────────
function IconLibrary() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconMusic() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ── PlaylistItem ─────────────────────────────────────────────────────────────
function PlaylistItem({ playlist, collapsed, isActive, onSelect, onEdit, onDelete, onPlay, isCurrentlyPlaying }) {
  const [hovering, setHovering] = useState(false);

  const initials = playlist.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${styles.playlistItem} ${isActive ? styles.playlistItemActive : ""}`}
      onClick={() => onSelect(playlist)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      title={collapsed ? playlist.name : ""}
    >
      <div className={styles.playlistAvatar}>
        {playlist.coverUrl ? (
          <img src={playlist.coverUrl} alt={playlist.name} className={styles.playlistAvatarImg} />
        ) : (
          <span className={styles.playlistAvatarInitials}>{initials}</span>
        )}
        {/* Play overlay on avatar */}
        {hovering && (
          <div
            className={styles.playlistAvatarOverlay}
            onClick={(e) => { e.stopPropagation(); onPlay?.(playlist); }}
          >
            {isCurrentlyPlaying ? <IconPause /> : <IconPlay />}
          </div>
        )}
      </div>

      {!collapsed && (
        <div className={styles.playlistInfo}>
          <span className={`${styles.playlistName} ${isCurrentlyPlaying ? styles.playlistNamePlaying : ""}`}>
            {playlist.name}
          </span>
          <span className={styles.playlistMeta}>
            <IconMusic />
            {playlist.songCount} songs
          </span>
        </div>
      )}

      {!collapsed && hovering && (
        <div className={styles.playlistActions} onClick={(e) => e.stopPropagation()}>
          <button
            className={styles.playlistActionBtn}
            onClick={(e) => { e.stopPropagation(); onEdit(playlist); }}
            title="Edit playlist"
          >
            <IconEdit />
          </button>
          <button
            className={`${styles.playlistActionBtn} ${styles.playlistActionBtnDelete}`}
            onClick={(e) => { e.stopPropagation(); onDelete(playlist); }}
            title="Delete playlist"
          >
            <IconTrash />
          </button>
        </div>
      )}
    </div>
  );
}

// ── PlaylistModal (Create / Edit) ────────────────────────────────────────────
function PlaylistModal({ mode, playlist, onSave, onClose }) {
  const [name, setName] = useState(playlist?.name || "");
  const [description, setDescription] = useState(playlist?.description || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Playlist name is required."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave({ name: name.trim(), description: description.trim() });
    } catch {
      setError("Failed to save playlist. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {mode === "create" ? "Create Playlist" : "Edit Playlist"}
          </h3>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <label className={styles.modalLabel}>
            Playlist Name <span className={styles.modalRequired}>*</span>
          </label>
          <input
            ref={inputRef}
            className={`${styles.modalInput} ${error ? styles.modalInputError : ""}`}
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            placeholder="My Awesome Playlist"
            maxLength={80}
          />
          {error && <p className={styles.modalError}>{error}</p>}

          <label className={styles.modalLabel} style={{ marginTop: "1rem" }}>
            Description <span className={styles.modalOptional}>(optional)</span>
          </label>
          <textarea
            className={styles.modalTextarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add an optional description…"
            rows={3}
            maxLength={300}
          />
          <div className={styles.modalCharCount}>{description.length}/300</div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.modalCancelBtn} onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className={styles.modalSaveBtn} disabled={saving || !name.trim()}>
              {saving ? "Saving…" : mode === "create" ? "Create" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── DeleteConfirmModal ───────────────────────────────────────────────────────
function DeleteConfirmModal({ playlist, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    function handleKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleDelete() {
    setDeleting(true);
    try { await onConfirm(); }
    finally { setDeleting(false); }
  }

  return (
    <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal} style={{ maxWidth: "360px" }}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Delete Playlist</h3>
          <button className={styles.modalClose} onClick={onClose}><IconX /></button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.deleteMessage}>
            Are you sure you want to delete <strong>"{playlist?.name}"</strong>?
            This action cannot be undone.
          </p>
          <div className={styles.modalActions}>
            <button className={styles.modalCancelBtn} onClick={onClose} disabled={deleting}>Cancel</button>
            <button className={styles.modalDeleteBtn} onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PlaylistSidebar ──────────────────────────────────────────────────────────
export function PlaylistSidebar({ activePlaylistId, onSelectPlaylist, songs = [] }) {
  const { playQueue, currentSong, isPlaying, togglePlay } = usePlayer();
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [deletingPlaylist, setDeletingPlaylist] = useState(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  const dragStartX = useRef(0);
  const dragStartWidth = useRef(DEFAULT_WIDTH);
  const sidebarRef = useRef(null);

  // Load playlists
  useEffect(() => {
    setLoading(true);
    fetchPlaylists()
      .then(setPlaylists)
      .finally(() => setLoading(false));
  }, []);

  // ── Drag-resize logic ────────────────────────────────────────────────────
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartWidth.current = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [width]);

  useEffect(() => {
    if (!isDragging) return;

    function onMouseMove(e) {
      const delta = e.clientX - dragStartX.current;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragStartWidth.current + delta));
      setWidth(newWidth);
      if (newWidth <= COLLAPSED_WIDTH + 10) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    }

    function onMouseUp() {
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  function toggleCollapse() {
    if (isCollapsed) {
      setIsCollapsed(false);
      setWidth(DEFAULT_WIDTH);
    } else {
      setIsCollapsed(true);
      setWidth(COLLAPSED_WIDTH);
    }
  }

  // ── CRUD handlers ────────────────────────────────────────────────────────
  async function handleCreatePlaylist(payload) {
    const newPlaylist = await createPlaylist(payload);
    setPlaylists((prev) => [...prev, newPlaylist]);
    setCreateModalOpen(false);
  }

  async function handleEditPlaylist(payload) {
    const updated = await updatePlaylist(editingPlaylist.id, payload);
    setPlaylists((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingPlaylist(null);
  }

  async function handleDeletePlaylist() {
    await deletePlaylist(deletingPlaylist.id);
    setPlaylists((prev) => prev.filter((p) => p.id !== deletingPlaylist.id));
    if (activePlaylistId === deletingPlaylist.id) {
      onSelectPlaylist?.(null);
    }
    setDeletingPlaylist(null);
  }

  // ── Play a playlist ──────────────────────────────────────────────────────
  function handlePlayPlaylist(playlist) {
    // Get songs from the playlist's song list (if loaded) or from the global songs pool
    let playlistSongs = [];
    if (Array.isArray(playlist.songs) && playlist.songs.length > 0) {
      // playlist.songs may be full song objects or just IDs — try to match with the global pool
      playlistSongs = playlist.songs
        .map((s) => {
          if (typeof s === "object" && s.audioUrl) return s;
          const match = songs.find((gs) => gs.id === (s.id || s));
          return match || null;
        })
        .filter(Boolean);
    }
    // Fallback: use all songs if no playlist-specific songs
    if (!playlistSongs.length) playlistSongs = songs;
    if (!playlistSongs.length) return;

    // If this playlist is currently playing, toggle
    const isCurrentPlaylist = playlistSongs.some((s) => s.id === currentSong?.id);
    if (isCurrentPlaylist) {
      togglePlay();
    } else {
      playQueue(playlistSongs, 0);
    }
  }

  // ── Filtered playlists ───────────────────────────────────────────────────
  const filteredPlaylists = playlists.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const collapsed = isCollapsed || width <= COLLAPSED_WIDTH + 10;

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""} ${isDragging ? styles.sidebarDragging : ""}`}
        style={{ width: collapsed ? COLLAPSED_WIDTH : width }}
      >
        {/* ── Header ── */}
        <div className={styles.sidebarHeader}>
          <button
            className={styles.sidebarHeaderBtn}
            onClick={toggleCollapse}
            title={collapsed ? "Expand library" : "Collapse library"}
          >
            <IconLibrary />
            {!collapsed && <span className={styles.sidebarHeaderText}>Your Library</span>}
          </button>
          {!collapsed && (
            <button
              className={styles.addPlaylistBtn}
              onClick={() => setCreateModalOpen(true)}
              title="Create playlist"
            >
              <IconPlus />
            </button>
          )}
        </div>

        {/* ── Search (only when expanded) ── */}
        {!collapsed && (
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search playlists…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* ── Playlist list ── */}
        <div className={styles.playlistList}>
          {loading ? (
            <div className={styles.playlistListLoading}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeletonItem}>
                  <div className={styles.skeletonAvatar} />
                  {!collapsed && (
                    <div className={styles.skeletonText}>
                      <div className={styles.skeletonLine} style={{ width: "70%" }} />
                      <div className={styles.skeletonLine} style={{ width: "40%" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : filteredPlaylists.length === 0 ? (
            !collapsed && (
              <div className={styles.emptyState}>
                {searchQuery ? (
                  <p>No playlists match "{searchQuery}"</p>
                ) : (
                  <>
                    <p>Create your first playlist</p>
                    <button className={styles.emptyCreateBtn} onClick={() => setCreateModalOpen(true)}>
                      <IconPlus /> New Playlist
                    </button>
                  </>
                )}
              </div>
            )
          ) : (
            filteredPlaylists.map((playlist) => {
              const playlistSongIds = (playlist.songs || []).map((s) => s.id ?? s);
              const isCurrentlyPlaying =
                isPlaying &&
                currentSong != null &&
                activePlaylistId === playlist.id &&
                playlistSongIds.includes(currentSong.id);
              return (
                <PlaylistItem
                  key={playlist.id}
                  playlist={playlist}
                  collapsed={collapsed}
                  isActive={activePlaylistId === playlist.id}
                  onSelect={onSelectPlaylist}
                  onEdit={setEditingPlaylist}
                  onDelete={setDeletingPlaylist}
                  onPlay={handlePlayPlaylist}
                  isCurrentlyPlaying={isCurrentlyPlaying}
                />
              );
            })
          )}
        </div>

        {/* ── Collapsed: add button at bottom ── */}
        {collapsed && (
          <button
            className={styles.collapsedAddBtn}
            onClick={() => { setIsCollapsed(false); setWidth(DEFAULT_WIDTH); setCreateModalOpen(true); }}
            title="Create playlist"
          >
            <IconPlus />
          </button>
        )}

        {/* ── Resize handle ── */}
        <div
          className={`${styles.resizeHandle} ${isDragging ? styles.resizeHandleActive : ""}`}
          onMouseDown={handleDragStart}
          title="Drag to resize"
        />
      </aside>

      {/* ── Modals ── */}
      {createModalOpen && (
        <PlaylistModal
          mode="create"
          onSave={handleCreatePlaylist}
          onClose={() => setCreateModalOpen(false)}
        />
      )}
      {editingPlaylist && (
        <PlaylistModal
          mode="edit"
          playlist={editingPlaylist}
          onSave={handleEditPlaylist}
          onClose={() => setEditingPlaylist(null)}
        />
      )}
      {deletingPlaylist && (
        <DeleteConfirmModal
          playlist={deletingPlaylist}
          onConfirm={handleDeletePlaylist}
          onClose={() => setDeletingPlaylist(null)}
        />
      )}
    </>
  );
}