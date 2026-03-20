import React from "react";
import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

export function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <div className={styles.noteIcon}>♩</div>
        <h1 className={styles.title}>Page you seek is not found</h1>
        <Link to="/" className={styles.homeBtn}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}