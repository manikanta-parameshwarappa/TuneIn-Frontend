import React, { useEffect, useRef, useState } from "react";
import styles from "./AddArtistDrawer.module.css";

const BIO_MAX = 500;

const EMPTY_FORM = { name: "", email: "", dob: "", bio: "" };
const EMPTY_ERRORS = { name: "", email: "", bio: "" };

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

/**
 * AddArtistDrawer
 *
 * Props:
 *   open    {boolean}  — whether the drawer is visible
 *   onClose {Function} — called when the drawer should be closed
 *   onAdd   {Function} — called with the new artist object on successful submit
 */
export function AddArtistDrawer({ open, onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const firstFieldRef = useRef(null);
  const drawerRef = useRef(null);

  /* ── Prevent body scroll while open ────────────────── */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // Focus first input after transition begins
      const t = setTimeout(() => firstFieldRef.current?.focus(), 60);
      return () => clearTimeout(t);
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  /* ── Trap focus inside drawer ───────────────────────── */
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        handleClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = drawerRef.current?.querySelectorAll(
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
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Reset form whenever drawer opens ──────────────── */
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setErrors(EMPTY_ERRORS);
    }
  }, [open]);

  function handleClose() {
    setForm(EMPTY_FORM);
    setErrors(EMPTY_ERRORS);
    onClose();
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validate() {
    const next = { name: "", email: "", bio: "" };
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

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onAdd({
      name: form.name.trim(),
      email: form.email.trim(),
      dob: form.dob || null,
      bio: form.bio.trim() || null,
    });
    handleClose();
  }

  const bioRemaining = BIO_MAX - form.bio.length;
  const bioOverLimit = form.bio.length > BIO_MAX;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropVisible : ""}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Add New Artist"
      >
        {/* Drawer header */}
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle} id="drawer-title">
            Add New Artist
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close drawer"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form
          className={styles.form}
          onSubmit={handleSubmit}
          noValidate
          aria-labelledby="drawer-title"
        >
          <div className={styles.fields}>
            {/* Name */}
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

            {/* Email */}
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

            {/* Date of Birth */}
            <div className={styles.fieldGroup}>
              <label htmlFor="artist-dob" className={styles.label}>
                Date of Birth{" "}
                <span className={styles.optional}>(optional)</span>
              </label>
              <input
                id="artist-dob"
                name="dob"
                type="date"
                className={styles.input}
                value={form.dob}
                onChange={handleChange}
              />
            </div>

            {/* Bio */}
            <div className={styles.fieldGroup}>
              <label htmlFor="artist-bio" className={styles.label}>
                Bio{" "}
                <span className={styles.optional}>(optional)</span>
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
                  className={`${styles.charCounter} ${
                    bioOverLimit ? styles.charCounterOver : ""
                  }`}
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

          {/* Form actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleClose}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Add Artist
            </button>
          </div>
        </form>
      </div>
    </>
  );
}