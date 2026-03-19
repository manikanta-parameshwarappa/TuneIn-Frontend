# Active Context

## Current State
Core frontend infrastructure complete and connected to a live backend. Authentication bug fixed: Navbar now correctly reflects authenticated state after login/signup.

## What Was Just Fixed
- **Navbar auth state bug**: Backend returns `access_token` (snake_case) but the context expected `accessToken` (camelCase). Added `normalizeAuth()` in [`src/services/authService.js`](../src/services/authService.js) to normalize `access_token → accessToken` for `login`, `signup`, and `refresh` responses. This caused `isAuthenticated` to always be `false`, keeping Login/Signup buttons visible and never showing Logout.
- **Hardened `refreshAccessToken`** in [`src/context/AuthContext.jsx`](../src/context/AuthContext.jsx): if refresh returns an empty/null token, it now throws explicitly so the boot guard correctly leaves the user unauthenticated without silently setting `null` state.
- **Logout missing Authorization header**: `logout()` in [`src/services/authService.js`](../src/services/authService.js) was using `axiosPublic` (no interceptors), so the `Authorization: Bearer <token>` header was never sent. The backend's `authorize_request` middleware rejected the request. Fixed by switching `logout()` to use `axiosInstance` (the authenticated instance with the request interceptor).
- **Authenticated users could access /login and /signup via URL**: Added [`src/routes/PublicOnlyRoute.jsx`](../src/routes/PublicOnlyRoute.jsx) — a guest-only route guard that redirects authenticated users to `/`. Wired into [`src/App.jsx`](../src/App.jsx) wrapping the `/login` and `/signup` routes. Respects the `initializing` flag to avoid flash-redirecting during session restore.

## What Was Previously Built
- Full authentication flow (login / signup / logout / silent refresh)
- In-memory access token management via `AuthContext` + `useAuth` hook
- Axios dual-instance pattern with request/response interceptors
- `ProtectedRoute` with initialisation guard (prevents unauthenticated flash)
- Responsive Navbar (desktop + mobile hamburger) — auth-aware conditional rendering
- Login page with client-side validation + server error display
- Signup page with password confirmation + validation
- Home page (public marketing view + personalised authenticated view)
- 404 / NotFound page
- Dark music-streaming global CSS design system (CSS custom properties)
- Vite dev proxy for `/api` → `http://localhost:3000`

## Next Steps
1. Add more protected pages (e.g., `/library`, `/search`, `/player`).
2. Build music playback UI (audio player bar, queue management).
3. Add user profile / settings page.
4. Implement search and browse functionality.

## Active Decisions
- Backend uses snake_case (`access_token`). `normalizeAuth()` in [`src/services/authService.js`](../src/services/authService.js) is the single normalization point — do not add camelCase handling elsewhere.
- Auth endpoints: `POST /login`, `POST /signup`, `DELETE /logout`, `POST /refresh` — adjust [`src/services/authService.js`](../src/services/authService.js) if paths differ.
- The `user` object in context exposes `{ id, name, email }` — extend `normalizeAuth()` if backend returns more fields.
- CSS Modules chosen over styled-components for zero runtime overhead and Vite-native support.