# Active Context

## Current State
Core frontend infrastructure complete. Admin Dashboard feature implemented with role-based access control.

## What Was Just Implemented
- **Role-based access control**: `normalizeAuth()` in [`src/services/authService.js`](../src/services/authService.js) now extracts `role` from the API user object, defaulting to `"listener"` if absent. The `user` shape is now `{ id, name, email, role }`.
- **`isAdmin` flag in AuthContext**: [`src/context/AuthContext.jsx`](../src/context/AuthContext.jsx) computes `isAdmin = !!accessToken && user?.role === "admin"` and exposes it via the context value.
- **`AdminRoute` guard**: [`src/routes/AdminRoute.jsx`](../src/routes/AdminRoute.jsx) protects admin routes — unauthenticated users → `/login`, non-admin authenticated users → `/403`, admins → render outlet. Respects `initializing` flag to prevent flash.
- **Admin Dashboard page**: [`src/pages/AdminDashboard/AdminDashboard.jsx`](../src/pages/AdminDashboard/AdminDashboard.jsx) with a stats overview grid, quick-actions grid, and current-session info panel. Styled via [`src/pages/AdminDashboard/AdminDashboard.module.css`](../src/pages/AdminDashboard/AdminDashboard.module.css).
- **Navbar admin button**: [`src/components/Navbar/Navbar.jsx`](../src/components/Navbar/Navbar.jsx) conditionally renders an "Admin Dashboard" link (`.adminBtn` style) only when `isAdmin === true`. Hidden from all other roles and unauthenticated users.
- **`/admin` route registered**: [`src/App.jsx`](../src/App.jsx) wraps `<AdminDashboard />` inside `<AdminRoute />`.
- **403 Forbidden page**: [`src/pages/NotFound/NotFound.jsx`](../src/pages/NotFound/NotFound.jsx) updated to accept `variant="forbidden"` prop — renders a 403 Access Denied page. Registered at `/403` in [`src/App.jsx`](../src/App.jsx).

## What Was Previously Built
- Full authentication flow (login / signup / logout / silent refresh)
- In-memory access token management via `AuthContext` + `useAuth` hook
- Axios dual-instance pattern with request/response interceptors
- `ProtectedRoute` with initialisation guard (prevents unauthenticated flash)
- `PublicOnlyRoute` — redirects authenticated users away from `/login` and `/signup`
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
5. Wire up real data to Admin Dashboard stats/actions via API.

## Active Decisions
- Backend uses snake_case (`access_token`). `normalizeAuth()` in [`src/services/authService.js`](../src/services/authService.js) is the single normalization point — do not add camelCase handling elsewhere.
- Auth endpoints: `POST /login`, `POST /signup`, `DELETE /logout`, `POST /refresh` — adjust [`src/services/authService.js`](../src/services/authService.js) if paths differ.
- The `user` object in context exposes `{ id, name, email, role }`. Default role is `"listener"`. Extend `normalizeAuth()` if backend returns more fields.
- CSS Modules chosen over styled-components for zero runtime overhead and Vite-native support.
- Role check (`user.role === "admin"`) happens in-memory based on the JWT-derived user object from the backend — server is the authoritative source of role truth.