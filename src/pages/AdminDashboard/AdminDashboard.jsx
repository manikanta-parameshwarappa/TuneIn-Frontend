
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ArtistModal } from "../../components/ArtistModal/ArtistModal";
import { AlbumModal } from "../../components/AlbumModal/AlbumModal";
import { SongUploadModal } from "../../components/SongModals/SongUploadModal";
import { SongEditModal } from "../../components/SongModals/SongEditModal";
import { ConfirmModal } from "../../components/ConfirmModal/ConfirmModal";
import {
  fetchArtists,
  createArtist,
  updateArtist,
  deleteArtist,
} from "../../services/artistService";
import {
  fetchAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} from "../../services/albumService";
import {
  fetchSongs,
  uploadSongs,
  updateSong,
  deleteSong,
} from "../../services/songService";
import styles from "./AdminDashboard.module.css";

/* ── Icon helpers ──────────────────────────────────────── */
function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/* ── Mini Audio Player (inline, no CSS module needed) ──── */
function MiniPlayer({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().catch(() => {}); setPlaying(true); }
  };
  const handleTimeUpdate = () => {
    const a = audioRef.current;
    if (a) setProgress(a.currentTime);
  };
  const handleLoaded = () => {
    const a = audioRef.current;
    if (a && isFinite(a.duration)) setDuration(a.duration);
  };
  const handleEnded = () => setPlaying(false);
  const handleSeek = (e) => {
    const a = audioRef.current;
    if (!a) return;
    const t = Number(e.target.value);
    a.currentTime = t;
    setProgress(t);
  };
  const fmt = (s) => {
    if (!s || !isFinite(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };
  const fillPct = duration ? Math.round((progress / duration) * 100) : 0;
  const seekBg = `linear-gradient(to right, #3b82f6 ${fillPct}%, rgba(156,163,175,0.2) ${fillPct}%)`;

  if (!src) return <span style={{ fontSize: "0.7rem", color: "#374151", fontStyle: "italic" }}>No audio</span>;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: "20px", padding: "0.28rem 0.6rem", minWidth: "160px", maxWidth: "220px" }}
    >
      <audio ref={audioRef} src={src} preload="metadata" onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoaded} onDurationChange={handleLoaded} onEnded={handleEnded} />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", borderRadius: "50%", background: playing ? "#3b82f6" : "rgba(59,130,246,0.8)", color: "#fff", border: "none", cursor: "pointer", flexShrink: 0 }}
      >
        {playing
          ? <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          : <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        }
      </button>
      <input
        type="range" min="0" max={duration || 100} step="0.1" value={progress}
        onChange={handleSeek}
        style={{ flex: 1, height: "4px", borderRadius: "2px", outline: "none", cursor: "pointer", minWidth: 0, WebkitAppearance: "none", appearance: "none", background: seekBg }}
      />
      <span style={{ fontSize: "0.65rem", color: "#6b7280", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{fmt(progress)}/{fmt(duration)}</span>
    </div>
  );
}

/* ── Utility ───────────────────────────────────────────── */
function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (isNaN(d)) return dateString;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatDuration(seconds) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const TABS = ["Artists", "Albums", "Songs"];

