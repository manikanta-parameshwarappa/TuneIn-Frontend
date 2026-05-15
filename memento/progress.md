# Progress

## Status: Foundation + Admin Dashboard + Artists Management + Homepage Revamp ✅

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
  - [x] Featured cards row (top album, artist, track)
  - [x] Albums grid with hover play overlay
  - [x] Artists horizontal scroll row with circular avatars
  - [x] Songs list — Spotify column layout with hover/playing states
  - [x] Public hero with two-column layout + animated floating cards + feature grid
- [x] **Admin Dashboard page** — stats overview, three-tab layout (Artists | Albums | Songs), search, CRUD
- [x] **Artists Management page** ([`src/pages/Artists/Artists.jsx`](../src/pages/Artists/Artists.jsx)) — full CRUD
- [x] **Albums page** ([`src/pages/Albums/Albums.jsx`](../src/pages/Albums/Albums.jsx)) — full CRUD
- [x] **Songs page** ([`src/pages/Songs/Songs.jsx`](../src/pages/Songs/Songs.jsx)) — bulk upload, edit, delete
- [x] **Profile page** — avatar upload, profile edit, password change, all wired to real API
- [x] **NotFound page** — supports `variant="forbidden"` for 403
- [x] **Global dark CSS** — design tokens, scrollbar, selection, spinner, focus ring
- [x] **playlistService** — `fetchPlaylists`, `createPlaylist`, `updatePlaylist`, `deletePlaylist` with graceful fallbacks

## What's Left to Build
- [ ] Music player UI (audio bar, progress, volume, queue)
- [ ] Library / playlist detail pages
- [ ] Search page
- [ ] Artist / album detail pages (click-through from Home)
- [ ] Backend `/playlists` API endpoint for persistence
- [ ] Toast notification system
- [ ] Error boundary component
- [ ] Admin Dashboard — wire real API data to stats
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