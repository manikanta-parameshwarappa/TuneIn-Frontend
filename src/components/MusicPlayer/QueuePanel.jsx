import React, { useState } from "react";
import { usePlayer } from "../../context/PlayerContext";
import styles from "./QueuePanel.module.css";

// ── Icons ────────────────────────────────────────────────────────────────────
function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconMusic() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function IconDrag() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="18" x2="16" y2="18" />
    </svg>
  );
}

function IconShuffle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}

function IconEqualizer() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="14" width="3" height="8" rx="1" className={styles.eqBar1} />
      <rect x="7" y="10" width="3" height="12" rx="1" className={styles.eqBar2} />
      <rect x="12" y="6" width="3" height="16" rx="1" className={styles.eqBar3} />
      <rect x="17" y="9" width="3" height="13" rx="1" className={styles.eqBar4} />
    </svg>
  );
}

// ── Format duration ───────────────────────────────────────────────────────────
function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── QueueItem ─────────────────────────────────────────────────────────────────
function QueueItem({ song, index, isCurrent, isPlaying, onPlay, onRemove, dragHandlers }) {
  const [hovered, setHovered] = useState(false);
  const artistNames = song.artists?.map((a) => a.name).join(", ") || "Unknown";

  return (
    <div
      className={`${styles.queueItem} ${isCurrent ? styles.queueItemCurrent : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...dragHandlers}
    >
      {/* Drag handle */}
      <div className={styles.dragHandle} title="Drag to reorder">
        <IconDrag />
      </div>

      {/* Thumbnail */}
      <div className={styles.queueThumb} onClick={onPlay}>
        {song.album?.coverUrl ? (
          <img src={song.album.coverUrl} alt={song.album?.name} className={styles.queueThumbImg} />
        ) : (
          <div className={styles.queueThumbFallback}>
            <IconMusic />
          </div>
        )}
        {isCurrent && isPlaying ? (
          <div className={styles.queueThumbOverlay}>
            <IconEqualizer />
          </div>
        ) : (hovered || isCurrent) ? (
          <div className={styles.queueThumbOverlay} onClick={onPlay} style={{ cursor: "pointer" }}>
            <IconPlay />
          </div>
        ) : null}
      </div>

      {/* Song info */}
      <div className={styles.queueInfo} onClick={onPlay}>
        <span
          className={`${styles.queueSongName} ${isCurrent ? styles.queueSongNameCurrent : ""}`}
          title={song.name}
        >
          {song.name}
        </span>
        <span className={styles.queueArtistName} title={artistNames}>
          {artistNames}
        </span>
      </div>

      {/* Duration */}
      <span className={styles.queueDuration}>{formatTime(song.duration)}</span>

      {/* Remove */}
      {!isCurrent && (
        <button
          className={`${styles.removeBtn} ${hovered ? styles.removeBtnVisible : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(song.id);
          }}
          aria-label="Remove from queue"
          title="Remove"
        >
          <IconTrash />
        </button>
      )}
    </div>
  );
}

// ── QueuePanel ────────────────────────────────────────────────────────────────
export function QueuePanel() {
  const {
    queue,
    queueIndex,
    currentSong,
    isPlaying,
    playAtIndex,
    removeFromQueue,
    toggleQueue,
    reorderQueue,
    toggleShuffle,
    isShuffled,
  } = usePlayer();

  const [dragFromIndex, setDragFromIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (index) => (e) => {
    setDragFromIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (index) => (e) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index) => (e) => {
    e.preventDefault();
    if (dragFromIndex !== null && dragFromIndex !== index) {
      reorderQueue(dragFromIndex, index);
    }
    setDragFromIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragFromIndex(null);
    setDragOverIndex(null);
  };

  const upNext = queue.slice(queueIndex + 1);
  const played = queue.slice(0, queueIndex);

  return (
    <div className={styles.queuePanel}>
      {/* Header */}
      <div className={styles.queueHeader}>
        <div className={styles.queueHeaderLeft}>
          <h3 className={styles.queueTitle}>Queue</h3>
          <span className={styles.queueCount}>{queue.length} songs</span>
        </div>
        <div className={styles.queueHeaderRight}>
          <button
            className={`${styles.queueHeaderBtn} ${isShuffled ? styles.queueHeaderBtnActive : ""}`}
            onClick={toggleShuffle}
            title="Shuffle"
            aria-label="Shuffle"
          >
            <IconShuffle />
          </button>
          <button
            className={styles.queueCloseBtn}
            onClick={toggleQueue}
            aria-label="Close queue"
            title="Close"
          >
            <IconClose />
          </button>
        </div>
      </div>

      <div className={styles.queueBody}>
        {/* Now Playing */}
        {currentSong && (
          <div className={styles.queueSection}>
            <p className={styles.queueSectionLabel}>Now Playing</p>
            <QueueItem
              song={currentSong}
              index={queueIndex}
              isCurrent={true}
              isPlaying={isPlaying}
              onPlay={() => playAtIndex(queueIndex)}
              onRemove={() => {}}
              dragHandlers={{}}
            />
          </div>
        )}

        {/* Up Next */}
        {upNext.length > 0 && (
          <div className={styles.queueSection}>
            <p className={styles.queueSectionLabel}>Up Next</p>
            {upNext.map((song, i) => {
              const realIndex = queueIndex + 1 + i;
              const isDragOver = dragOverIndex === realIndex;
              return (
                <div
                  key={song.id}
                  className={`${styles.queueItemWrapper} ${isDragOver ? styles.dragOver : ""}`}
                >
                  <QueueItem
                    song={song}
                    index={realIndex}
                    isCurrent={false}
                    isPlaying={false}
                    onPlay={() => playAtIndex(realIndex)}
                    onRemove={removeFromQueue}
                    dragHandlers={{
                      draggable: true,
                      onDragStart: handleDragStart(realIndex),
                      onDragOver: handleDragOver(realIndex),
                      onDrop: handleDrop(realIndex),
                      onDragEnd: handleDragEnd,
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Previously played */}
        {played.length > 0 && (
          <div className={styles.queueSection}>
            <p className={`${styles.queueSectionLabel} ${styles.queueSectionLabelFaded}`}>
              Previously Played
            </p>
            {played.map((song, i) => (
              <div key={song.id} className={styles.queueItemWrapper}>
                <QueueItem
                  song={song}
                  index={i}
                  isCurrent={false}
                  isPlaying={false}
                  onPlay={() => playAtIndex(i)}
                  onRemove={removeFromQueue}
                  dragHandlers={{}}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {queue.length === 0 && (
          <div className={styles.emptyQueue}>
            <div className={styles.emptyQueueIcon}>
              <IconMusic />
            </div>
            <p className={styles.emptyQueueText}>Your queue is empty</p>
            <p className={styles.emptyQueueSub}>Add songs to start listening</p>
          </div>
        )}
      </div>
    </div>
  );
}