import React, { useRef, useState, useEffect } from "react";
import styles from "./SongModals.module.css";
import { fetchArtists } from "../../services/artistService";
import { fetchAlbums } from "../../services/albumService";

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

export function SongUploadModal({ isOpen, onClose, onUpload, submitting = false, uploadProgress = 0, serverError = null }) {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadOptions();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setSongs([]);
    }
  }, [isOpen]);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      const [artistsData, albumsData] = await Promise.all([
        fetchArtists(),
        fetchAlbums(),
      ]);
      setArtists(artistsData);
      setAlbums(albumsData);
    } catch (err) {
      console.error("Failed to load select options", err);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!submitting) setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (submitting) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const audioFiles = files.filter(f => f.type.startsWith('audio/'));
    if (audioFiles.length === 0) return;

    const newSongs = audioFiles.map(f => {
      // Basic extraction of name from filename (remove extension)
      const name = f.name.replace(/\.[^/.]+$/, "");
      return {
        id: Math.random().toString(36).substring(7),
        file: f,
        name: name,
        albumId: "",
        genre: "",
        duration: "", // In a real app, you might parse ID3 tags or use an Audio object to get duration
        artistIds: [],
        errors: {}
      };
    });

    setSongs(prev => [...prev, ...newSongs]);
  };

  const handleRemoveSong = (id) => {
    setSongs(prev => prev.filter(s => s.id !== id));
  };

  const handleSongChange = (id, field, value) => {
    setSongs(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value, errors: { ...s.errors, [field]: "" } };
      }
      return s;
    }));
  };

  const handleMultiSelectChange = (id, e) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    handleSongChange(id, "artistIds", values);
  };

  const validate = () => {
    let isValid = true;
    const validatedSongs = songs.map(song => {
      const errors = {};
      if (!song.name.trim()) errors.name = "Name is required.";
      if (!song.albumId) errors.albumId = "Album is required.";
      if (song.artistIds.length === 0) errors.artistIds = "Select at least one artist.";
      
      if (Object.keys(errors).length > 0) isValid = false;
      return { ...song, errors };
    });

    setSongs(validatedSongs);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (songs.length === 0 || submitting) return;
    if (validate()) {
      onUpload(songs);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`} onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}>
      <div className={`${styles.modal} ${isOpen ? styles.modalVisible : ""}`} role="dialog" aria-modal="true" aria-label="Upload Songs">
        <header className={styles.header}>
          <h2 className={styles.title}>Bulk Upload Songs</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} disabled={submitting}>
            <CloseIcon />
          </button>
        </header>

        {serverError && <div className={styles.serverError}>{serverError}</div>}

        <div className={styles.body}>
          {!submitting && (
            <div 
              className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ""}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.dropzoneIcon}>🎵</div>
              <p className={styles.dropzoneText}>Drag & drop audio files here, or click to browse</p>
              <p className={styles.dropzoneHint}>Supports MP3, WAV, AAC</p>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept="audio/*" 
                className={styles.fileInput} 
                onChange={handleFileSelect}
                disabled={submitting}
              />
            </div>
          )}

          {songs.length > 0 && (
            <div className={styles.songList}>
              {songs.map((song, index) => (
                <div key={song.id} className={styles.songItem}>
                  <div className={styles.songItemHeader}>
                    <h3 className={styles.songFilename}>#{index + 1} — {song.file.name}</h3>
                    {!submitting && (
                      <button type="button" className={styles.removeSongBtn} onClick={() => handleRemoveSong(song.id)}>Remove</button>
                    )}
                  </div>

                  <div className={styles.songFields}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Song Name <span className={styles.required}>*</span></label>
                      <input 
                        type="text" 
                        className={`${styles.input} ${song.errors.name ? styles.inputError : ""}`}
                        value={song.name} 
                        onChange={(e) => handleSongChange(song.id, "name", e.target.value)}
                        disabled={submitting}
                      />
                      {song.errors.name && <span className={styles.errorMsg}>{song.errors.name}</span>}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Album <span className={styles.required}>*</span></label>
                      <select 
                        className={`${styles.select} ${song.errors.albumId ? styles.inputError : ""}`}
                        value={song.albumId} 
                        onChange={(e) => handleSongChange(song.id, "albumId", e.target.value)}
                        disabled={submitting || loadingOptions}
                      >
                        <option value="">Select Album</option>
                        {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      {song.errors.albumId && <span className={styles.errorMsg}>{song.errors.albumId}</span>}
                    </div>

                    <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                      <label className={styles.label}>Artists (Multi-select) <span className={styles.required}>*</span></label>
                      <select 
                        multiple
                        className={`${styles.select} ${song.errors.artistIds ? styles.inputError : ""}`}
                        value={song.artistIds} 
                        onChange={(e) => handleMultiSelectChange(song.id, e)}
                        disabled={submitting || loadingOptions}
                      >
                        {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      {song.errors.artistIds && <span className={styles.errorMsg}>{song.errors.artistIds}</span>}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Genre</label>
                      <input 
                        type="text" 
                        className={styles.input}
                        value={song.genre} 
                        onChange={(e) => handleSongChange(song.id, "genre", e.target.value)}
                        disabled={submitting}
                        placeholder="e.g. Pop, Rock"
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Duration (sec)</label>
                      <input 
                        type="number" 
                        className={styles.input}
                        value={song.duration} 
                        onChange={(e) => handleSongChange(song.id, "duration", e.target.value)}
                        disabled={submitting}
                        placeholder="e.g. 210"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {submitting && (
            <div className={styles.uploadProgress}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className={styles.progressText}>Uploading... {uploadProgress}%</p>
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>Cancel</button>
          <button 
            type="button" 
            className={styles.submitBtn} 
            onClick={handleSubmit} 
            disabled={submitting || songs.length === 0}
          >
            {submitting ? "Uploading..." : `Upload ${songs.length} Song${songs.length !== 1 ? 's' : ''}`}
          </button>
        </footer>
      </div>
    </div>
  );
}