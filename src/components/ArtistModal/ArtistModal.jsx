import React, { useEffect, useRef, useState } from "react";
import styles from "./ArtistModal.module.css";

const BIO_MAX = 500;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_MB = 2;

const EMPTY_FORM = { name: "", email: "", dob: "", bio: "" };
const EMPTY_ERRORS = { name: "", email: "", bio: "", avatar: "" };

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

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

export function ArtistModal({ open, onClose, onSubmit, artist, submitting = false, serverError = null }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const firstFieldRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => firstFieldRef.current?.focus(), 60);
      return () => clearTimeout(t);
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        if (!submitting) handleClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      if (artist) {
        setForm({
          name: artist.name || "",
          email: artist.email || "",
          bio: artist.bio || "",
        });
        setAvatarPreview(artist.avatarUrl || artist.image_url || null);
      } else {
        setForm(EMPTY_FORM);
        setAvatarPreview(null);
      }
      setAvatarFile(null);
      setErrors(EMPTY_ERRORS);
    }
  }, [open, artist]);

  function handleClose() {
    if (submitting) return;
    setForm(EMPTY_FORM);
    setErrors(EMPTY_ERRORS);
    setAvatarFile(null);
    setAvatarPreview(null);
    onClose();
  }

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

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validate() {
    const next = { name: "", email: "", bio: "", avatar: "" };
    let valid = true;

    if (!form.name.trim()) {
      next.name = "Name is required.";
      valid = false;
    }

    if (!form.email.trim()) {
      next.email = "Email is required.";
      valid = false;
    } else if (!validateEmail(form.email)) {
      next.email = "Please enter a valid email address.";
      valid = false;
    }

    if (form.bio.length > BIO_MAX) {
      next.bio = `Bio must be ${BIO_MAX} characters or fewer.`;
      valid = false;
    }

    setErrors(next);
    return valid;
  }

  function handleSubmitForm(e) {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      bio: form.bio.trim() || null,
      avatarFile: avatarFile || null,
    });
  }

  const bioRemaining = BIO_MAX - form.bio.length;
  const bioOverLimit = form.bio.length > BIO_MAX;

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayVisible : ""}`}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
        aria-hidden="true"
      >
        <div
          ref={modalRef}
          className={`${styles.modal} ${open ? styles.modalVisible : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label={artist ? "Edit Artist" : "Add New Artist"}
        >
          <div className={styles.header}>
            <h2 className={styles.title} id="drawer-title">
              {artist ? "Edit Artist" : "Add New Artist"}
            </h2>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={handleClose}
              aria-label="Close modal"
              disabled={submitting}
            >
              <CloseIcon />
            </button>
          </div>

          {serverError && (
            <div className={styles.serverError} role="alert">
              {serverError}
            </div>
          )}

          <form
            className={styles.form}
            onSubmit={handleSubmitForm}
            noValidate
            aria-labelledby="drawer-title"
          >
            <div className={styles.fields}>
              {/* ── Avatar uploader ── */}
              <div className={styles.avatarSection}>
                <div className={styles.avatarPreviewWrap}>
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Artist avatar preview"
                      className={styles.avatarPreviewImg}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder} aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  )}
                  <button
                    type="button"
                    className={styles.avatarOverlayBtn}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                    aria-label="Upload artist photo"
                    title="Upload photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </button>
                </div>
                <div className={styles.avatarMeta}>
                  <span className={styles.avatarLabel}>Artist Photo</span>
                  <span className={styles.avatarHint}>JPG, PNG or WEBP · max {MAX_IMAGE_SIZE_MB} MB</span>
                  <div className={styles.avatarBtns}>
                    <button
                      type="button"
                      className={styles.avatarPickBtn}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={submitting}
                    >
                      {avatarPreview ? "Change Photo" : "Upload Photo"}
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
                <label htmlFor="artist-name" className={styles.label}>
                  Name <span className={styles.required} aria-hidden="true">*</span>
                </label>
                <input
                  ref={firstFieldRef}
                  id="artist-name"
                  name="name"
                  type="text"
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  placeholder="e.g. Taylor Swift"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="off"
                  aria-required="true"
                  aria-describedby={errors.name ? "name-error" : undefined}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p id="name-error" className={styles.errorMsg} role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="artist-email" className={styles.label}>
                  Email <span className={styles.required} aria-hidden="true">*</span>
                </label>
                <input
                  id="artist-email"
                  name="email"
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  placeholder="e.g. artist@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="off"
                  aria-required="true"
                  aria-describedby={errors.email ? "email-error" : undefined}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p id="email-error" className={styles.errorMsg} role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="artist-bio" className={styles.label}>
                  Bio <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  id="artist-bio"
                  name="bio"
                  className={`${styles.textarea} ${errors.bio || bioOverLimit ? styles.inputError : ""}`}
                  placeholder="Short biography of the artist…"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  aria-describedby="bio-counter bio-error"
                  aria-invalid={!!(errors.bio || bioOverLimit)}
                />
                <div className={styles.bioFooter}>
                  {(errors.bio || bioOverLimit) && (
                    <p id="bio-error" className={styles.errorMsg} role="alert">
                      {errors.bio || `Bio must be ${BIO_MAX} characters or fewer.`}
                    </p>
                  )}
                  <span
                    id="bio-counter"
                    className={`${styles.charCounter} ${bioOverLimit ? styles.charCounterOver : ""}`}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {bioRemaining < 0
                      ? `${Math.abs(bioRemaining)} over limit`
                      : `${bioRemaining} remaining`}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleClose}
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
                {submitting ? "Saving…" : artist ? "Save Changes" : "Add Artist"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}