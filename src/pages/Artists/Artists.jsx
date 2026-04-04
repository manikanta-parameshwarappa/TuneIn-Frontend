import React, { useCallback, useEffect, useState } from "react";
import { ArtistModal } from "../../components/ArtistModal/ArtistModal";
import { fetchArtists, createArtist, updateArtist, deleteArtist } from "../../services/artistService";
import styles from "./Artists.module.css";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function MusicNoteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

/**
 * Artists management page — admin-only.
 * Rendered exclusively inside AdminRoute so no additional role check is needed here.
 */
export function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  const [selectedArtist, setSelectedArtist] = useState(null);

  /* ── Load artists on mount ─────────────────────────── */
  const loadArtists = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchArtists();
      setArtists(data);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load artists. Please try again.";
      setFetchError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArtists();
  }, [loadArtists]);

  /* ── Create/Update artist ───────────── */
  async function handleSubmit(payload) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (selectedArtist) {
        const updated = await updateArtist(selectedArtist.id, payload);
        setArtists((prev) => prev.map((a) => (a.id === selectedArtist.id ? updated : a)));
      } else {
        const newArtist = await createArtist(payload);
        setArtists((prev) => [...prev, newArtist]);
      }
      setModalOpen(false);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save artist. Please try again.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenCreateModal() {
    setSelectedArtist(null);
    setSubmitError(null);
    setModalOpen(true);
  }

  function handleOpenEditModal(artist) {
    setSelectedArtist(artist);
    setSubmitError(null);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setSubmitError(null);
    setModalOpen(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this artist?")) return;
    try {
      await deleteArtist(id);
      setArtists((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete artist. Please try again.";
      alert(message);
    }
  }

  /* ── Render ────────────────────────────────────────── */
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <div className={styles.headerBadge}>Admin</div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Artists</h1>
              {artists.length > 0 && (
                <span className={styles.countBadge}>
                  {artists.length} {artists.length === 1 ? "artist" : "artists"}
                </span>
              )}
            </div>
            <p className={styles.subtitle}>
              Manage the artist catalogue available on TuneIn.
            </p>
          </div>
          <button
            type="button"
            className={styles.addBtn}
            onClick={handleOpenCreateModal}
            disabled={loading}
          >
            <span className={styles.addBtnPlus} aria-hidden="true">+</span>
            Add Artist
          </button>
        </div>
      </header>

      <div className={styles.container}>
        {/* Loading state */}
        {loading && (
          <div className={styles.loadingState} role="status" aria-live="polite">
            <p>Loading artists…</p>
          </div>
        )}

        {/* Fetch error state */}
        {!loading && fetchError && (
          <div className={styles.errorState} role="alert">
            <p className={styles.errorMsg}>{fetchError}</p>
            <button
              type="button"
              className={styles.addBtn}
              onClick={loadArtists}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && artists.length === 0 && (
          <div className={styles.emptyState} role="status">
            <div className={styles.emptyIcon}>
              <MusicNoteIcon />
            </div>
            <h2 className={styles.emptyTitle}>No artists yet</h2>
            <p className={styles.emptyDesc}>
              Add your first artist to start building the TuneIn music catalogue.
            </p>
            <button
              type="button"
              className={styles.addBtn}
              onClick={handleOpenCreateModal}
            >
              <span className={styles.addBtnPlus} aria-hidden="true">+</span>
              Add Artist
            </button>
          </div>
        )}

        {/* Artists grid */}
        {!loading && !fetchError && artists.length > 0 && (
          <div className={styles.grid} role="list">
            {artists.map((artist) => (
              <article key={artist.id} className={styles.card} role="listitem">
                <div className={styles.avatar} aria-hidden="true">
                  {getInitials(artist.name)}
                </div>
                <div className={styles.info}>
                  <h3 className={styles.artistName}>{artist.name}</h3>
                  <p className={styles.artistEmail}>{artist.email}</p>
                  {artist.bio && (
                    <p className={styles.artistBio}>
                      {artist.bio.length > 120
                        ? artist.bio.slice(0, 120).trimEnd() + "\u2026"
                        : artist.bio}
                    </p>
                  )}
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    aria-label={`Edit ${artist.name}`}
                    title="Edit artist"
                    onClick={() => handleOpenEditModal(artist)}
                  >
                    <PencilIcon />
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    aria-label={`Delete ${artist.name}`}
                    title="Delete artist"
                    onClick={() => handleDelete(artist.id)}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <ArtistModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        artist={selectedArtist}
        submitting={submitting}
        serverError={submitError}
      />
    </main>
  );
}