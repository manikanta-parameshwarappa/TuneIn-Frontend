# Active Context

## Current State
Music player fully implemented end-to-end. A persistent bottom player bar, queue panel, and global `PlayerContext` are all wired to the backend API. Home page play buttons, album/artist cards, song rows, and playlist sidebar all connect to the player. Build is clean (exit 0, 121 modules).

## What Was Just Implemented

### Music Player System (End-to-End)

#### 1. [`src/context/PlayerContext.jsx`](../src/context/PlayerContext.jsx)
Global audio state via React Context + HTML `<Audio>` element:
- **Queue management**: ordered queue array + current index
- **Controls**: `playSong`, `playQueue`, `playAtIndex`, `addToQueue`, `removeFromQueue`, `togglePlay`, `playNext`, `playPrev`, `seek`, `changeVolume`, `toggleMute`, `toggleShuffle`, `toggleLoop`
- **Shuffle**: Fisher-Yates algorithm, stored in `shuffledOrderRef`
- **Loop**: single-track repeat on `ended` event
- **Previous**: restarts current track if >3 seconds in (Spotify UX)
- **Drag-reorder**: `reorderQueue` updates queue + adjusts current index correctly
- **Queue panel toggle**: `isQueueOpen`, `toggleQueue`, `closeQueue`
- `usePlayer()` hook exported for consumer components

#### 2. [`src/components/MusicPlayer/MusicPlayer.jsx`](../src/components/MusicPlayer/MusicPlayer.jsx)
Fixed bottom player bar (90px, `z-index: 200`):
- **Left**: album thumb (56×56px), song name, artist name
- **Center**: shuffle → prev → play/pause (44px circle button) → next → repeat + progress bar with hover tooltip
- **Right**: queue toggle + volume slider
- `ProgressBar`: drag-seek, hover time tooltip, smooth fill animation
- `VolumeControl`: mute toggle + range input with CSS `--vol` custom property
- Spinner ring animation while buffering/loading
- Renders `null` when no song is loaded (zero layout impact)
- Renders `<QueuePanel>` above itself when open

#### 3. [`src/components/MusicPlayer/QueuePanel.jsx`](../src/components/MusicPlayer/QueuePanel.jsx)
Slide-in panel from right (360px wide, sits above player bar):
- **Sections**: Now Playing / Up Next / Previously Played
- **Drag-and-drop reorder** via HTML5 `draggable` API
- **Animated equalizer bars** on currently playing track
- **Remove button** (hover-reveal trash) for Up Next items
- **Empty state** with icon and CTA
- Shuffle toggle in header
- CSS slide-in animation (`cubic-bezier(0.22, 1, 0.36, 1)`)

#### 4. [`src/App.jsx`](../src/App.jsx)
- Wrapped entire app in `<PlayerProvider>`
- `<MusicPlayer />` rendered after `<Routes>` inside the shell (persistent across all routes)

#### 5. [`src/pages/Home/Home.jsx`](../src/pages/Home/Home.jsx) — Player wiring
- **AlbumCard**: detects songs in album → plays album queue; pause if current album playing
- **ArtistCard**: detects songs by artist → plays artist queue; pause if current artist
- **SongRow**: `playSong(song, allSongs)` sets full queue; `addToQueue` button (hover-reveal); play/pause per row
- **FeaturedCard**: plays album/artist/track depending on type
- Dynamic `height` on `.appLayout` shrinks by 90px when player is active

#### 6. [`src/components/PlaylistSidebar/PlaylistSidebar.jsx`](../src/components/PlaylistSidebar/PlaylistSidebar.jsx)
- Accepts `songs` prop from Home for queue resolution
- `handlePlayPlaylist`: resolves playlist songs from backend data or falls back to global pool
- Per-item play overlay on avatar (hover)
- `playlistNamePlaying` blue highlight for active playlist
- `isCurrentlyPlaying` computed from queue index + song IDs

#### 7. [`src/services/playlistService.js`](../src/services/playlistService.js)
- Fixed `addSongToPlaylist`: `POST /playlists/:id/playlist_songs` with `{ playlist_song: { song_id } }`
- Fixed `removeSongFromPlaylist`: `DELETE /playlists/:id/playlist_songs/:id`
- Added `fetchPlaylist(id)` for single playlist fetch
- Added `normalizePlaylistSong()` to resolve `audio_url` for playback

#### 8. CSS Additions
- [`src/components/MusicPlayer/MusicPlayer.module.css`](../src/components/MusicPlayer/MusicPlayer.module.css): Full player bar, progress bar, volume slider, loading ring
- [`src/components/MusicPlayer/QueuePanel.module.css`](../src/components/MusicPlayer/QueuePanel.module.css): Queue panel, equalizer animation, drag-over highlight
- [`src/components/PlaylistSidebar/PlaylistSidebar.module.css`](../src/components/PlaylistSidebar/PlaylistSidebar.module.css): Added `.playlistAvatarOverlay`, `.playlistNamePlaying`
- [`src/pages/Home/Home.module.css`](../src/pages/Home/Home.module.css): Added `.songRowQueueBtn`, `.songRowQueueBtnVisible`, `.albumPlayBtnActive`
- [`src/index.css`](../src/index.css): Added `--player-height: 90px`, `--navbar-height: 72px` CSS variables

## Next Steps
- Search page
- Artist / Album detail pages (click-through from Home grid)
- Toast notification system
- Error boundary component
- Mini-player waveform visualization (optional)

## Active Decisions
- Player bar is `position: fixed` at `bottom: 0` — layout height is adjusted dynamically when a song loads
- Queue panel slides in from right, sits between player bar and navbar
- `PlayerContext` uses a real `HTMLAudioElement` (not Web Audio API) for simplicity and broad browser support
- Shuffle uses Fisher-Yates with a stored permutation array so next/prev are consistent within a shuffle session
- `playPrev` restarts track if >3s in (matches Spotify UX)
- No token persistence rule still applies — `PlayerContext` is fully client-side