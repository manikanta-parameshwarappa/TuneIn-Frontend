# Active Context

## Current State
Core frontend infrastructure complete. Admin Dashboard and Artists Management page implemented with role-based access control. Artists page is now fully wired to the real API. Navbar uses an avatar dropdown. Full `/profile` page fully wired to the real backend API (`GET /profile`, `PATCH /profile`). Admin Dashboard UI/UX modernized.

## What Was Just Fixed
- **Profile API wiring** — `src/services/userService.js`, `src/pages/Profile/Profile.jsx`, `src/context/AuthContext.jsx`:
 - `userService.js` rewired from the incorrect `/api/users/edit` endpoint to the correct `/profile` route. All PATCH calls now send the required `type` discriminator param (`"info"`, `"password"`, `"avatar"`). Password update now sends `current_password`, `new_password`, `password_confirmation` (snake_case) as the backend expects. Removed the non-existent `removeAvatar()` method. Added `getProfile()` (`GET /profile`) to fetch the full user object including `dob` and `avatar_url`.
 - `Profile.jsx` now calls `getProfile()` on mount to hydrate `dob` and `avatarUrl` (fields not in the auth token). After every successful mutation the local `profile` state and the global `AuthContext` user are both updated. Error extraction uses the backend's actual response shapes (`{ error: "..." }` or `{ errors: [...] }`). Password confirmation is passed to `updatePassword()` as the third argument.
 - `AuthContext.jsx` now exposes `setUser` in its context value so the Profile page can push name/email/avatarUrl updates into the global user state (used by Navbar initials, etc.).

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
- Bulk song upload leverages `FormData` and native drag & drop, mapping multiple audio files to individual metadata forms before submission. Includes an inline custom audio player.
- API response normalisation for artists, albums, and songs lives entirely in their respective service files.
- **UI Alignment Convention**: For all future pages implementing `max-width` constraints (like `1200px`), horizontal padding `padding: 0;` should be used on `.header`, `.headerInner`, and `.container` above `1200px`. A `@media (max-width: 1200px)` breakpoint must be explicitly provided to re-introduce horizontal padding (`1.5rem`) so content stays off the window edges on smaller viewports.
- **Modern UI Guidelines**:
  - Backgrounds: Use deeper, darker blue/gray gradients (e.g., `linear-gradient(to bottom right, #111827, #0f172a)` or `#0b1120`).
  - Borders: Use subtle, low-opacity white/blue shades (e.g., `rgba(255, 255, 255, 0.05)` or `rgba(59, 130, 246, 0.2)`).
  - Hover Effects: Incorporate slight vertical translation (`transform: translateY(-1px)`) combined with a soft, expansive box shadow (`box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.4)`).
  - Radiuses: Use larger border radiuses (e.g., `12px`, `16px` for modals, `40px` for pill-shaped elements like audio players).
  - Custom Scrollbars: Employ transparent tracks with subtle gray thumbs (`rgba(156, 163, 175, 0.2)`) inside modal bodies to maintain a native dark theme feel.
  - Multi-Select: Use custom dropdown components with checkboxes and a search bar rather than native `<select multiple>`.
  - **Primary Button Style Convention** (established in Profile page, mirrors Admin Dashboard action cards):
    - Base: `background: rgba(17, 24, 39, 0.7)`, `border: 1px solid rgba(59, 130, 246, 0.35)`, `border-radius: 12px`, `color: #e2e8f0`.
    - Gradient overlay: `::before` pseudo-element with `linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, transparent 100%)`, `opacity: 0` at rest, `opacity: 1` on hover.
    - Hover: `border-color: rgba(59, 130, 246, 0.6)`, `transform: translateY(-3px)`, `box-shadow: 0 10px 24px -8px rgba(0,0,0,0.5), 0 0 16px -4px rgba(59,130,246,0.25)`.
    - Use `position: relative; overflow: hidden` on the button and `z-index: 1` on inner children so the overlay doesn't bleed over text.
    - Apply this pattern to all primary CTA buttons across new pages (save, submit, confirm actions).