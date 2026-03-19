# Progress

## Status: Foundation Complete ✅

## What Works
- [x] **Project scaffolding** — Vite + React 19, ESLint, folder structure
- [x] **Dependency installation** — `react-router-dom`, `axios`
- [x] **AuthContext** — in-memory access token, user state, `initializing` flag, session restore on boot
- [x] **useAuth hook** — clean hook API for all components
- [x] **axiosInstance** — request interceptor (attach Bearer), response interceptor (401 → silent refresh → retry)
- [x] **axiosPublic** — separate instance for auth endpoints, no interceptors
- [x] **authService** — login, signup, logout, refresh endpoints
- [x] **ProtectedRoute** — React Router v6 Outlet pattern, initialising guard, redirect to login with `from` state
- [x] **Navbar** — auth-aware links, profile avatar with initials, logout, mobile hamburger menu
- [x] **Login page** — email/password form, validation, server error display, password toggle, redirect to `from`
- [x] **Signup page** — name/email/password/confirm form, full validation, server error display
- [x] **Home page** — public hero + feature cards; personalised greeting when logged in
- [x] **NotFound (404) page**
- [x] **Global dark CSS** — design tokens, scrollbar, selection, spinner, focus ring
- [x] **Vite dev proxy** — `/api` → `http://localhost:3000`
- [x] **Production build** — passes with 0 errors, 0 warnings

## What's Left to Build
- [ ] Music player UI (audio bar, progress, volume)
- [ ] Library / playlist pages
- [ ] Search page
- [ ] Artist / album detail pages
- [ ] User profile / settings page
- [ ] Toast notification system
- [ ] Error boundary component
- [ ] End-to-end tests

## Known Issues / Assumptions
- Backend auth paths assumed: `login`, `signup`, `logout`, `refresh`. Update [`src/services/authService.js`](../src/services/authService.js:1) if different.
- `user` object shape assumed: `{ id, name, email }`. Extend context if more fields needed.
- No HTTPS forced in dev; production deployment should enforce HTTPS for secure cookies.