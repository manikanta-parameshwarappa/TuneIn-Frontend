import React, { useEffect, useState } from "react";
import styles from "./Albums.module.css";
import { fetchAlbums, createAlbum, updateAlbum, deleteAlbum } from "../../services/albumService";
import { AlbumModal } from "../../components/AlbumModal/AlbumModal";

export function Albums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const data = await fetchAlbums();
      setAlbums(data);
    } catch (err) {
      setFetchError(err.response?.data?.message || err.message || "Failed to load albums");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedAlbum(null);
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (album) => {
    setSelectedAlbum(album);
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      if (selectedAlbum) {
        // Update
        const updated = await updateAlbum(selectedAlbum.id, formData);
        setAlbums((prev) => prev.map((a) => (a.id === selectedAlbum.id ? updated : a)));
      } else {
        // Create
        const newAlbum = await createAlbum(formData);
        setAlbums((prev) => [...prev, newAlbum]);
      }
      setModalOpen(false);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || "An error occurred while saving the album.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this album?")) return;
    
    try {
      await deleteAlbum(id);
      setAlbums((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete album");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingState} role="status" aria-live="polite">
          <p>Loading albums…</p>
        </div>
      );
    }

    if (fetchError) {
      return (
        <div className={styles.errorState} role="alert">
          <p className={styles.errorMsg}>{fetchError}</p>
          <button type="button" className={styles.addBtn} onClick={loadAlbums}>
            Retry
          </button>
        </div>
      );
    }

    if (albums.length === 0) {
      return (
        <div className={styles.emptyState} role="status">
          <div className={styles.emptyIcon}>💿</div>
          <h2 className={styles.emptyTitle}>No albums yet</h2>
          <p className={styles.emptyDesc}>
            Add your first album to start building the TuneIn music catalogue.
          </p>
          <button type="button" className={styles.addBtn} onClick={handleOpenCreateModal}>
            <span className={styles.addBtnPlus} aria-hidden="true">+</span>
            Add Album
          </button>
        </div>
      );
    }

    return (
      <div className={styles.grid} role="list">
        {albums.map((album) => (
          <article key={album.id} className={styles.card} role="listitem">
            <div className={styles.cardContent}>
              <h3 className={styles.albumName}>{album.name}</h3>
              <p className={styles.musicDirector}>{album.musicDirectorName || "Unknown Artist"}</p>
              <div className={styles.details}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Released</span>
                  <span>{formatDate(album.releasedDate)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Desc</span>
                  <span className={styles.description}>{album.description || "—"}</span>
                </div>
              </div>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.editBtn}`}
                aria-label={`Edit ${album.name}`}
                title="Edit album"
                onClick={() => handleOpenEditModal(album)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
              </button>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                aria-label={`Delete ${album.name}`}
                title="Delete album"
                onClick={() => handleDelete(album.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <div className={styles.headerBadge}>Admin</div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Albums</h1>
              {albums.length > 0 && (
                <span className={styles.countBadge}>
                  {albums.length} {albums.length === 1 ? "album" : "albums"}
                </span>
              )}
            </div>
            <p className={styles.subtitle}>
              Manage the album catalogue available on TuneIn.
            </p>
          </div>
          <button
            type="button"
            className={styles.addBtn}
            onClick={handleOpenCreateModal}
            disabled={loading}
          >
            <span className={styles.addBtnPlus} aria-hidden="true">+</span>
            Add Album
          </button>
        </div>
      </header>

      <div className={styles.container}>
        {renderContent()}
      </div>

      <AlbumModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        album={selectedAlbum}
        submitting={submitting}
        serverError={submitError}
      />
    </main>
  );
}