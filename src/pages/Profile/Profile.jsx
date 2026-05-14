import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
} from "react";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import styles from "./Profile.module.css";

/* ─────────────────────────────────────────────────────────
   Utility helpers
───────────────────────────────────────────────────────── */

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Returns { score: 0-4, label, color } */
function measurePasswordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  score = Math.min(score, 4);
  const map = [
    { label: "Too short", color: "#e05c5c" },
    { label: "Weak",      color: "#e05c5c" },
    { label: "Fair",      color: "#f59e0b" },
    { label: "Strong",    color: "#22c55e" },
    { label: "Very Strong", color: "#3b82f6" },
  ];
  return { score, ...map[score] };
}

/**
 * Extract a human-readable error message from an axios error.
 * Backend error shapes:
 *   { error: "..." }          — single error string
 *   { errors: ["...", ...] }  — array of full_messages
 */
function extractErrorMessage(err, fallback = "Something went wrong.") {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data.error === "string") return data.error;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.join(" ");
  }
  if (typeof data.message === "string") return data.message;
  return fallback;
}

/* ─────────────────────────────────────────────────────────
   Sub-component: Toast
───────────────────────────────────────────────────────── */
function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;
  return (
    <div className={`${styles.toast} ${styles[`toast_${type}`]}`} role="alert">
      <span>{message}</span>
      <button className={styles.toastClose} onClick={onDismiss} aria-label="Dismiss">×</button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Sub-component: EyeIcon toggle
───────────────────────────────────────────────────────── */
function EyeToggle({ visible, onToggle, label }) {
  return (
    <button
      type="button"
      className={styles.eyeToggle}
      onClick={onToggle}
      aria-label={label}
      tabIndex={0}
    >
      {visible ? (
        /* eye-off */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        /* eye */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   Sub-component: SkeletonProfile (loading state)
───────────────────────────────────────────────────────── */
function SkeletonProfile() {
  return (
    <div className={styles.skeletonWrap}>
      <div className={styles.skeletonAvatar} />
      <div className={styles.skeletonCard}>
        <div className={`${styles.skeletonLine} ${styles.skeletonLineLg}`} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
        <div className={`${styles.skeletonLine} ${styles.skeletonLineSm}`} />
      </div>
      <div className={styles.skeletonCard}>
        <div className={`${styles.skeletonLine} ${styles.skeletonLineLg}`} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Profile page
───────────────────────────────────────────────────────── */
export function Profile() {
  const { user, setUser, initializing } = useAuth();

  // Local extended profile state (dob + avatarUrl not in auth token)
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  /* ── Avatar state ── */
  const [avatarPreview, setAvatarPreview]     = useState(null);
  const [avatarFile, setAvatarFile]           = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress]   = useState(0);
  const [isDragging, setIsDragging]           = useState(false);
  const avatarInputRef                        = useRef(null);

  /* ── Profile form state ── */
  const [profileForm, setProfileForm] = useState({ name: "", email: "", dob: "" });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSaving, setProfileSaving] = useState(false);

  /* ── Password form state ── */
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwVisible, setPwVisible] = useState({ current: false, next: false, confirm: false });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);

  /* ── Toast ── */
  const [toast, setToast] = useState({ message: "", type: "success" });
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);
  const dismissToast = useCallback(() => setToast({ message: "", type: "success" }), []);

  /* ── Fetch full profile on mount (GET /profile) ── */
  useEffect(() => {
    if (initializing) return; // wait for auth to resolve
    let cancelled = false;
    (async () => {
      setProfileLoading(true);
      try {
        const data = await userService.getProfile();
        if (!cancelled) {
          setProfile(data);
          setProfileForm({
            name:  data.name  || "",
            email: data.email || "",
            dob:   data.dob   || "",
          });
          if (data.avatarUrl) setAvatarPreview(data.avatarUrl);
        }
      } catch (err) {
        if (!cancelled) {
          showToast(extractErrorMessage(err, "Failed to load profile."), "error");
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [initializing, showToast]);

  /* ── IDs for accessible labels ── */
  const nameId    = useId();
  const emailId   = useId();
  const dobId     = useId();
  const curPwId   = useId();
  const newPwId   = useId();
  const confPwId  = useId();

  /* ══════════════════════════════════════════════════════
     Avatar helpers
  ══════════════════════════════════════════════════════ */
  const handleAvatarFile = useCallback((file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      showToast("Only JPG, PNG, and WEBP images are allowed.", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be smaller than 2 MB.", "error");
      return;
    }
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  }, [showToast]);

  const handleAvatarInputChange = (e) => handleAvatarFile(e.target.files?.[0]);

  /* Drag-and-drop handlers */
  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleAvatarFile(e.dataTransfer.files?.[0]);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    setAvatarProgress(0);
    try {
      // PATCH /profile  type=avatar
      const updatedUser = await userService.uploadAvatar(avatarFile, setAvatarProgress);
      setProfile(updatedUser);
      setUser((prev) => ({ ...prev, avatarUrl: updatedUser.avatarUrl }));
      setAvatarFile(null);
      // Keep the object URL as preview until the real URL arrives
      if (updatedUser.avatarUrl) setAvatarPreview(updatedUser.avatarUrl);
      showToast("Profile photo updated successfully.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Failed to upload photo. Please try again."), "error");
    } finally {
      setAvatarUploading(false);
      setAvatarProgress(0);
    }
  };

  const handleAvatarCancel = () => {
    setAvatarFile(null);
    // Restore to the last known server avatar (or null for initials)
    setAvatarPreview(profile?.avatarUrl || null);
  };

  /* ══════════════════════════════════════════════════════
     Profile form
  ══════════════════════════════════════════════════════ */
  const validateProfile = () => {
    const errs = {};
    if (!profileForm.name.trim())       errs.name  = "Full name is required.";
    if (!profileForm.email.trim())      errs.email = "Email is required.";
    else if (!isValidEmail(profileForm.email)) errs.email = "Enter a valid email address.";
    return errs;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((f) => ({ ...f, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors((errs) => { const next = { ...errs }; delete next[name]; return next; });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }

    /* Build diff — only send changed fields */
    const payload = {};
    if (profileForm.name  !== (profile?.name  || "")) payload.name  = profileForm.name;
    if (profileForm.email !== (profile?.email || "")) payload.email = profileForm.email;
    if (profileForm.dob   !== (profile?.dob   || "")) payload.dob   = profileForm.dob;

    if (!Object.keys(payload).length) {
      showToast("No changes to save.", "info");
      return;
    }

    setProfileSaving(true);
    try {
      // PATCH /profile  type=info
      const updatedUser = await userService.updateProfile(payload);
      setProfile(updatedUser);
      // Sync AuthContext user so Navbar etc. see the latest name/email
      setUser((prev) => ({
        ...prev,
        name:  updatedUser.name  ?? prev?.name,
        email: updatedUser.email ?? prev?.email,
      }));
      // Re-populate form with server-confirmed values
      setProfileForm({
        name:  updatedUser.name  || "",
        email: updatedUser.email || "",
        dob:   updatedUser.dob   || "",
      });
      showToast("Profile updated successfully.");
    } catch (err) {
      const msg = extractErrorMessage(err, "Failed to update profile.");
      showToast(msg, "error");
      // Surface email uniqueness conflict as an inline field error
      if (err.response?.status === 422) {
        const raw = err.response?.data;
        const errMsg = Array.isArray(raw?.errors) ? raw.errors.join(" ") : (raw?.error || "");
        if (errMsg.toLowerCase().includes("email")) {
          setProfileErrors({ email: errMsg || "This email is already in use." });
        }
      }
    } finally {
      setProfileSaving(false);
    }
  };

  /* ══════════════════════════════════════════════════════
     Password form
  ══════════════════════════════════════════════════════ */
  const pwStrength = measurePasswordStrength(pwForm.next);

  const validatePassword = () => {
    const errs = {};
    if (!pwForm.current) errs.current = "Current password is required.";
    if (!pwForm.next)    errs.next    = "New password is required.";
    else if (pwForm.next.length < 8) errs.next = "Password must be at least 8 characters.";
    if (!pwForm.confirm)             errs.confirm = "Please confirm your new password.";
    else if (pwForm.next !== pwForm.confirm) errs.confirm = "Passwords do not match.";
    return errs;
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((f) => ({ ...f, [name]: value }));
    if (pwErrors[name]) {
      setPwErrors((errs) => { const next = { ...errs }; delete next[name]; return next; });
    }
  };

  const togglePwVisible = (field) =>
    setPwVisible((v) => ({ ...v, [field]: !v[field] }));

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length) { setPwErrors(errs); return; }

    setPwSaving(true);
    try {
      // PATCH /profile  type=password
      // Backend params: current_password, new_password, password_confirmation
      await userService.updatePassword(pwForm.current, pwForm.next, pwForm.confirm);
      setPwForm({ current: "", next: "", confirm: "" });
      showToast("Password updated successfully.");
    } catch (err) {
      const msg = extractErrorMessage(err, "Failed to update password.");
      showToast(msg, "error");
      // Surface "Current password is incorrect" as inline field error
      if (err.response?.status === 422) {
        const raw = err.response?.data;
        const errStr = typeof raw?.error === "string" ? raw.error.toLowerCase() : "";
        if (errStr.includes("current password") || errStr.includes("incorrect")) {
          setPwErrors({ current: raw.error });
        }
      }
    } finally {
      setPwSaving(false);
    }
  };

  /* ══════════════════════════════════════════════════════
     Render
  ══════════════════════════════════════════════════════ */
  if (initializing || profileLoading) return <SkeletonProfile />;

  return (
    <main className={styles.page}>
      <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Profile Settings</h1>
        <p className={styles.pageSubtitle}>Manage your personal information and account security.</p>
      </div>

      <div className={styles.grid}>

        {/* ════════════ LEFT COLUMN — Avatar ════════════ */}
        <section className={styles.card} aria-label="Profile photo">
          <h2 className={styles.cardTitle}>Profile Photo</h2>

          {/* Avatar circle — drag-and-drop target */}
          <div
            className={`${styles.avatarZone} ${isDragging ? styles.avatarZoneDragging : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <button
              type="button"
              className={styles.avatarCircleBtn}
              onClick={() => avatarInputRef.current?.click()}
              aria-label="Change profile photo"
              disabled={avatarUploading}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarInitials}>{getInitials(profile?.name || user?.name)}</span>
              )}
              <span className={styles.avatarOverlay} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className={styles.overlayLabel}>Change Photo</span>
              </span>
            </button>

            {/* Upload progress ring */}
            {avatarUploading && (
              <div className={styles.uploadProgress} role="status" aria-label={`Uploading ${avatarProgress}%`}>
                <div className={styles.uploadSpinner} />
                <span className={styles.uploadPct}>{avatarProgress}%</span>
              </div>
            )}
          </div>

          <p className={styles.avatarHint}>Drag & drop or click to change. JPG, PNG, WEBP · max 2 MB</p>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.hiddenInput}
            onChange={handleAvatarInputChange}
            aria-hidden="true"
            tabIndex={-1}
          />

          {/* Action buttons */}
          <div className={styles.avatarActions}>
            {avatarFile && (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleAvatarUpload}
                disabled={avatarUploading}
              >
                {avatarUploading ? "Uploading…" : "Save Photo"}
              </button>
            )}
            {avatarFile && (
              <button
                type="button"
                className={styles.btnGhost}
                onClick={handleAvatarCancel}
                disabled={avatarUploading}
              >
                Cancel
              </button>
            )}
          </div>
        </section>

        {/* ════════════ RIGHT COLUMN ════════════ */}
        <div className={styles.rightCol}>

          {/* ── Profile Information card ── */}
          <section className={styles.card} aria-label="Profile information">
            <h2 className={styles.cardTitle}>Profile Information</h2>

            <form onSubmit={handleProfileSubmit} noValidate>
              {/* Full Name */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor={nameId}>Full Name</label>
                <input
                  id={nameId}
                  name="name"
                  type="text"
                  className={`${styles.input} ${profileErrors.name ? styles.inputError : ""}`}
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  disabled={profileSaving}
                  autoComplete="name"
                  placeholder="Your full name"
                  aria-describedby={profileErrors.name ? `${nameId}-err` : undefined}
                  aria-invalid={!!profileErrors.name}
                />
                {profileErrors.name && (
                  <span id={`${nameId}-err`} className={styles.fieldError} role="alert">
                    {profileErrors.name}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor={emailId}>Email Address</label>
                <input
                  id={emailId}
                  name="email"
                  type="email"
                  className={`${styles.input} ${profileErrors.email ? styles.inputError : ""}`}
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  disabled={profileSaving}
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-describedby={profileErrors.email ? `${emailId}-err` : undefined}
                  aria-invalid={!!profileErrors.email}
                />
                {profileErrors.email && (
                  <span id={`${emailId}-err`} className={styles.fieldError} role="alert">
                    {profileErrors.email}
                  </span>
                )}
              </div>

              {/* Date of Birth */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor={dobId}>Date of Birth</label>
                <input
                  id={dobId}
                  name="dob"
                  type="date"
                  className={styles.input}
                  value={profileForm.dob}
                  onChange={handleProfileChange}
                  disabled={profileSaving}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={profileSaving}
              >
                {profileSaving ? (
                  <><span className={styles.btnSpinner} aria-hidden="true" /> Saving…</>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          </section>

          {/* ── Password Update card ── */}
          <section className={styles.card} aria-label="Password update">
            <h2 className={styles.cardTitle}>Update Password</h2>

            <form onSubmit={handlePasswordSubmit} noValidate>
              {/* Current Password */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor={curPwId}>Current Password</label>
                <div className={styles.pwWrap}>
                  <input
                    id={curPwId}
                    name="current"
                    type={pwVisible.current ? "text" : "password"}
                    className={`${styles.input} ${styles.inputPw} ${pwErrors.current ? styles.inputError : ""}`}
                    value={pwForm.current}
                    onChange={handlePwChange}
                    disabled={pwSaving}
                    autoComplete="current-password"
                    placeholder="Enter current password"
                    aria-describedby={pwErrors.current ? `${curPwId}-err` : undefined}
                    aria-invalid={!!pwErrors.current}
                  />
                  <EyeToggle
                    visible={pwVisible.current}
                    onToggle={() => togglePwVisible("current")}
                    label={pwVisible.current ? "Hide current password" : "Show current password"}
                  />
                </div>
                {pwErrors.current && (
                  <span id={`${curPwId}-err`} className={styles.fieldError} role="alert">
                    {pwErrors.current}
                  </span>
                )}
              </div>

              {/* New Password */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor={newPwId}>New Password</label>
                <div className={styles.pwWrap}>
                  <input
                    id={newPwId}
                    name="next"
                    type={pwVisible.next ? "text" : "password"}
                    className={`${styles.input} ${styles.inputPw} ${pwErrors.next ? styles.inputError : ""}`}
                    value={pwForm.next}
                    onChange={handlePwChange}
                    disabled={pwSaving}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    aria-describedby={`${newPwId}-strength${pwErrors.next ? ` ${newPwId}-err` : ""}`}
                    aria-invalid={!!pwErrors.next}
                  />
                  <EyeToggle
                    visible={pwVisible.next}
                    onToggle={() => togglePwVisible("next")}
                    label={pwVisible.next ? "Hide new password" : "Show new password"}
                  />
                </div>
                {/* Strength meter */}
                {pwForm.next && (
                  <div className={styles.strengthMeter} id={`${newPwId}-strength`} aria-live="polite">
                    <div className={styles.strengthBars}>
                      {[1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className={styles.strengthBar}
                          style={{
                            background: i <= pwStrength.score ? pwStrength.color : undefined,
                          }}
                        />
                      ))}
                    </div>
                    <span className={styles.strengthLabel} style={{ color: pwStrength.color }}>
                      {pwStrength.label}
                    </span>
                  </div>
                )}
                {pwErrors.next && (
                  <span id={`${newPwId}-err`} className={styles.fieldError} role="alert">
                    {pwErrors.next}
                  </span>
                )}
              </div>

              {/* Confirm New Password */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor={confPwId}>Confirm New Password</label>
                <div className={styles.pwWrap}>
                  <input
                    id={confPwId}
                    name="confirm"
                    type={pwVisible.confirm ? "text" : "password"}
                    className={`${styles.input} ${styles.inputPw} ${pwErrors.confirm ? styles.inputError : ""}`}
                    value={pwForm.confirm}
                    onChange={handlePwChange}
                    disabled={pwSaving}
                    autoComplete="new-password"
                    placeholder="Repeat new password"
                    aria-describedby={pwErrors.confirm ? `${confPwId}-err` : undefined}
                    aria-invalid={!!pwErrors.confirm}
                  />
                  <EyeToggle
                    visible={pwVisible.confirm}
                    onToggle={() => togglePwVisible("confirm")}
                    label={pwVisible.confirm ? "Hide confirm password" : "Show confirm password"}
                  />
                </div>
                {pwErrors.confirm && (
                  <span id={`${confPwId}-err`} className={styles.fieldError} role="alert">
                    {pwErrors.confirm}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={pwSaving}
              >
                {pwSaving ? (
                  <><span className={styles.btnSpinner} aria-hidden="true" /> Updating…</>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </section>

        </div>{/* end rightCol */}
      </div>{/* end grid */}
    </main>
  );
}