# Active Context

## Current State
Core frontend infrastructure complete. Home page revamped into a full Spotify-style layout with a resizable sidebar for playlist CRUD and a rich main content area. Admin Dashboard remains a unified single-page tabbed CRUD UI covering Artists, Albums, and Songs. Navbar uses an avatar dropdown. Full `/profile` page wired to the real backend API.

## What Was Just Implemented
- **Homepage Revamp** — [`src/pages/Home/Home.jsx`](../src/pages/Home/Home.jsx) and [`src/pages/Home/Home.module.css`](../src/pages/Home/Home.module.css):
  - **Authenticated view**: Full Spotify-style app layout (`display: flex; height: calc(100vh - 72px); overflow: hidden`).
    - **Left — PlaylistSidebar** ([`src/components/PlaylistSidebar/PlaylistSidebar.jsx`](../src/components/PlaylistSidebar/PlaylistSidebar.jsx)):
      - Drag-resizable via a `col-resize` handle (min 60 px, max 420 px, default 280 px).
      - Collapse toggle: click the "Your Library" header button to collapse to icon-only (60 px) or expand.
      - **Full playlist CRUD**: Create (modal with name + description), Edit (pre-filled modal), Delete (confirmation modal).
      - Live client-side search filter.
      - Animated shimmer skeleton loading state; empty state with "New Playlist" CTA.
      - Per-item hover actions (edit pencil + trash).
      - Hidden on mobile (`@media max-width: 768px`).
    - **Right — Main scroll area**:
      - **Greeting banner**: time-aware greeting (Good morning/afternoon/evening), quick stat cards (Songs / Albums / Artists count with coloured values).
      - **Featured row**: 3 horizontal cards — top album, top artist, top song — each with cover/fallback, type badge, name, subtitle, and "Play Now" pill button.
      - **Albums grid**: `auto-fill minmax(150px)` CSS grid. Each card: square cover art (gradient fallback), hover-animated play button overlay, album name + director + year.
      - **Artists row**: horizontal overflow scroll. Each card: 90 px circular avatar (image or initials fallback), hover darken overlay with play button, name + "Artist" label.
      - **Songs list**: Spotify-style column layout (`#`, thumbnail, title/artist, album, ♥ like, ⏱ duration). Hover row highlight; "currently playing" blue highlight; show/hide "show all N songs" button; all with skeleton loading and empty states.
  - **Public view** (unauthenticated): Two-column hero (left: title + CTA buttons, right: three animated floating cards), feature cards grid below.
  - **New service**: [`src/services/playlistService.js`](../src/services/playlistService.js) — `fetchPlaylists`, `createPlaylist`, `updatePlaylist`, `deletePlaylist`, `addSongToPlaylist`, `removeSongFromPlaylist` with graceful no-op fallbacks if the API endpoint doesn't exist yet.

## What Was Previously Implemented
- **Admin Dashboard Revamp** — `src/pages/AdminDashboard/AdminDashboard.jsx` and `src/pages/AdminDashboard/AdminDashboard.module.css`:
  - Three-tab layout: Artists | Albums | Songs.
  - Each tab: search bar, + Add/Upload button, data table with all attributes, Actions column (Edit + Delete).
  - Tab bar is sticky; animated shimmer skeleton; inline error banner; empty state with CTA.
  - All CRUD via existing service functions and modals.
- **`userService.js`**: `updateProfile`, `updatePassword`, `uploadAvatar`, `removeAvatar`.
- **Profile page**: three-panel layout (avatar card | profile info | password card), full wired to real API.
- **Navbar avatar dropdown**: clickable avatar → dropdown with name, Profile link, Logout button.

## Next Steps
1. Wire up the audio player bar at the bottom (playback state shared via context).
2. Add `POST /playlists` backend endpoint so playlist CRUD persists server-side.
3. Add Artist / Album detail pages (click-through from Home grid/row).
4. Add search page.
5. Optionally restore Admin Overview/stats section above the tab bar.

## Active Decisions
- Modal UI approach used for CRUD (Artists, Albums, Songs, Playlists) rather than Drawer.
- Playlist CRUD uses optimistic local-state fallback when backend endpoint not yet available.
- API response normalisation for artists, albums, and songs lives in their respective service files.
- **UI Alignment Convention**: For all future pages implementing `max-width` constraints (like `1200px`), horizontal padding `padding: 0;` should be used on `.header`, `.headerInner`, and `.container` above `1200px`. A `@media (max-width: 1200px)` breakpoint must be explicitly provided to re-introduce horizontal padding (`1.5rem`) so content stays off the window edges on smaller viewports.
- **Modern UI Guidelines**:
  - Backgrounds: Use deeper, darker blue/gray gradients (e.g., `linear-gradient(to bottom right, #111827, #0f172a)` or `#0b1120`).
  - Borders: Use subtle, low-opacity white/blue shades (e.g., `rgba(255, 255, 255, 0.05)` or `rgba(59, 130, 246, 0.2)`).
  - Hover Effects: Incorporate slight vertical translation (`transform: translateY(-1px)`) combined with a soft, expansive box shadow (`box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.4)`).
  - Radiuses: Use larger border radiuses (e.g., `12px`, `16px` for modals, `40px` for pill-shaped elements).
  - Custom Scrollbars: Transparent tracks with subtle gray thumbs (`rgba(156, 163, 175, 0.2)`).
  - **Primary Button Style Convention**: Base `background: rgba(17, 24, 39, 0.7)`, `border: 1px solid rgba(59, 130, 246, 0.35)`, `border-radius: 12px`, `color: #e2e8f0`. Hover: `border-color: rgba(59, 130, 246, 0.6)`, `transform: translateY(-3px)`.