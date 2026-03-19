import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "../../components/AuthForm/AuthForm.module.css";

export function Signup() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    else if (form.name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email address";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: "" }));
    setServerError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const result = await signup(form.name.trim(), form.email, form.password);
    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setServerError(result.message);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.card}>
        <div className={styles.logoMark}>
          <span>♪</span>
        </div>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Start your music journey today</p>

        {serverError && (
          <div className={styles.errorAlert}>
            <span>⚠</span> {serverError}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="name">
              Full Name
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>👤</span>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
              />
            </div>
            {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
          </div>

          {/* Email */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>✉</span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              />
            </div>
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          {/* Password */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowConfirm((s) => !s)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? "🙈" : "👁"}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className={styles.fieldError}>{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading && <span className={styles.btnSpinner} />}
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}