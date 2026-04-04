import React, { useEffect, useState } from "react";
import styles from "./AlbumModal.module.css";
import { fetchArtists } from "../../services/artistService";

export function AlbumModal({ isOpen, onClose, onSubmit, album, submitting, serverError }) {
  const [formData, setFormData] = useState({
    name: "",
    releasedDate: "",
    description: "",
    musicDirectorId: "",
  });
  const [errors, setErrors] = useState({});
  const [artists, setArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (album) {
        setFormData({
          name: album.name || "",
          releasedDate: album.releasedDate ? album.releasedDate.split("T")[0] : "",
          description: album.description || "",
          musicDirectorId: album.musicDirectorId || "",
        });
      } else {
        setFormData({
          name: "",
          releasedDate: "",
          description: "",
          musicDirectorId: "",
        });
      }
      setErrors({});
      loadArtists();
    }
  }, [isOpen, album]);

  const loadArtists = async () => {
    try {
      setLoadingArtists(true);
      const data = await fetchArtists();
      setArtists(data);
    } catch (error) {
      console.error("Failed to load artists", error);
    } finally {
      setLoadingArtists(false);
    }
  };

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.releasedDate) newErrors.releasedDate = "Released date is required.";
    if (!formData.musicDirectorId) newErrors.musicDirectorId = "Music director is required.";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !submitting) {
      onClose();
    }
  };

  const CloseIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      >
        <div
          className={`${styles.modal} ${isOpen ? styles.modalVisible : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label={album ? "Edit Album" : "Add Album"}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>{album ? "Edit Album" : "Add Album"}</h2>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              disabled={submitting}
              aria-label="Close modal"
            >
              <CloseIcon />
            </button>
          </div>

          {serverError && (
            <div className={styles.serverError} role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fields}>
              <div className={styles.fieldGroup}>
                <label htmlFor="name" className={styles.label}>
                  Album Name <span className={styles.required} aria-hidden="true">*</span>
                </label>
                <input
                  id="name"
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={submitting}
                  placeholder="e.g. Abbey Road"
                />
                {errors.name && <p className={styles.errorMsg}>{errors.name}</p>}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="releasedDate" className={styles.label}>
                  Released Date <span className={styles.required} aria-hidden="true">*</span>
                </label>
                <input
                  id="releasedDate"
                  className={`${styles.input} ${errors.releasedDate ? styles.inputError : ""}`}
                  type="date"
                  value={formData.releasedDate}
                  onChange={(e) => setFormData({ ...formData, releasedDate: e.target.value })}
                  disabled={submitting}
                />
                {errors.releasedDate && <p className={styles.errorMsg}>{errors.releasedDate}</p>}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="musicDirectorId" className={styles.label}>
                  Music Director <span className={styles.required} aria-hidden="true">*</span>
                </label>
                <select
                  id="musicDirectorId"
                  className={`${styles.select} ${errors.musicDirectorId ? styles.inputError : ""}`}
                  value={formData.musicDirectorId}
                  onChange={(e) => setFormData({ ...formData, musicDirectorId: e.target.value })}
                  disabled={submitting || loadingArtists}
                >
                  <option value="">Select a music director</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
                {errors.musicDirectorId && (
                  <p className={styles.errorMsg}>{errors.musicDirectorId}</p>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="description" className={styles.label}>
                  Description <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  id="description"
                  className={styles.textarea}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={submitting}
                  placeholder="Tell us about the album..."
                  rows={4}
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? "Saving…" : album ? "Save Changes" : "Create Album"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}