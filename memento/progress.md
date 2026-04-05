# Progress

## What Works
- Full authentication flow (login / signup / logout / silent refresh via HttpOnly cookie)
- Role-based access control (`isAdmin` derived from JWT role claim)
- `AdminRoute` guard — unauthenticated → `/login`, non-admin → `/403`
- Artists page (`/admin/artists`): fetches real artists from `GET /api/artists`, creates new artists via `POST /api/artists`, shows loading / error / empty / grid states
- `AddArtistDrawer`: inline validation, submitting state, server error banner, disabled controls during API call
- `artistService.js` normalises both API response shapes (`[]` and `{ artists, count }`)
- Admin Dashboard page (UI only — stats not wired to API yet)
- All public pages (Home, Login, Signup, 404, 403)
- Responsive Navbar with auth-aware rendering

## What's Left to Build
- Music playback pages (`/library`, `/search`, `/player`)
- Audio player bar / queue management
- User profile / settings page
- Admin Dashboard API integration (real stats and actions)

## Known Issues
- None currently

## Status: Foundation Complete + Admin Dashboard + Artists Management ✅

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
- [x] **Navbar** — auth-aware links, admin-only "Admin Dashboard" button, profile avatar with initials, logout, mobile hamburger menu
- [x] **Login page** — email/password form, validation, server error display, password toggle, redirect to `from`
- [x] **Signup page** — name/email/password/confirm form, full validation, server error display
- [x] **Home page** — public hero + feature cards; personalised greeting when logged in
- [x] **Admin Dashboard page** — stats overview, quick-actions grid, session info panel; protected by `AdminRoute`
- [x] **Artists Management page** ([`src/pages/Artists/Artists.jsx`](../src/pages/Artists/Artists.jsx)) — admin-only at `/admin/artists`; responsive artist card grid, avatar initials, count badge, empty state UI with music-note icon; edit/delete action buttons (UI only)
- [x] **AddArtistDrawer component** ([`src/components/AddArtistDrawer/AddArtistDrawer.jsx`](../src/components/AddArtistDrawer/AddArtistDrawer.jsx)) — right-side slide-in drawer; Name + Email (required, validated) + DOB (optional date picker) + Bio (optional, 500-char counter); inline errors; focus trap; Escape key; body scroll lock; backdrop click to close; smooth CSS transition
- [x] **NotFound page** — supports `variant="forbidden"` for 403 Access Denied; default is 404
- [x] **Global dark CSS** — design tokens, scrollbar, selection, spinner, focus ring
- [x] **Vite dev proxy** — `/api` → `http://localhost:3000`
- [x] **Production build** — passes with 0 errors, 0 warnings

## What's Left to Build
- [x] Artists page — wire to real API (`GET /artists`, `POST /artists`, `PUT /artists/:id`, `DELETE /artists/:id`)
- [x] Artists page — implement Edit and Delete functionality using ArtistModal
- [x] Albums page — full CRUD functionality via AlbumModal (`GET /albums`, `POST /albums`, `PUT /albums/:id`, `DELETE /albums/:id`)
- [x] Songs page — bulk upload with drag & drop, inline preview audio player, custom modern Artist multi-select, Edit and Delete functionality (`GET /songs`, `POST /songs/bulk-upload`, `PUT /songs/:id`, `DELETE /songs/:id`)
- [ ] Music player UI (audio bar, progress, volume)
- [ ] Library / playlist pages
- [ ] Search page
- [ ] Artist / album detail pages
- [ ] User profile / settings page
- [ ] Toast notification system
- [ ] Error boundary component
- [ ] Admin Dashboard — wire real API data to stats and actions
- [ ] End-to-end tests

## Known Issues / Assumptions
- Backend auth paths: `POST /login`, `POST /signup`, `DELETE /logout`, `POST /refresh`. Update [`src/services/authService.js`](../src/services/authService.js:1) if different.
- Backend returns `access_token` (snake_case) — normalized to `accessToken` by `normalizeAuth()` in [`src/services/authService.js`](../src/services/authService.js:17).
- `user` object shape: `{ id, name, email, role }`. Default role is `"listener"`. Extend `normalizeAuth()` in [`src/services/authService.js`](../src/services/authService.js) if more fields are needed.
- Role `"admin"` must be returned by the backend in the `user.role` field. The frontend does not set roles — it only reads them.
- No HTTPS forced in dev; production deployment should enforce HTTPS for secure cookies.

## Bug Fixes Applied
- **2026-03-19** — Navbar auth state not updating after login: backend `access_token` (snake_case) was not being read by context which expected `accessToken` (camelCase). Fixed in [`src/services/authService.js`](../src/services/authService.js) via `normalizeAuth()`.
- **2026-03-19** — Logout failing with Unauthorized: `authService.logout()` was using `axiosPublic` which has no interceptors, so no `Authorization` header was sent. Backend `authorize_request` rejected the DELETE request. Fixed by switching to `axiosInstance` in [`src/services/authService.js`](../src/services/authService.js).
- **2026-03-19** — Authenticated users could navigate to `/login` and `/signup` via URL. Added [`src/routes/PublicOnlyRoute.jsx`](../src/routes/PublicOnlyRoute.jsx) (guest-only guard) and wrapped login/signup routes in [`src/App.jsx`](../src/App.jsx). Authenticated users are now redirected to `/`.
- **2026-03-20** — Auth UI flash on page refresh: Logged-in users briefly saw Login/Signup buttons in the Navbar while `AuthContext` was still running its initial silent refresh (`initializing === true`). Root cause: `Navbar` was reading `isAuthenticated` directly without checking `initializing`, so it rendered the unauthenticated UI during the async session-restore window. Fixed in [`src/components/Navbar/Navbar.jsx`](../src/components/Navbar/Navbar.jsx) by consuming `initializing` from `useAuth()` and wrapping the entire auth-dependent nav section in `{!initializing && (...)}`. This keeps the nav buttons hidden until auth state is definitively resolved, eliminating the flash with zero performance impact.