import React, { useRef, useState, useEffect } from "react";
import styles from "./SongModals.module.css";
import { fetchArtists } from "../../services/artistService";
import { fetchAlbums } from "../../services/albumService";

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);

const VolumeIcon = ({ isMuted }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {isMuted ? (
      <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></>
    ) : (
      <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></>
    )}
  </svg>
);

const SongPlayer = ({ url, currentlyPlaying, setCurrentlyPlaying, songId }) => {
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const isPlaying = currentlyPlaying === songId;

  useEffect(() => {
    if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => setCurrentlyPlaying(null);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [setCurrentlyPlaying]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(songId);
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    }
  };

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const handleVolume = (e) => {
    const newVolume = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (volume > 0) {
        audioRef.current.volume = 0;
        setVolume(0);
      } else {
        audioRef.current.volume = 1;
        setVolume(1);
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.playerContainer}>
      <audio ref={audioRef} src={url} preload="metadata" />
      <button type="button" className={styles.playPauseBtn} onClick={handleTogglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      
      <div className={styles.progressContainer}>
        <span className={styles.timeText}>{formatTime(progress)}</span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={progress}
          onChange={handleSeek}
          className={styles.slider}
          style={{ '--progress': `${duration ? (progress / duration) * 100 : 0}%` }}
        />
        <span className={styles.timeText}>{formatTime(duration)}</span>
      </div>

      <div className={styles.volumeContainer}>
        <button type="button" className={styles.muteBtn} onClick={toggleMute} aria-label="Toggle mute">
          <VolumeIcon isMuted={volume === 0} />
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolume}
          className={styles.slider}
          style={{ '--progress': `${volume * 100}%` }}
        />
      </div>
    </div>
  );
};

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

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (id) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const selectedNames = options
    .filter(opt => value.includes(opt.id))
    .map(opt => opt.name)
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
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
              filteredOptions.map(opt => (
                <label key={opt.id} className={styles.multiSelectOption}>
                  <div className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      checked={value.includes(opt.id)}
                      onChange={() => handleToggle(opt.id)}
                      className={styles.multiSelectCheckbox}
                    />
                    <div className={styles.customCheckbox}></div>
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

export function SongUploadModal({ isOpen, onClose, onUpload, submitting = false, uploadProgress = 0, serverError = null }) {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadOptions();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Clean up object URLs
      songs.forEach(song => {
        if (song.previewUrl) URL.revokeObjectURL(song.previewUrl);
      });
      setSongs([]);
      setCurrentlyPlaying(null);
    }
  }, [isOpen]);

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

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!submitting) setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (submitting) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const audioFiles = files.filter(f => f.type.startsWith('audio/'));
    if (audioFiles.length === 0) return;

    const newSongs = audioFiles.map(f => {
      const name = f.name.replace(/\.[^/.]+$/, "");
      return {
        id: Math.random().toString(36).substring(7),
        file: f,
        previewUrl: URL.createObjectURL(f),
        name: name,
        albumId: "",
        genre: "",
        duration: "",
        artistIds: [],
        errors: {}
      };
    });

    setSongs(prev => [...prev, ...newSongs]);
  };

  const handleRemoveSong = (id) => {
    setSongs(prev => {
      const songToRemove = prev.find(s => s.id === id);
      if (songToRemove && songToRemove.previewUrl) {
        URL.revokeObjectURL(songToRemove.previewUrl);
      }
      if (currentlyPlaying === id) setCurrentlyPlaying(null);
      return prev.filter(s => s.id !== id);
    });
  };

  const handleSongChange = (id, field, value) => {
    setSongs(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value, errors: { ...s.errors, [field]: "" } };
      }
      return s;
    }));
  };

  const handleArtistIdsChange = (id, newArtistIds) => {
    handleSongChange(id, "artistIds", newArtistIds);
  };

  const validate = () => {
    let isValid = true;
    const validatedSongs = songs.map(song => {
      const errors = {};
      if (!song.name.trim()) errors.name = "Name is required.";
      if (!song.albumId) errors.albumId = "Album is required.";
      if (song.artistIds.length === 0) errors.artistIds = "Select at least one artist.";
      
      if (Object.keys(errors).length > 0) isValid = false;
      return { ...song, errors };
    });

    setSongs(validatedSongs);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (songs.length === 0 || submitting) return;
    if (validate()) {
      onUpload(songs);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`} onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}>
      <div className={`${styles.modal} ${isOpen ? styles.modalVisible : ""}`} role="dialog" aria-modal="true" aria-label="Upload Songs">
        <header className={styles.header}>
          <h2 className={styles.title}>Bulk Upload Songs</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} disabled={submitting}>
            <CloseIcon />
          </button>
        </header>

        {serverError && <div className={styles.serverError}>{serverError}</div>}

        <div className={styles.body}>
          {!submitting && (
            <div 
              className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ""}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.dropzoneIcon}>🎵</div>
              <p className={styles.dropzoneText}>Drag & drop audio files here, or click to browse</p>
              <p className={styles.dropzoneHint}>Supports MP3, WAV, AAC</p>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept="audio/*" 
                className={styles.fileInput} 
                onChange={handleFileSelect}
                disabled={submitting}
              />
            </div>
          )}

          {songs.length > 0 && (
            <div className={styles.songList}>
              {songs.map((song, index) => (
                <div key={song.id} className={styles.songItem}>
                  <div className={styles.songItemHeader}>
                    <div className={styles.songFilenameWrapper}>
                      <span className={styles.songIndex}>{index + 1}</span>
                      <div className={styles.songTitleContainer}>
                        <h3 className={styles.songFilename} title={song.file.name}>{song.file.name}</h3>
                        {song.previewUrl && (
                          <SongPlayer
                            url={song.previewUrl}
                            songId={song.id}
                            currentlyPlaying={currentlyPlaying}
                            setCurrentlyPlaying={setCurrentlyPlaying}
                          />
                        )}
                      </div>
                    </div>
                    {!submitting && (
                      <button type="button" className={styles.removeSongBtn} onClick={() => handleRemoveSong(song.id)} aria-label="Remove song">
                        <TrashIcon />
                      </button>
                    )}
                  </div>

                  <div className={styles.songFields}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Song Name <span className={styles.required}>*</span></label>
                      <input 
                        type="text" 
                        className={`${styles.input} ${song.errors.name ? styles.inputError : ""}`}
                        value={song.name} 
                        onChange={(e) => handleSongChange(song.id, "name", e.target.value)}
                        disabled={submitting}
                      />
                      {song.errors.name && <span className={styles.errorMsg}>{song.errors.name}</span>}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Album <span className={styles.required}>*</span></label>
                      <select 
                        className={`${styles.select} ${song.errors.albumId ? styles.inputError : ""}`}
                        value={song.albumId} 
                        onChange={(e) => handleSongChange(song.id, "albumId", e.target.value)}
                        disabled={submitting || loadingOptions}
                      >
                        <option value="">Select Album</option>
                        {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      {song.errors.albumId && <span className={styles.errorMsg}>{song.errors.albumId}</span>}
                    </div>

                    <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                      <label className={styles.label}>Artists <span className={styles.required}>*</span></label>
                      <ArtistMultiSelect
                        options={artists}
                        value={song.artistIds}
                        onChange={(values) => handleArtistIdsChange(song.id, values)}
                        error={song.errors.artistIds}
                        disabled={submitting || loadingOptions}
                      />
                      {song.errors.artistIds && <span className={styles.errorMsg}>{song.errors.artistIds}</span>}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Genre</label>
                      <input 
                        type="text" 
                        className={styles.input}
                        value={song.genre} 
                        onChange={(e) => handleSongChange(song.id, "genre", e.target.value)}
                        disabled={submitting}
                        placeholder="e.g. Pop, Rock"
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Duration (sec)</label>
                      <input 
                        type="number" 
                        className={styles.input}
                        value={song.duration} 
                        onChange={(e) => handleSongChange(song.id, "duration", e.target.value)}
                        disabled={submitting}
                        placeholder="e.g. 210"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {submitting && (
            <div className={styles.uploadProgress}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className={styles.progressText}>Uploading... {uploadProgress}%</p>
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>Cancel</button>
          <button 
            type="button" 
            className={styles.submitBtn} 
            onClick={handleSubmit} 
            disabled={submitting || songs.length === 0}
          >
            {submitting ? "Uploading..." : `Upload ${songs.length} Song${songs.length !== 1 ? 's' : ''}`}
          </button>
        </footer>
      </div>
    </div>
  );
}