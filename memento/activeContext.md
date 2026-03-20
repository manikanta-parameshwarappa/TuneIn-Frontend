# Active Context

## Current State
Core frontend infrastructure complete. Admin Dashboard and Artists Management page implemented with role-based access control.

## What Was Just Implemented
- **Artists Management page**: [`src/pages/Artists/Artists.jsx`](../src/pages/Artists/Artists.jsx) — admin-only page at `/admin/artists`. Displays a responsive grid of artist cards with avatar initials, name, email, date of birth, truncated bio, and edit/delete action buttons. Includes an empty state UI with a music-note icon. Artist count badge in header.
- **AddArtistDrawer component**: [`src/components/AddArtistDrawer/AddArtistDrawer.jsx`](../src/components/AddArtistDrawer/AddArtistDrawer.jsx) — right-side sliding drawer with semi-transparent backdrop. Contains a form with Name (required), Email (required with format validation), Date of Birth (optional date picker), and Bio (optional textarea with 500-char counter). Inline validation errors, focus trap, Escape key to close, body scroll lock, auto-reset on open/close.
- **`/admin/artists` route registered**: [`src/App.jsx`](../src/App.jsx) registers `<Artists />` inside `<AdminRoute />` at `/admin/artists` — access control handled entirely by the route guard.

## What Was Previously Built
- **Role-based access control**: `normalizeAuth()` in [`src/services/authService.js`](../src/services/authService.js) extracts `role`, defaulting to `"listener"`. The `user` shape is `{ id, name, email, role }`.
- **`isAdmin` flag in AuthContext**: [`src/context/AuthContext.jsx`](../src/context/AuthContext.jsx) computes `isAdmin = !!accessToken && user?.role === "admin"`.
- **`AdminRoute` guard**: [`src/routes/AdminRoute.jsx`](../src/routes/AdminRoute.jsx) — unauthenticated → `/login`, non-admin → `/403`, admin → outlet.
- **Admin Dashboard page**: [`src/pages/AdminDashboard/AdminDashboard.jsx`](../src/pages/AdminDashboard/AdminDashboard.jsx) with stats grid, quick-actions grid, session info panel.
- **Navbar admin button**: [`src/components/Navbar/Navbar.jsx`](../src/components/Navbar/Navbar.jsx) renders "Admin Dashboard" link only for `isAdmin === true`.
- **403 Forbidden page**: [`src/pages/NotFound/NotFound.jsx`](../src/pages/NotFound/NotFound.jsx) with `variant="forbidden"` prop.
- Full authentication flow (login / signup / logout / silent refresh)
- In-memory access token management via `AuthContext` + `useAuth` hook
- Axios dual-instance pattern with request/response interceptors
- `ProtectedRoute` with initialisation guard
- `PublicOnlyRoute` — redirects authenticated users away from `/login` and `/signup`
- Responsive Navbar (desktop + mobile hamburger) — auth-aware conditional rendering
- Login page with client-side validation + server error display
- Signup page with password confirmation + validation
- Home page (public marketing view + personalised authenticated view)
- 404 / NotFound page
- Dark music-streaming global CSS design system (CSS custom properties)
- Vite dev proxy for `/api` → `http://localhost:3000`

## Next Steps
1. Wire up Artists page to real API (`GET /artists`, `POST /artists`).
2. Implement Edit and Delete functionality for artists.
3. Add more protected pages (e.g., `/library`, `/search`, `/player`).
4. Build music playback UI (audio player bar, queue management).
5. Add user profile / settings page.
6. Wire up Admin Dashboard stats/actions via API.

## Active Decisions
- Artists are currently managed in local React state (`useState`). When wiring to API, replace with `axiosInstance` calls and integrate loading/error states.
- The `AddArtistDrawer` is a generic reusable drawer pattern — the same shell can be reused for Edit Artist by swapping the form fields and `onAdd` prop.
- Access control for `/admin/artists` is enforced entirely at the route level via `AdminRoute` — the page component itself has no role-check logic.
- Backend uses snake_case (`access_token`). `normalizeAuth()` in [`src/services/authService.js`](../src/services/authService.js) is the single normalization point.
- CSS Modules chosen over styled-components for zero runtime overhead and Vite-native support.