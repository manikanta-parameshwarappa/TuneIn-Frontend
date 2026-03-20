import React from "react";
import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

const VARIANTS = {
  forbidden: {
    code: "403",
    icon: "🔒",
    title: "Access Denied",
    text: "You don't have permission to view this page.",
    codeClass: styles.codeForbidden,
  },
  notFound: {
    code: "404",
    icon: "♩",
    title: "Page you seek is not found",
    text: null,
    codeClass: styles.code,
  },
};

export function NotFound({ variant }) {
  const config = variant === "forbidden" ? VARIANTS.forbidden : VARIANTS.notFound;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={`${styles.code} ${config.codeClass ?? ""}`}>{config.code}</div>
        <div className={styles.noteIcon}>{config.icon}</div>
        <h1 className={styles.title}>{config.title}</h1>
        {config.text && <p className={styles.text}>{config.text}</p>}
        <Link to="/" className={styles.homeBtn}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}