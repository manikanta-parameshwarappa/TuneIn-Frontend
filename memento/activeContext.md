# Active Context

## Current State
Core frontend infrastructure complete. Admin Dashboard and Artists Management page implemented with role-based access control. Artists page is now fully wired to the real API. Navbar uses an avatar dropdown. Full `/profile` page implemented with avatar upload, profile information form, and password update form. Admin Dashboard UI/UX modernized.

## What Was Just Fixed
- **Dashboard UI Layout Alignment** — `src/pages/AdminDashboard/AdminDashboard.module.css`, `src/pages/Artists/Artists.module.css`, `src/pages/Albums/Albums.module.css`, `src/pages/Songs/Songs.module.css`: All main admin page wrappers (`.header`, `.headerInner`, `.container`) now use `0` horizontal padding by default to ensure perfect alignment with their `max-width: 1200px` constraints. A `@media (max-width: 1200px)` media query now reliably introduces `1.5rem` side padding to prevent content from hitting the window edges on smaller screens. This ensures a uniform straight vertical alignment edge across all admin pages.

## What Was Previously Implemented
- **Admin Dashboard UI/UX Modernization** — `src/pages/AdminDashboard/AdminDashboard.jsx`: Temporarily removed the Overview section as requested. Shifted into a two-column grid (`.mainContent` and `.sidebar`). Upgraded "Quick Actions" to an elegant, modernized card layout with a linear gradient background, box-shadow on hover, and an animated right arrow indicating interactivity. Session info is now cleanly displayed inside the sticky sidebar.
- **`userService.js`**: `src/services/userService.js` — service layer with `updateProfile(fields)` (PATCH `/api/users/edit` with changed-fields-only diff), `updatePassword(currentPassword, newPassword)`, `uploadAvatar(file, onProgress)` (multipart/form-data with upload progress callback), and `removeAvatar()`. All methods use `axiosInstance` (Bearer token + silent refresh).
- **Profile page**: `src/pages/Profile/Profile.jsx` — three-panel layout (avatar card | profile info card | password card). Avatar section: 110 px circular frame with initials fallback, dark overlay on hover, drag-and-drop support, file picker (JPG/PNG/WEBP ≤2 MB), instant `URL.createObjectURL` preview, upload progress spinner + percentage, Save/Remove/Cancel actions. Profile form: Name, Email, Date of Birth fields pre-populated from `user` context; inline real-time validation; diff-based payload (only changed fields sent). Password form: Current / New / Confirm fields with independent eye-toggles; live password strength meter (0–4 bar, colour-coded); match validation; fields cleared on success. Global toast/snackbar (success / error / info) auto-dismisses after 4 s. Loading skeleton shown while `initializing === true`.
- **Navbar avatar dropdown**: `src/components/Navbar/Navbar.jsx` — clickable avatar button opens a dropdown menu containing: display name, Profile link, and Logout button. Dropping closes on outside click.

## What Was Previously Built
- **Role-based access control**: `normalizeAuth()` in `src/services/authService.js` extracts `role`, defaulting to `"listener"`. The `user` shape is `{ id, name, email, role }`.
- **`isAdmin` flag in AuthContext**: `src/context/AuthContext.jsx` computes `isAdmin = !!accessToken && user?.role === "admin"`.
- **`AdminRoute` guard**: `src/routes/AdminRoute.jsx` — unauthenticated → `/login`, non-admin → `/403`, admin → outlet.
- **403 Forbidden page**: `src/pages/NotFound/NotFound.jsx` with `variant="forbidden"` prop.
- In-memory access token management via `AuthContext` + `useAuth` hook
- Axios dual-instance pattern with request/response interceptors

## Next Steps
1. Add more protected pages (e.g., `/library`, `/search`, `/player`).
2. Build music playback UI (audio player bar, queue management).
3. Wire up Admin Dashboard stats/actions via API (once the Overview section is ready to be restored).

## Active Decisions
- Modal UI approach used for CRUD (Artists, Albums, and Songs) rather than Drawer for better user focus and UX consistency.
- Bulk song upload leverages `FormData` and native drag & drop, mapping multiple audio files to individual metadata forms before submission.
- API response normalisation for artists, albums, and songs lives entirely in their respective service files.
- **UI Alignment Convention**: For all future pages implementing `max-width` constraints (like `1200px`), horizontal padding `padding: 0;` should be used on `.header`, `.headerInner`, and `.container` above `1200px`. A `@media (max-width: 1200px)` breakpoint must be explicitly provided to re-introduce horizontal padding (`1.5rem`) so content stays off the window edges on smaller viewports.