# Active Context

## Current State
Core frontend infrastructure complete. Admin Dashboard and Artists Management page implemented with role-based access control. Artists page is now fully wired to the real API. Navbar uses an avatar dropdown. Full `/profile` page implemented with avatar upload, profile information form, and password update form.

## What Was Just Fixed
- **Navbar auth UI flash** — [`src/components/Navbar/Navbar.jsx`](../src/components/Navbar/Navbar.jsx): Logged-in users briefly saw Login/Signup buttons on page refresh while `AuthContext` completed its initial silent refresh. Root cause: `Navbar` read `isAuthenticated` without considering `initializing`. Fix: destructure `initializing` from `useAuth()` and wrap the entire auth-dependent nav section in `{!initializing && (...)}`. The nav buttons are now hidden until auth state is fully resolved, preventing any flash of incorrect UI.

## What Was Previously Implemented
- **`userService.js`**: [`src/services/userService.js`](../src/services/userService.js) — service layer with `updateProfile(fields)` (PATCH `/api/users/edit` with changed-fields-only diff), `updatePassword(currentPassword, newPassword)`, `uploadAvatar(file, onProgress)` (multipart/form-data with upload progress callback), and `removeAvatar()`. All methods use `axiosInstance` (Bearer token + silent refresh).
- **Profile page**: [`src/pages/Profile/Profile.jsx`](../src/pages/Profile/Profile.jsx) — three-panel layout (avatar card | profile info card | password card). Avatar section: 110 px circular frame with initials fallback, dark overlay on hover, drag-and-drop support, file picker (JPG/PNG/WEBP ≤2 MB), instant `URL.createObjectURL` preview, upload progress spinner + percentage, Save/Remove/Cancel actions. Profile form: Name, Email, Date of Birth fields pre-populated from `user` context; inline real-time validation; diff-based payload (only changed fields sent). Password form: Current / New / Confirm fields with independent eye-toggles; live password strength meter (0–4 bar, colour-coded); match validation; fields cleared on success. Global toast/snackbar (success / error / info) auto-dismisses after 4 s. Loading skeleton shown while `initializing === true`.
- **Profile CSS**: [`src/pages/Profile/Profile.module.css`](../src/pages/Profile/Profile.module.css) — two-column grid (260 px left + flexible right); responsive single-column at ≤860 px; all card, input, button, toast, strength-meter, skeleton, and drag-zone styles with smooth micro-animations.
- **Route registered**: [`src/App.jsx`](../src/App.jsx) — `<Route path="/profile" element={<Profile />} />` added inside the `<ProtectedRoute />` wrapper so unauthenticated users are redirected to `/login`.
- **Navbar avatar dropdown**: [`src/components/Navbar/Navbar.jsx`](../src/components/Navbar/Navbar.jsx) — removed inline user name and logout button from the main navbar. Instead, a clickable avatar button opens a dropdown menu containing: (1) the user's display name as non-clickable plain text, (2) a "Profile" link navigating to `/profile`, and (3) a "Logout" button. The dropdown closes on outside click via a `mousedown` listener bound only while open.
- **Dropdown CSS**: [`src/components/Navbar/Navbar.module.css`](../src/components/Navbar/Navbar.module.css) — added `.avatarWrapper`, `.avatarBtn`, `.dropdown`, `.dropdownOpen` (smooth `opacity` + `translateY/scale` transition), `.dropdownName`, `.dropdownDivider`, `.dropdownItem`, `.dropdownLogout`. Responsive: on mobile (`≤640px`) the dropdown renders `position: static` and stretches full width inside the hamburger menu. Removed now-unused `.profileSection`, `.userName`, `.logoutBtn` classes.

## What Was Previously Built
- **`artistService.js`**: [`src/services/artistService.js`](../src/services/artistService.js) — service layer with `fetchArtists()` (`GET /api/artists`) and `createArtist()` (`POST /api/artists`). Handles both API response shapes: `[]` (empty) and `{ artists: [...], count: N }`.
- **Artists page API integration**: [`src/pages/Artists/Artists.jsx`](../src/pages/Artists/Artists.jsx) — replaced local mock state with real API calls. Implements `loading`, `fetchError`, `submitting`, and `submitError` states. `loadArtists()` runs on mount via `useEffect`. `handleAddArtist()` calls `createArtist()`, appends the server-returned artist object, and closes the drawer only on success.
- **`AddArtistDrawer` enhanced**: [`src/components/AddArtistDrawer/AddArtistDrawer.jsx`](../src/components/AddArtistDrawer/AddArtistDrawer.jsx) — accepts `submitting` (bool) and `serverError` (string|null) props. Submit button shows "Saving…" when in-flight; all interactive elements disabled while submitting; server error banner renders inside the drawer above the form; `dob` field removed (not in API contract).
- **CSS additions**: `loadingState`, `errorState`, `errorMsg` added to [`src/pages/Artists/Artists.module.css`](../src/pages/Artists/Artists.module.css); `serverError` banner and `disabled` overrides added to [`src/components/AddArtistDrawer/AddArtistDrawer.module.css`](../src/components/AddArtistDrawer/AddArtistDrawer.module.css).

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
1. Implement Edit (PUT `/api/artists/:id`) and Delete (DELETE `/api/artists/:id`) functionality for artists.
2. Add more protected pages (e.g., `/library`, `/search`, `/player`).
3. Build music playback UI (audio player bar, queue management).
4. Add user profile / settings page.
5. Wire up Admin Dashboard stats/actions via API.

## Active Decisions
- API response normalisation for artists lives entirely in `fetchArtists()` — both `[]` and `{ artists, count }` shapes are handled there; callers always receive a plain array.
- `AddArtistDrawer` does NOT close itself on submit — the parent (`Artists.jsx`) controls close via `setDrawerOpen(false)` only on API success. This prevents premature close on error.
- The `dob` field was removed from the drawer — it is not part of the current API contract (`POST /api/artists` accepts `name`, `email`, `bio` only).
- Access control for `/admin/artists` is enforced entirely at the route level via `AdminRoute` — the page component itself has no role-check logic.
- Backend uses snake_case (`access_token`). `normalizeAuth()` in [`src/services/authService.js`](../src/services/authService.js) is the single normalization point.
- CSS Modules chosen over styled-components for zero runtime overhead and Vite-native support.