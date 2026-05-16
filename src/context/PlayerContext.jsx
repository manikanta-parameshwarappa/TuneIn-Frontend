import React, {
  createContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
} from "react";

export const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  // ── Queue & track state ──────────────────────────────────────────────────
  const [queue, setQueue] = useState([]);          // full ordered list
  const [queueIndex, setQueueIndex] = useState(-1); // current position in queue
  const [currentSong, setCurrentSong] = useState(null);

  // ── Playback state ───────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const audioRef = useRef(new Audio());
  const shuffledOrderRef = useRef([]);

  // ── Audio element event wiring ───────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => handleEnded();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync volume / mute ───────────────────────────────────────────────────
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // ── Core: load and play a song ───────────────────────────────────────────
  const loadSong = useCallback((song) => {
    if (!song?.audioUrl) return;
    const audio = audioRef.current;
    audio.pause();
    audio.src = song.audioUrl;
    audio.load();
    audio.play().catch(() => {});
    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
  }, []);

  // ── handleEnded: advance queue or loop ──────────────────────────────────
  function handleEnded() {
    if (isLooping) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }
    playNext();
  }

  // ── Build shuffled order ─────────────────────────────────────────────────
  const buildShuffledOrder = useCallback((length, current) => {
    const indices = Array.from({ length }, (_, i) => i).filter((i) => i !== current);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    shuffledOrderRef.current = [current, ...indices];
  }, []);

  // ── Play a song from queue at given index ────────────────────────────────
  const playAtIndex = useCallback(
    (index) => {
      if (index < 0 || index >= queue.length) return;
      setQueueIndex(index);
      loadSong(queue[index]);
    },
    [queue, loadSong]
  );

  // ── Play a single song (replaces queue) ─────────────────────────────────
  const playSong = useCallback(
    (song, queueSongs) => {
      const list = queueSongs || [song];
      const idx = list.findIndex((s) => s.id === song.id);
      const finalIdx = idx === -1 ? 0 : idx;
      setQueue(list);
      setQueueIndex(finalIdx);
      loadSong(song);
      if (isShuffled) buildShuffledOrder(list.length, finalIdx);
    },
    [isShuffled, loadSong, buildShuffledOrder]
  );

  // ── Play entire list from beginning ─────────────────────────────────────
  const playQueue = useCallback(
    (songs, startIndex = 0) => {
      if (!songs?.length) return;
      setQueue(songs);
      setQueueIndex(startIndex);
      loadSong(songs[startIndex]);
      if (isShuffled) buildShuffledOrder(songs.length, startIndex);
    },
    [isShuffled, loadSong, buildShuffledOrder]
  );

  // ── Add song to end of queue ─────────────────────────────────────────────
  const addToQueue = useCallback((song) => {
    setQueue((prev) => {
      const exists = prev.find((s) => s.id === song.id);
      if (exists) return prev;
      return [...prev, song];
    });
  }, []);

  // ── Remove song from queue ───────────────────────────────────────────────
  const removeFromQueue = useCallback((songId) => {
    setQueue((prev) => {
      const newQueue = prev.filter((s) => s.id !== songId);
      setQueueIndex((prevIdx) => {
        const removedIdx = prev.findIndex((s) => s.id === songId);
        if (removedIdx < prevIdx) return prevIdx - 1;
        return prevIdx;
      });
      return newQueue;
    });
  }, []);

  // ── Play / Pause toggle ─────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!currentSong) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [currentSong]);

  // ── Next ─────────────────────────────────────────────────────────────────
  const playNext = useCallback(() => {
    if (!queue.length) return;
    let nextIdx;
    if (isShuffled && shuffledOrderRef.current.length) {
      const pos = shuffledOrderRef.current.indexOf(queueIndex);
      const nextPos = (pos + 1) % shuffledOrderRef.current.length;
      nextIdx = shuffledOrderRef.current[nextPos];
    } else {
      nextIdx = (queueIndex + 1) % queue.length;
    }
    setQueueIndex(nextIdx);
    loadSong(queue[nextIdx]);
  }, [queue, queueIndex, isShuffled, loadSong]);

  // ── Previous ─────────────────────────────────────────────────────────────
  const playPrev = useCallback(() => {
    if (!queue.length) return;
    // If past 3 seconds, restart current song
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    let prevIdx;
    if (isShuffled && shuffledOrderRef.current.length) {
      const pos = shuffledOrderRef.current.indexOf(queueIndex);
      const prevPos = (pos - 1 + shuffledOrderRef.current.length) % shuffledOrderRef.current.length;
      prevIdx = shuffledOrderRef.current[prevPos];
    } else {
      prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    }
    setQueueIndex(prevIdx);
    loadSong(queue[prevIdx]);
  }, [queue, queueIndex, isShuffled, loadSong]);

  // ── Seek ─────────────────────────────────────────────────────────────────
  const seek = useCallback((time) => {
    if (!isFinite(time)) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  // ── Volume ───────────────────────────────────────────────────────────────
  const changeVolume = useCallback((vol) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolume(clamped);
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // ── Shuffle ──────────────────────────────────────────────────────────────
  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => {
      const next = !prev;
      if (next) buildShuffledOrder(queue.length, queueIndex);
      return next;
    });
  }, [queue.length, queueIndex, buildShuffledOrder]);

  // ── Loop ─────────────────────────────────────────────────────────────────
  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev);
  }, []);

  // ── Queue panel ──────────────────────────────────────────────────────────
  const toggleQueue = useCallback(() => {
    setIsQueueOpen((prev) => !prev);
  }, []);

  const closeQueue = useCallback(() => setIsQueueOpen(false), []);

  // ── Reorder queue (drag & drop) ─────────────────────────────────────────
  const reorderQueue = useCallback((fromIndex, toIndex) => {
    setQueue((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setQueueIndex((prevIdx) => {
      if (prevIdx === fromIndex) return toIndex;
      if (fromIndex < prevIdx && toIndex >= prevIdx) return prevIdx - 1;
      if (fromIndex > prevIdx && toIndex <= prevIdx) return prevIdx + 1;
      return prevIdx;
    });
  }, []);

  const value = {
    // State
    queue,
    queueIndex,
    currentSong,
    isPlaying,
    duration,
    currentTime,
    volume,
    isMuted,
    isLooping,
    isShuffled,
    isQueueOpen,
    isLoading,
    // Actions
    playSong,
    playQueue,
    playAtIndex,
    addToQueue,
    removeFromQueue,
    togglePlay,
    playNext,
    playPrev,
    seek,
    changeVolume,
    toggleMute,
    toggleShuffle,
    toggleLoop,
    toggleQueue,
    closeQueue,
    reorderQueue,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}