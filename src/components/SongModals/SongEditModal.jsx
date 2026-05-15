import React, { useState, useEffect, useRef } from "react";
import styles from "./SongModals.module.css";
import { fetchArtists } from "../../services/artistService";
import { fetchAlbums } from "../../services/albumService";

/* ── helpers ──────────────────────────────────────────────── */
// Normalise any id to a number for consistent comparison
const toNum = (v) => Number(v);

/* ── icons ─────────────────────────────────────────────────── */
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/* ── ArtistMultiSelect (same as in SongUploadModal) ─────────── */
const ArtistMultiSelect = ({ options, value, onChange, error, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (id) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const selectedNames = options
    .filter((opt) => value.includes(opt.id))
    .map((opt) => opt.name)
    .join(", ");

  return (
    <div className={styles.multiSelectContainer} ref={dropdownRef}>
      <div
        className={`${styles.multiSelectHeader} ${error ? styles.inputError : ""} ${disabled ? styles.disabled : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className={styles.multiSelectValues}>
          {value.length > 0 ? (
            <span className={styles.multiSelectText}>{selectedNames}</span>
          ) : (
            <span className={styles.multiSelectPlaceholder}>Select artists...</span>
          )}
        </div>
        <div className={styles.multiSelectIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className={styles.multiSelectDropdown}>
          <div className={styles.multiSelectSearch}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Search artists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
          </div>
          <div className={styles.multiSelectOptions}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <label key={opt.id} className={styles.multiSelectOption}>
                  <div className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      checked={value.includes(opt.id)}
                      onChange={() => handleToggle(opt.id)}
                      className={styles.multiSelectCheckbox}
                    />
                    <div className={styles.customCheckbox} />
                  </div>
                  <span className={styles.optionName}>{opt.name}</span>
                </label>
              ))
            ) : (
              <div className={styles.multiSelectNoResult}>No artists found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── SongEditModal ──────────────────────────────────────────── */
export function SongEditModal({
  isOpen,
  onClose,
  onEdit,
  song,
  submitting = false,
  serverError = null,
}) {
  const [formData, setFormData] = useState({
    name: "",
    albumId: "",
    genre: "",
    duration: "",
    artistIds: [],   // stored as numbers
    audioFile: null, // File | null — only set when user picks a replacement
  });
  const [errors, setErrors] = useState({});
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null); // existing audio URL
  const audioFileRef = useRef(null);

  /* Lock body scroll when open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      loadOptions();
      if (song) {
        setFormData({
          name: song.name || "",
          albumId: song.albumId ? String(song.albumId) : "",
          genre: song.genre || "",
          duration: song.duration || "",
          // Store as numbers so ArtistMultiSelect value.includes(opt.id) works
          artistIds: song.artistIds ? song.artistIds.map(toNum) : [],
          audioFile: null,
        });
        setAudioPreviewUrl(song.audioUrl || null);
      }
      setErrors({});
    } else {
      document.body.style.overflow = "";
      // Revoke any object URL we created
      if (audioPreviewUrl && audioPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
      setAudioPreviewUrl(null);
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
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    // Revoke previous blob URL if any
    if (audioPreviewUrl && audioPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioPreviewUrl);
    }
    setFormData((prev) => ({ ...prev, audioFile: file }));
    setAudioPreviewUrl(URL.createObjectURL(file));
    if (errors.audioFile) setErrors((prev) => ({ ...prev, audioFile: "" }));
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

  const handleSubmit = () => {
    if (submitting) return;
    if (validate()) {
      onEdit({
        name:      formData.name,
        albumId:   formData.albumId,
        genre:     formData.genre,
        duration:  formData.duration,
        artistIds: formData.artistIds,
        audioFile: formData.audioFile || undefined,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
      onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
    >
      <div
        className={`${styles.modal} ${styles.modalSmall} ${isOpen ? styles.modalVisible : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Edit Song"
      >
        {/* Header */}
        <header className={styles.header}>
          <h2 className={styles.title}>Edit Song</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={submitting}
          >
            <CloseIcon />
          </button>
        </header>

        {serverError && (
          <div className={styles.serverError}>{serverError}</div>
        )}

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.songFields}>
            {/* Song Name */}
            <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
              <label className={styles.label}>
                Song Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={submitting}
                placeholder="Enter song name"
              />
              {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
            </div>

            {/* Album */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Album <span className={styles.required}>*</span>
              </label>
              <select
                className={`${styles.select} ${errors.albumId ? styles.inputError : ""}`}
                value={formData.albumId}
                onChange={(e) => handleChange("albumId", e.target.value)}
                disabled={submitting || loadingOptions}
              >
                <option value="">
                  {loadingOptions ? "Loading..." : "Select Album"}
                </option>
                {albums.map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {a.name}
                  </option>
                ))}
              </select>
              {errors.albumId && <span className={styles.errorMsg}>{errors.albumId}</span>}
            </div>

            {/* Genre */}
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

            {/* Duration */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Duration (sec)</label>
              <input
                type="number"
                className={styles.input}
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                disabled={submitting}
                placeholder="e.g. 210"
                min="0"
              />
            </div>

            {/* Artists */}
            <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
              <label className={styles.label}>
                Artists <span className={styles.required}>*</span>
              </label>
              <ArtistMultiSelect
                options={artists}
                value={formData.artistIds}
                onChange={(vals) => handleChange("artistIds", vals.map(toNum))}
                error={errors.artistIds}
                disabled={submitting || loadingOptions}
              />
              {errors.artistIds && (
                <span className={styles.errorMsg}>{errors.artistIds}</span>
              )}
            </div>

            {/* Audio file replacement */}
            <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
              <label className={styles.label}>Replace Audio File</label>
              {/* Show existing audio player if we have a URL */}
              {audioPreviewUrl && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <audio
                    src={audioPreviewUrl}
                    controls
                    style={{ width: "100%", height: "36px", borderRadius: "8px", accentColor: "#3b82f6" }}
                  />
                  {formData.audioFile && (
                    <span style={{ fontSize: "0.78rem", color: "#6ee7b7", marginTop: "0.25rem", display: "block" }}>
                      ✓ New file selected: {formData.audioFile.name}
                    </span>
                  )}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <input
                  ref={audioFileRef}
                  type="file"
                  accept="audio/*"
                  style={{ display: "none" }}
                  onChange={handleAudioFileChange}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => audioFileRef.current?.click()}
                  disabled={submitting}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.5rem 1rem", borderRadius: "8px",
                    background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.35)",
                    color: "#93c5fd", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  {audioPreviewUrl ? "Replace Audio" : "Upload Audio"}
                </button>
                {formData.audioFile && (
                  <button
                    type="button"
                    onClick={() => {
                      if (audioPreviewUrl && audioPreviewUrl.startsWith("blob:")) URL.revokeObjectURL(audioPreviewUrl);
                      setFormData((prev) => ({ ...prev, audioFile: null }));
                      setAudioPreviewUrl(song?.audioUrl || null);
                      if (audioFileRef.current) audioFileRef.current.value = "";
                    }}
                    disabled={submitting}
                    style={{
                      background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                      color: "#fca5a5", fontSize: "0.8rem", fontWeight: 600,
                      padding: "0.4rem 0.75rem", borderRadius: "8px", cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
              {errors.audioFile && <span className={styles.errorMsg}>{errors.audioFile}</span>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={submitting || loadingOptions}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </footer>
      </div>
    </div>
  );
}