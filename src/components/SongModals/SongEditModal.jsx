import React, { useState, useEffect } from "react";
import styles from "./SongModals.module.css";
import { fetchArtists } from "../../services/artistService";
import { fetchAlbums } from "../../services/albumService";

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

export function SongEditModal({ isOpen, onClose, onEdit, song, submitting = false, serverError = null }) {
  const [formData, setFormData] = useState({
    name: "",
    albumId: "",
    genre: "",
    duration: "",
    artistIds: [],
  });
  const [errors, setErrors] = useState({});
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOptions();
      document.body.style.overflow = "hidden";
      if (song) {
        setFormData({
          name: song.name || "",
          albumId: song.albumId || "",
          genre: song.genre || "",
          duration: song.duration || "",
          artistIds: song.artistIds || [],
        });
      }
      setErrors({});
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, song]);

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

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleMultiSelectChange = (e) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    handleChange("artistIds", values);
  };

  const validate = () => {
    const next = {};
    let valid = true;

    if (!formData.name.trim()) { next.name = "Name is required."; valid = false; }
    if (!formData.albumId) { next.albumId = "Album is required."; valid = false; }
    if (formData.artistIds.length === 0) { next.artistIds = "Select at least one artist."; valid = false; }

    setErrors(next);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;
    if (validate()) {
      onEdit({ ...formData });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`} onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}>
      <div className={`${styles.modal} ${styles.modalSmall} ${isOpen ? styles.modalVisible : ""}`} role="dialog" aria-modal="true" aria-label="Edit Song">
        <header className={styles.header}>
          <h2 className={styles.title}>Edit Song</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} disabled={submitting}>
            <CloseIcon />
          </button>
        </header>

        {serverError && <div className={styles.serverError}>{serverError}</div>}

        <div className={styles.body}>
          <div className={styles.songFields}>
            <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
              <label className={styles.label}>Song Name <span className={styles.required}>*</span></label>
              <input 
                type="text" 
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                value={formData.name} 
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={submitting}
              />
              {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Album <span className={styles.required}>*</span></label>
              <select 
                className={`${styles.select} ${errors.albumId ? styles.inputError : ""}`}
                value={formData.albumId} 
                onChange={(e) => handleChange("albumId", e.target.value)}
                disabled={submitting || loadingOptions}
              >
                <option value="">Select Album</option>
                {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              {errors.albumId && <span className={styles.errorMsg}>{errors.albumId}</span>}
            </div>

            <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
              <label className={styles.label}>Artists (Multi-select) <span className={styles.required}>*</span></label>
              <select 
                multiple
                className={`${styles.select} ${errors.artistIds ? styles.inputError : ""}`}
                value={formData.artistIds} 
                onChange={handleMultiSelectChange}
                disabled={submitting || loadingOptions}
              >
                {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              {errors.artistIds && <span className={styles.errorMsg}>{errors.artistIds}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Genre</label>
              <input 
                type="text" 
                className={styles.input}
                value={formData.genre} 
                onChange={(e) => handleChange("genre", e.target.value)}
                disabled={submitting}
                placeholder="e.g. Pop, Rock"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Duration (sec)</label>
              <input 
                type="number" 
                className={styles.input}
                value={formData.duration} 
                onChange={(e) => handleChange("duration", e.target.value)}
                disabled={submitting}
                placeholder="e.g. 210"
              />
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </footer>
      </div>
    </div>
  );
}