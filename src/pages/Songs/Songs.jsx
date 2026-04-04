import React, { useEffect, useState } from "react";
import styles from "./Songs.module.css";
import { fetchSongs, uploadSongs, updateSong, deleteSong } from "../../services/songService";
import { SongUploadModal } from "../../components/SongModals/SongUploadModal";
import { SongEditModal } from "../../components/SongModals/SongEditModal";

export function Songs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const data = await fetchSongs();
      setSongs(data);
    } catch (err) {
      setFetchError(err.response?.data?.message || err.message || "Failed to load songs");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUploadModal = () => {
    setSubmitError(null);
    setUploadProgress(0);
    setUploadModalOpen(true);
  };

  const handleOpenEditModal = (song) => {
    setSelectedSong(song);
    setSubmitError(null);
    setEditModalOpen(true);
  };

  const handleUploadSongs = async (songPayloads) => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      const newSongs = await uploadSongs(songPayloads, (progress) => {
        setUploadProgress(progress);
      });
      
      setSongs((prev) => [...prev, ...newSongs]);
      setUploadModalOpen(false);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || "An error occurred while uploading songs.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSong = async (formData) => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      const updated = await updateSong(selectedSong.id, formData);
      setSongs((prev) => prev.map((s) => (s.id === selectedSong.id ? updated : s)));
      setEditModalOpen(false);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || "An error occurred while saving the song.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this song?")) return;
    
    try {
      await deleteSong(id);
      setSongs((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete song");
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingState} role="status" aria-live="polite">
          <p>Loading songs…</p>
        </div>
      );
    }

    if (fetchError) {
      return (
        <div className={styles.errorState} role="alert">
          <p className={styles.errorMsg}>{fetchError}</p>
          <button type="button" className={styles.addBtn} onClick={loadSongs}>
            Retry
          </button>
        </div>
      );
    }

    if (songs.length === 0) {
      return (
        <div className={styles.emptyState} role="status">
          <div className={styles.emptyIcon}>🎵</div>
          <h2 className={styles.emptyTitle}>No songs yet</h2>
          <p className={styles.emptyDesc}>
            Upload your first tracks to start building the TuneIn library.
          </p>
          <button type="button" className={styles.addBtn} onClick={handleOpenUploadModal}>
            <span className={styles.addBtnPlus} aria-hidden="true">+</span>
            Bulk Upload
          </button>
        </div>
      );
    }

    return (
      <div className={styles.list} role="list">
        {songs.map((song) => (
          <article key={song.id} className={styles.card} role="listitem">
            <div className={styles.playIcon} aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
            
            <div className={styles.cardContent}>
              <h3 className={styles.songName}>{song.name}</h3>
              <p className={styles.artists}>
                {song.artists && song.artists.length > 0 
                  ? song.artists.map(a => a.name).join(", ") 
                  : "Unknown Artist"}
              </p>
            </div>
            
            <div className={styles.albumInfo}>
              {song.album?.name || "Unknown Album"}
            </div>
            
            <div className={styles.duration}>
              {formatDuration(song.duration)}
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.editBtn}`}
                aria-label={`Edit ${song.name}`}
                title="Edit song metadata"
                onClick={() => handleOpenEditModal(song)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
              </button>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                aria-label={`Delete ${song.name}`}
                title="Delete song"
                onClick={() => handleDelete(song.id)}
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
              <h1 className={styles.title}>Songs</h1>
              {songs.length > 0 && (
                <span className={styles.countBadge}>
                  {songs.length} {songs.length === 1 ? "track" : "tracks"}
                </span>
              )}
            </div>
            <p className={styles.subtitle}>
              Manage the song library, including bulk audio uploads.
            </p>
          </div>
          <button
            type="button"
            className={styles.addBtn}
            onClick={handleOpenUploadModal}
            disabled={loading}
          >
            <span className={styles.addBtnPlus} aria-hidden="true">+</span>
            Bulk Upload
          </button>
        </div>
      </header>

      <div className={styles.container}>
        {renderContent()}
      </div>

      <SongUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadSongs}
        submitting={submitting}
        uploadProgress={uploadProgress}
        serverError={submitError}
      />

      <SongEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onEdit={handleEditSong}
        song={selectedSong}
        submitting={submitting}
        serverError={submitError}
      />
    </main>
  );
}