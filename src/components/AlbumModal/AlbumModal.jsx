import React, { useEffect, useRef, useState } from "react";
import styles from "./AlbumModal.module.css";
import { fetchArtists } from "../../services/artistService";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_MB = 2;

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
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (album) {
        setFormData({
          name: album.name || "",
          releasedDate: album.releasedDate ? album.releasedDate.split("T")[0] : "",
          description: album.description || "",
          musicDirectorId: album.musicDirectorId || "",
        });
        setAvatarPreview(album.avatarUrl || album.image_url || album.cover_url || null);
      } else {
        setFormData({
          name: "",
          releasedDate: "",
          description: "",
          musicDirectorId: "",
        });
        setAvatarPreview(null);
      }
      setAvatarFile(null);
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

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, avatar: "Only JPG, PNG, or WEBP images are accepted." }));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: `Image must be ${MAX_IMAGE_SIZE_MB} MB or smaller.` }));
      return;
    }
    setErrors((prev) => ({ ...prev, avatar: "" }));
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleRemoveAvatar() {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

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
    onSubmit({ ...formData, avatarFile: avatarFile || null });
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
              {/* ── Album cover uploader ── */}
              <div className={styles.avatarSection}>
                <div className={styles.avatarPreviewWrap}>
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Album cover preview"
                      className={styles.avatarPreviewImg}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder} aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                    </div>
                  )}
                  <button
                    type="button"
                    className={styles.avatarOverlayBtn}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                    aria-label="Upload album cover"
                    title="Upload cover"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </button>
                </div>
                <div className={styles.avatarMeta}>
                  <span className={styles.avatarLabel}>Album Cover</span>
                  <span className={styles.avatarHint}>JPG, PNG or WEBP · max {MAX_IMAGE_SIZE_MB} MB</span>
                  <div className={styles.avatarBtns}>
                    <button
                      type="button"
                      className={styles.avatarPickBtn}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={submitting}
                    >
                      {avatarPreview ? "Change Cover" : "Upload Cover"}
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        className={styles.avatarRemoveBtn}
                        onClick={handleRemoveAvatar}
                        disabled={submitting}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {errors.avatar && (
                    <p className={styles.errorMsg} role="alert">{errors.avatar}</p>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  className={styles.hiddenFileInput}
                  onChange={handleAvatarChange}
                  disabled={submitting}
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>

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