# Progress

## Status: Foundation + Admin + Homepage + **Music Player (End-to-End)** ✅

## What Works
- [x] **Project scaffolding** — Vite + React 19, ESLint, folder structure
- [x] **Dependency installation** — `react-router-dom`, `axios`
- [x] **AuthContext** — in-memory access token, user state, `initializing` flag, session restore on boot, `isAdmin` derived flag
- [x] **useAuth hook** — clean hook API for all components
- [x] **axiosInstance** — request interceptor (attach Bearer), response interceptor (401 → silent refresh → retry)
- [x] **axiosPublic** — separate instance for auth endpoints, no interceptors
- [x] **authService** — login, signup, logout, refresh endpoints; `normalizeAuth()` maps `{ id, name, email, role }` with `"listener"` default role
- [x] **ProtectedRoute** — React Router v6 Outlet pattern, initialising guard, redirect to login with `from` state
- [x] **AdminRoute** — role-based guard; unauthenticated → `/login`, non-admin → `/403`, admin → outlet
- [x] **Navbar** — auth-aware links, admin-only "Admin Dashboard" button, profile avatar with initials, logout modal, mobile hamburger menu
- [x] **Login page** — email/password form, validation, server error display, password toggle
- [x] **Signup page** — name/email/password/confirm form, full validation
- [x] **Home page (revamped)** — Full Spotify-style layout:
  - [x] Resizable playlist sidebar (drag handle, min/max width, collapse toggle, full CRUD modals, search)
  - [x] Greeting banner with time-aware message + quick stats (songs/albums/artists)
  - [x] Featured cards row (top album, artist, track) — all wired to player
  - [x] Albums grid with hover play overlay — plays album queue
  - [x] Artists horizontal scroll row — plays artist queue
  - [x] Songs list — Spotify column layout, click-to-play, add-to-queue hover button
  - [x] Public hero with two-column layout + animated floating cards + feature grid
- [x] **Music Player** (NEW):
  - [x] **PlayerContext** — global HTML Audio element, queue array, shuffle (Fisher-Yates), loop, seek, volume, mute
  - [x] **MusicPlayer bar** — fixed bottom 90px bar: song thumb + info, prev/play-pause/next, shuffle/repeat, progress bar with drag+tooltip, volume slider
  - [x] **Queue Panel** — slide-in right panel: Now Playing / Up Next / Previously Played sections, drag-to-reorder, equalizer animation, remove from queue
  - [x] All home page play buttons wired to PlayerContext
  - [x] PlaylistSidebar play overlay wired to PlayerContext
- [x] **Admin Dashboard page** — stats overview, three-tab layout (Artists | Albums | Songs), search, CRUD
- [x] **Artists Management page** — full CRUD
- [x] **Albums page** — full CRUD
- [x] **Songs page** — bulk upload, edit, delete
- [x] **Profile page** — avatar upload, profile edit, password change, all wired to real API
- [x] **NotFound page** — supports `variant="forbidden"` for 403
- [x] **Global dark CSS** — design tokens, scrollbar, selection, spinner, focus ring
- [x] **playlistService** — fully fixed endpoints: `fetchPlaylists`, `createPlaylist`, `updatePlaylist`, `deletePlaylist`, `addSongToPlaylist` (`playlist_songs` route), `removeSongFromPlaylist`, `fetchPlaylist`

## What's Left to Build
- [ ] Like/heart functionality — wire `POST /songs/:id/likes`
- [ ] "Add to Playlist" modal (from song row / player)
- [ ] Library / playlist detail pages (click-through from sidebar)
- [ ] Search page
- [ ] Artist / Album detail pages (click-through from Home grid)
- [ ] Toast notification system
- [ ] Error boundary component
- [ ] Admin Dashboard — wire real API data to stats
- [ ] Mini-player waveform / visualizer (optional)
- [ ] End-to-end tests

## Known Issues / Assumptions
- Playlist CRUD falls back to optimistic local state if `/playlists` API endpoint not yet available.
- Backend auth paths: `POST /login`, `POST /signup`, `DELETE /logout`, `POST /refresh`.
- Backend returns `access_token` (snake_case) — normalized to `accessToken` by `normalizeAuth()`.
- `user` object shape: `{ id, name, email, role }`. Default role is `"listener"`.

## Bug Fixes Applied
- **2026-03-19** — Navbar auth state not updating after login: `access_token` snake_case not read. Fixed in [`src/services/authService.js`](../src/services/authService.js) via `normalizeAuth()`.
- **2026-03-19** — Logout failing with Unauthorized: switched to `axiosInstance` in `authService.logout()`.
- **2026-03-19** — Authenticated users could navigate to `/login`/`/signup`. Added `PublicOnlyRoute` guard.
- **2026-03-20** — Auth UI flash on page refresh: fixed in `Navbar.jsx` by consuming `initializing` flag.