/* ══════════════════════════════════════════════════════════
   AdminDashboard — unified CRUD for Artists, Albums, Songs
══════════════════════════════════════════════════════════ */
export function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Artists");

  /* ── Artists state ──────────────────────────────────── */
  const [artists, setArtists] = useState([]);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const [artistsError, setArtistsError] = useState(null);
  const [artistSearch, setArtistSearch] = useState("");
  const [artistModalOpen, setArtistModalOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistSubmitting, setArtistSubmitting] = useState(false);
  const [artistSubmitError, setArtistSubmitError] = useState(null);

  /* ── Albums state ───────────────────────────────────── */
  const [albums, setAlbums] = useState([]);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [albumsError, setAlbumsError] = useState(null);
  const [albumSearch, setAlbumSearch] = useState("");
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumSubmitting, setAlbumSubmitting] = useState(false);
  const [albumSubmitError, setAlbumSubmitError] = useState(null);

  /* ── Songs state ────────────────────────────────────── */
  const [songs, setSongs] = useState([]);
  const [songsLoading, setSongsLoading] = useState(true);
  const [songsError, setSongsError] = useState(null);
  const [songSearch, setSongSearch] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [songSubmitting, setSongSubmitting] = useState(false);
  const [songSubmitError, setSongSubmitError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  /* ── Confirm-delete modal state ─────────────────────── */
  // pendingDelete: { id, type: "artist"|"album"|"song", name: string } | null
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Load data ──────────────────────────────────────── */
  const loadArtists = useCallback(async () => {
    setArtistsLoading(true);
    setArtistsError(null);
    try {
      const data = await fetchArtists();
      setArtists(data);
    } catch (err) {
      setArtistsError(err?.response?.data?.message || err?.message || "Failed to load artists.");
    } finally {
      setArtistsLoading(false);
    }
  }, []);

  const loadAlbums = useCallback(async () => {
    setAlbumsLoading(true);
    setAlbumsError(null);
    try {
      const data = await fetchAlbums();
      setAlbums(data);
    } catch (err) {
      setAlbumsError(err?.response?.data?.message || err?.message || "Failed to load albums.");
    } finally {
      setAlbumsLoading(false);
    }
  }, []);

  const loadSongs = useCallback(async () => {
    setSongsLoading(true);
    setSongsError(null);
    try {
      const data = await fetchSongs();
      setSongs(data);
    } catch (err) {
      setSongsError(err?.response?.data?.message || err?.message || "Failed to load songs.");
    } finally {
      setSongsLoading(false);
    }
  }, []);

  useEffect(() => { loadArtists(); }, [loadArtists]);
  useEffect(() => { loadAlbums(); }, [loadAlbums]);
  useEffect(() => { loadSongs(); }, [loadSongs]);

  /* ── Filtered lists ─────────────────────────────────── */
  const filteredArtists = artists.filter((a) =>
    a.name?.toLowerCase().includes(artistSearch.toLowerCase()) ||
    a.email?.toLowerCase().includes(artistSearch.toLowerCase())
  );

  const filteredAlbums = albums.filter((a) =>
    a.name?.toLowerCase().includes(albumSearch.toLowerCase()) ||
    a.musicDirectorName?.toLowerCase().includes(albumSearch.toLowerCase())
  );

  const filteredSongs = songs.filter((s) =>
    s.name?.toLowerCase().includes(songSearch.toLowerCase()) ||
    s.album?.name?.toLowerCase().includes(songSearch.toLowerCase()) ||
    (s.artists && s.artists.some((a) => a.name?.toLowerCase().includes(songSearch.toLowerCase())))
  );

  /* ── Artist handlers ────────────────────────────────── */
  async function handleArtistSubmit(payload) {
    setArtistSubmitting(true);
    setArtistSubmitError(null);
    try {
      if (selectedArtist) {
        const updated = await updateArtist(selectedArtist.id, payload);
        setArtists((prev) => prev.map((a) => (a.id === selectedArtist.id ? updated : a)));
      } else {
        const created = await createArtist(payload);
        setArtists((prev) => [...prev, created]);
      }
      setArtistModalOpen(false);
    } catch (err) {
      setArtistSubmitError(err?.response?.data?.message || err?.message || "Failed to save artist.");
    } finally {
      setArtistSubmitting(false);
    }
  }

  function handleArtistDelete(id) {
    const artist = artists.find((a) => a.id === id);
    setDeleteError(null);
    setPendingDelete({ id, type: "artist", name: artist?.name || "this artist" });
  }

  /* ── Album handlers ─────────────────────────────────── */
  async function handleAlbumSubmit(payload) {
    setAlbumSubmitting(true);
    setAlbumSubmitError(null);
    try {
      if (selectedAlbum) {
        const updated = await updateAlbum(selectedAlbum.id, payload);
        setAlbums((prev) => prev.map((a) => (a.id === selectedAlbum.id ? updated : a)));
      } else {
        const created = await createAlbum(payload);
        setAlbums((prev) => [...prev, created]);
      }
      setAlbumModalOpen(false);
    } catch (err) {
      setAlbumSubmitError(err?.response?.data?.message || err?.message || "Failed to save album.");
    } finally {
      setAlbumSubmitting(false);
    }
  }

  function handleAlbumDelete(id) {
    const album = albums.find((a) => a.id === id);
    setDeleteError(null);
    setPendingDelete({ id, type: "album", name: album?.name || "this album" });
  }

  /* ── Song handlers ──────────────────────────────────── */
  async function handleSongUpload(songPayloads) {
    setSongSubmitting(true);
    setSongSubmitError(null);
    try {
      const newSongs = await uploadSongs(songPayloads, (pct) => setUploadProgress(pct));
      setSongs((prev) => [...prev, ...newSongs]);
      setUploadModalOpen(false);
    } catch (err) {
      setSongSubmitError(err?.response?.data?.message || err?.message || "Failed to upload songs.");
    } finally {
      setSongSubmitting(false);
    }
  }

  async function handleSongEdit(payload) {
    setSongSubmitting(true);
    setSongSubmitError(null);
    try {
      const updated = await updateSong(selectedSong.id, payload);
      setSongs((prev) => prev.map((s) => (s.id === selectedSong.id ? updated : s)));
      setEditModalOpen(false);
    } catch (err) {
      setSongSubmitError(err?.response?.data?.message || err?.message || "Failed to save song.");
    } finally {
      setSongSubmitting(false);
    }
  }

  function handleSongDelete(id) {
    const song = songs.find((s) => s.id === id);
    setDeleteError(null);
    setPendingDelete({ id, type: "song", name: song?.name || "this song" });
  }

  /* ── Unified confirm-delete execution ───────────────── */
  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    const { id, type } = pendingDelete;
    try {
      if (type === "artist") {
        await deleteArtist(id);
        setArtists((prev) => prev.filter((a) => a.id !== id));
      } else if (type === "album") {
        await deleteAlbum(id);
        setAlbums((prev) => prev.filter((a) => a.id !== id));
      } else if (type === "song") {
        await deleteSong(id);
        setSongs((prev) => prev.filter((s) => s.id !== id));
      }
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(
        err?.response?.data?.message ||
        err?.message ||
        `Failed to delete ${type}.`
      );
    } finally {
      setDeleting(false);
    }
  }

  /* ── Tab content renderers ──────────────────────────── */
  function renderArtistsTab() {
    return (
      <div className={styles.tabContent}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}><SearchIcon /></span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search artists by name or email…"
              value={artistSearch}
              onChange={(e) => setArtistSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => { setSelectedArtist(null); setArtistSubmitError(null); setArtistModalOpen(true); }}
          >
            <PlusIcon />
            Add Artist
          </button>
        </div>

        {/* Table area */}
        {artistsLoading && <TableSkeleton cols={4} />}

        {!artistsLoading && artistsError && (
          <ErrorBanner message={artistsError} onRetry={loadArtists} />
        )}

        {!artistsLoading && !artistsError && filteredArtists.length === 0 && (
          <EmptyState
            icon="🎤"
            title={artistSearch ? "No artists match your search" : "No artists yet"}
            desc={artistSearch ? "Try a different search term." : "Add your first artist to start building the catalogue."}
            action={!artistSearch ? { label: "Add Artist", onClick: () => { setSelectedArtist(null); setArtistSubmitError(null); setArtistModalOpen(true); } } : null}
          />
        )}

        {!artistsLoading && !artistsError && filteredArtists.length > 0 && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <colgroup>
                <col style={{ width: "4%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "18%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th className={styles.th}>#</th>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Bio</th>
                  <th className={`${styles.th} ${styles.thActions}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArtists.map((artist, idx) => (
                  <tr key={artist.id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{idx + 1}</td>
                    <td className={styles.td}>
                      <div className={styles.nameCell}>
                        {artist.avatarUrl ? (
                          <img
                            src={artist.avatarUrl}
                            alt={artist.name}
                            className={styles.avatarImg}
                          />
                        ) : (
                          <div className={styles.avatar} aria-hidden="true">
                            {getInitials(artist.name)}
                          </div>
                        )}
                        <span className={styles.nameCellText}>{artist.name}</span>
                      </div>
                    </td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{artist.email || "—"}</td>
                    <td className={`${styles.td} ${styles.tdBio}`}>
                      {artist.bio
                        ? <span>{artist.bio}</span>
                        : <span className={styles.emptyCell}>—</span>}
                    </td>
                    <td className={`${styles.td} ${styles.tdActions}`}>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        title="Edit artist"
                        aria-label={`Edit ${artist.name}`}
                        onClick={() => { setSelectedArtist(artist); setArtistSubmitError(null); setArtistModalOpen(true); }}
                      >
                        <PencilIcon />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        title="Delete artist"
                        aria-label={`Delete ${artist.name}`}
                        onClick={() => handleArtistDelete(artist.id)}
                      >
                        <TrashIcon />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  function renderAlbumsTab() {
    return (
      <div className={styles.tabContent}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}><SearchIcon /></span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search albums by name or artist…"
              value={albumSearch}
              onChange={(e) => setAlbumSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => { setSelectedAlbum(null); setAlbumSubmitError(null); setAlbumModalOpen(true); }}
          >
            <PlusIcon />
            Add Album
          </button>
        </div>

        {/* Table area */}
        {albumsLoading && <TableSkeleton cols={5} />}

        {!albumsLoading && albumsError && (
          <ErrorBanner message={albumsError} onRetry={loadAlbums} />
        )}

        {!albumsLoading && !albumsError && filteredAlbums.length === 0 && (
          <EmptyState
            icon="💿"
            title={albumSearch ? "No albums match your search" : "No albums yet"}
            desc={albumSearch ? "Try a different search term." : "Add your first album to start building the catalogue."}
            action={!albumSearch ? { label: "Add Album", onClick: () => { setSelectedAlbum(null); setAlbumSubmitError(null); setAlbumModalOpen(true); } } : null}
          />
        )}

        {!albumsLoading && !albumsError && filteredAlbums.length > 0 && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <colgroup>
                <col style={{ width: "4%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "18%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th className={styles.th}>#</th>
                  <th className={styles.th}>Album Name</th>
                  <th className={styles.th}>Artist</th>
                  <th className={styles.th}>Released</th>
                  <th className={styles.th}>Description</th>
                  <th className={`${styles.th} ${styles.thActions}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlbums.map((album, idx) => (
                  <tr key={album.id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{idx + 1}</td>
                    <td className={styles.td}>
                      <div className={styles.nameCell}>
                        {album.avatarUrl ? (
                          <img
                            src={album.avatarUrl}
                            alt={album.name}
                            className={`${styles.avatarImg} ${styles.avatarImgSquare}`}
                          />
                        ) : (
                          <div className={`${styles.avatar} ${styles.avatarAlbum}`} aria-hidden="true">💿</div>
                        )}
                        <span className={styles.nameCellText}>{album.name}</span>
                      </div>
                    </td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{album.musicDirectorName || "—"}</td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{formatDate(album.releasedDate)}</td>
                    <td className={`${styles.td} ${styles.tdBio}`}>
                      {album.description
                        ? <span>{album.description}</span>
                        : <span className={styles.emptyCell}>—</span>}
                    </td>
                    <td className={`${styles.td} ${styles.tdActions}`}>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        title="Edit album"
                        aria-label={`Edit ${album.name}`}
                        onClick={() => { setSelectedAlbum(album); setAlbumSubmitError(null); setAlbumModalOpen(true); }}
                      >
                        <PencilIcon />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        title="Delete album"
                        aria-label={`Delete ${album.name}`}
                        onClick={() => handleAlbumDelete(album.id)}
                      >
                        <TrashIcon />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  function renderSongsTab() {
    return (
      <div className={styles.tabContent}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}><SearchIcon /></span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search songs by name, album or artist…"
              value={songSearch}
              onChange={(e) => setSongSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => { setSongSubmitError(null); setUploadProgress(0); setUploadModalOpen(true); }}
          >
            <PlusIcon />
            Upload Songs
          </button>
        </div>

        {/* Table area */}
        {songsLoading && <TableSkeleton cols={6} />}

        {!songsLoading && songsError && (
          <ErrorBanner message={songsError} onRetry={loadSongs} />
        )}

        {!songsLoading && !songsError && filteredSongs.length === 0 && (
          <EmptyState
            icon="🎵"
            title={songSearch ? "No songs match your search" : "No songs yet"}
            desc={songSearch ? "Try a different search term." : "Upload your first tracks to start building the library."}
            action={!songSearch ? { label: "Upload Songs", onClick: () => { setSongSubmitError(null); setUploadProgress(0); setUploadModalOpen(true); } } : null}
          />
        )}

        {!songsLoading && !songsError && filteredSongs.length > 0 && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <colgroup>
                <col style={{ width: "3%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "12%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th className={styles.th}>#</th>
                  <th className={styles.th}>Song Name</th>
                  <th className={styles.th}>Artists</th>
                  <th className={styles.th}>Album</th>
                  <th className={styles.th}>Genre</th>
                  <th className={styles.th}>Duration</th>
                  <th className={styles.th}>Audio Preview</th>
                  <th className={`${styles.th} ${styles.thActions}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSongs.map((song, idx) => {
                  const coverSrc = song.album?.coverUrl || null;
                  return (
                    <tr key={song.id} className={styles.tr}>
                      <td className={`${styles.td} ${styles.tdMuted}`}>{idx + 1}</td>
                      <td className={styles.td}>
                        <div className={styles.nameCell}>
                          {coverSrc ? (
                            <img
                              src={coverSrc}
                              alt={song.album?.name || "Album cover"}
                              style={{ width: "34px", height: "34px", borderRadius: "6px", objectFit: "cover", flexShrink: 0, boxShadow: "0 1px 6px rgba(0,0,0,0.45)" }}
                            />
                          ) : (
                            <div className={`${styles.avatar} ${styles.avatarSong}`} aria-hidden="true">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            </div>
                          )}
                          <span className={styles.nameCellText}>{song.name}</span>
                        </div>
                      </td>
                      <td className={`${styles.td} ${styles.tdMuted}`}>
                        {song.artists && song.artists.length > 0
                          ? song.artists.map((a) => a.name).join(", ")
                          : "—"}
                      </td>
                      <td className={`${styles.td} ${styles.tdMuted}`}>{song.album?.name || "—"}</td>
                      <td className={`${styles.td} ${styles.tdMuted}`}>
                        {song.genre
                          ? <span className={styles.genreTag}>{song.genre}</span>
                          : <span className={styles.emptyCell}>—</span>}
                      </td>
                      <td className={`${styles.td} ${styles.tdMuted}`}>{formatDuration(song.duration)}</td>
                      <td className={styles.td} style={{ overflow: "visible", whiteSpace: "normal", padding: "0.4rem 0.75rem" }}>
                        <MiniPlayer src={song.audioUrl} />
                      </td>
                      <td className={`${styles.td} ${styles.tdActions}`}>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.editBtn}`}
                          title="Edit song"
                          aria-label={`Edit ${song.name}`}
                          onClick={() => { setSelectedSong(song); setSongSubmitError(null); setEditModalOpen(true); }}
                        >
                          <PencilIcon />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title="Delete song"
                          aria-label={`Delete ${song.name}`}
                          onClick={() => handleSongDelete(song.id)}
                        >
                          <TrashIcon />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  /* ── Tab badge counts ───────────────────────────────── */
  const tabCounts = {
    Artists: artistsLoading ? null : artists.length,
    Albums: albumsLoading ? null : albums.length,
    Songs: songsLoading ? null : songs.length,
  };

  /* ── Render ─────────────────────────────────────────── */
  return (
    <main className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <div className={styles.headerBadge}>Admin</div>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>
              Welcome back,{" "}
              <span className={styles.adminName}>{user?.name ?? "Administrator"}</span>. Manage your
              music catalogue below.
            </p>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className={styles.tabBar}>
        <div className={styles.tabBarInner}>
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab)}
              aria-selected={activeTab === tab}
              role="tab"
            >
              <span className={styles.tabLabel}>
                {tab === "Artists" && "🎤 "}
                {tab === "Albums" && "💿 "}
                {tab === "Songs" && "🎵 "}
                {tab}
              </span>
              {tabCounts[tab] !== null && tabCounts[tab] !== undefined && (
                <span className={`${styles.tabCount} ${activeTab === tab ? styles.tabCountActive : ""}`}>
                  {tabCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab panel */}
      <div className={styles.container} role="tabpanel">
        {activeTab === "Artists" && renderArtistsTab()}
        {activeTab === "Albums" && renderAlbumsTab()}
        {activeTab === "Songs" && renderSongsTab()}
      </div>

      {/* Modals */}
      <ArtistModal
        open={artistModalOpen}
        onClose={() => setArtistModalOpen(false)}
        onSubmit={handleArtistSubmit}
        artist={selectedArtist}
        submitting={artistSubmitting}
        serverError={artistSubmitError}
      />

      <AlbumModal
        isOpen={albumModalOpen}
        onClose={() => setAlbumModalOpen(false)}
        onSubmit={handleAlbumSubmit}
        album={selectedAlbum}
        submitting={albumSubmitting}
        serverError={albumSubmitError}
      />

      <SongUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleSongUpload}
        submitting={songSubmitting}
        uploadProgress={uploadProgress}
        serverError={songSubmitError}
      />

      <SongEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onEdit={handleSongEdit}
        song={selectedSong}
        submitting={songSubmitting}
        serverError={songSubmitError}
      />

      {/* Confirm delete modal */}
      <ConfirmModal
        open={!!pendingDelete}
        title={`Delete ${pendingDelete?.type ?? "item"}?`}
        message={
          pendingDelete
            ? `"${pendingDelete.name}" will be permanently removed. This action cannot be undone.${deleteError ? `\n\nError: ${deleteError}` : ""}`
            : undefined
        }
        confirmLabel={deleting ? "Deleting…" : "Yes, delete"}
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => { if (!deleting) { setPendingDelete(null); setDeleteError(null); } }}
      />
    </main>
  );
}

/* ── Helper sub-components ─────────────────────────────── */

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function TableSkeleton({ cols }) {
  return (
    <div className={styles.skeletonWrapper} aria-busy="true" aria-label="Loading…">
      <div className={styles.skeletonToolbar}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonSearchBar}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonBtn}`} />
      </div>
      <div className={styles.skeletonTable}>
        <div className={styles.skeletonHeader}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className={`${styles.skeletonBlock} ${styles.skeletonTh}`} />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className={styles.skeletonRow}>
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className={`${styles.skeletonBlock} ${styles.skeletonTd} ${i === 0 ? styles.skeletonTdNarrow : ""}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className={styles.errorBanner} role="alert">
      <span className={styles.errorBannerIcon}>⚠️</span>
      <span className={styles.errorBannerMsg}>{message}</span>
      {onRetry && (
        <button type="button" className={styles.retryBtn} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

function EmptyState({ icon, title, desc, action }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyDesc}>{desc}</p>
      {action && (
        <button type="button" className={styles.addBtn} onClick={action.onClick}>
          <PlusIcon />
          {action.label}
        </button>
      )}
    </div>
  );
}
