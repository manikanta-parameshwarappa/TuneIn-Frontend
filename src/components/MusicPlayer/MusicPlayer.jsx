import React, { useState, useRef, useCallback } from "react";
import { usePlayer } from "../../context/PlayerContext";
import { QueuePanel } from "./QueuePanel";
import styles from "./MusicPlayer.module.css";

// ── SVG Icons ────────────────────────────────────────────────────────────────
function IconPlay() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function IconSkipNext() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 17,12 5,21" />
      <rect x="18" y="3" width="2.5" height="18" rx="1" />
    </svg>
  );
}

function IconSkipPrev() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="19,3 7,12 19,21" />
      <rect x="3.5" y="3" width="2.5" height="18" rx="1" />
    </svg>
  );
}

function IconShuffle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}

function IconRepeat() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function IconVolumeHigh() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function IconVolumeLow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function IconVolumeMute() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function IconQueue() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function IconMusic() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" className={styles.spinnerPath} />
    </svg>
  );
}

// ── Utility ──────────────────────────────────────────────────────────────────
function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ currentTime, duration, onSeek }) {
  const barRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverX, setHoverX] = useState(0);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getTimeFromEvent = useCallback(
    (e) => {
      if (!barRef.current) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration]
  );

  const handleMouseDown = (e) => {
    setIsDragging(true);
    onSeek(getTimeFromEvent(e));
  };

  const handleMouseMove = (e) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoverX(e.clientX - rect.left);
    setHoverTime(getTimeFromEvent(e));
    if (isDragging) onSeek(getTimeFromEvent(e));
  };

  const handleMouseUp = (e) => {
    if (isDragging) {
      onSeek(getTimeFromEvent(e));
      setIsDragging(false);
    }
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
    setIsDragging(false);
  };

  return (
    <div className={styles.progressWrapper}>
      <span className={styles.timeLabel}>{formatTime(currentTime)}</span>
      <div
        className={styles.progressBar}
        ref={barRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }}>
            <div className={styles.progressThumb} />
          </div>
        </div>
        {hoverTime !== null && (
          <div
            className={styles.progressTooltip}
            style={{ left: `${hoverX}px` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>
      <span className={styles.timeLabel}>{formatTime(duration)}</span>
    </div>
  );
}

// ── Volume Slider ────────────────────────────────────────────────────────────
function VolumeControl({ volume, isMuted, onVolumeChange, onToggleMute }) {
  const VolumeIcon =
    isMuted || volume === 0
      ? IconVolumeMute
      : volume < 0.5
      ? IconVolumeLow
      : IconVolumeHigh;

  return (
    <div className={styles.volumeControl}>
      <button
        className={styles.controlBtn}
        onClick={onToggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
        title={isMuted ? "Unmute" : "Mute"}
      >
        <VolumeIcon />
      </button>
      <div className={styles.volumeSliderWrapper}>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className={styles.volumeSlider}
          aria-label="Volume"
          style={{ "--vol": `${(isMuted ? 0 : volume) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ── Main MusicPlayer component ───────────────────────────────────────────────
export function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    isLoading,
    duration,
    currentTime,
    volume,
    isMuted,
    isLooping,
    isShuffled,
    isQueueOpen,
    togglePlay,
    playNext,
    playPrev,
    seek,
    changeVolume,
    toggleMute,
    toggleLoop,
    toggleShuffle,
    toggleQueue,
    queue,
  } = usePlayer();

  if (!currentSong) return null;

  const artistNames =
    currentSong.artists?.map((a) => a.name).join(", ") || "Unknown Artist";

  return (
    <>
      {/* Queue Panel */}
      {isQueueOpen && <QueuePanel />}

      {/* Player Bar */}
      <div className={styles.playerBar}>
        {/* Left — song info */}
        <div className={styles.playerLeft}>
          <div className={styles.songThumb}>
            {currentSong.album?.coverUrl ? (
              <img
                src={currentSong.album.coverUrl}
                alt={currentSong.album?.name}
                className={styles.songThumbImg}
              />
            ) : (
              <div className={styles.songThumbFallback}>
                <IconMusic />
              </div>
            )}
            {isLoading && (
              <div className={styles.songThumbLoading}>
                <IconSpinner />
              </div>
            )}
          </div>
          <div className={styles.songInfo}>
            <span className={styles.songName} title={currentSong.name}>
              {currentSong.name}
            </span>
            <span className={styles.songArtist} title={artistNames}>
              {artistNames}
            </span>
          </div>
        </div>

        {/* Center — controls + progress */}
        <div className={styles.playerCenter}>
          <div className={styles.controls}>
            <button
              className={`${styles.controlBtn} ${isShuffled ? styles.controlBtnActive : ""}`}
              onClick={toggleShuffle}
              aria-label="Shuffle"
              title="Shuffle"
            >
              <IconShuffle />
              {isShuffled && <span className={styles.activeDot} />}
            </button>

            <button
              className={styles.controlBtn}
              onClick={playPrev}
              aria-label="Previous"
              title="Previous"
              disabled={queue.length <= 1}
            >
              <IconSkipPrev />
            </button>

            <button
              className={styles.playPauseBtn}
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isLoading ? (
                <div className={styles.loadingRing} />
              ) : isPlaying ? (
                <IconPause />
              ) : (
                <IconPlay />
              )}
            </button>

            <button
              className={styles.controlBtn}
              onClick={playNext}
              aria-label="Next"
              title="Next"
              disabled={queue.length <= 1}
            >
              <IconSkipNext />
            </button>

            <button
              className={`${styles.controlBtn} ${isLooping ? styles.controlBtnActive : ""}`}
              onClick={toggleLoop}
              aria-label="Repeat"
              title="Repeat"
            >
              <IconRepeat />
              {isLooping && <span className={styles.activeDot} />}
            </button>
          </div>

          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
          />
        </div>

        {/* Right — volume + queue */}
        <div className={styles.playerRight}>
          <button
            className={`${styles.controlBtn} ${isQueueOpen ? styles.controlBtnActive : ""}`}
            onClick={toggleQueue}
            aria-label="Queue"
            title="Queue"
          >
            <IconQueue />
          </button>

          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={changeVolume}
            onToggleMute={toggleMute}
          />
        </div>
      </div>
    </>
  );
}