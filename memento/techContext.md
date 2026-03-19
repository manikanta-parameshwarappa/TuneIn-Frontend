# Tech Context

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | ^19 |
| Build tool | Vite | ^8 |
| Routing | React Router DOM | ^7 |
| HTTP client | Axios | ^1 |
| Styling | CSS Modules + Global CSS | — |
| Language | JavaScript (ES Modules) | — |
| Runtime | Node.js / browser | — |

## Development Setup

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```
VITE_API_BASE_URL=http://localhost:3000/
```

In development, Vite proxies `/api` → `http://localhost:3000` (configured in [`vite.config.js`](../vite.config.js)), so you can also leave `VITE_API_BASE_URL` unset and rely on the proxy.

## Key Dependencies

```json
"react-router-dom": "^7.x"  — BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation
"axios": "^1.x"              — HTTP client with interceptors
```

## Technical Constraints / Decisions

1. **No token persistence** — `localStorage` and `sessionStorage` are intentionally unused for tokens. All token state resets on hard refresh and is restored via the HttpOnly refresh-token cookie.
2. **`withCredentials: true`** must be set on all Axios instances so the browser sends the HttpOnly refresh cookie cross-origin.
3. **CORS** — The backend must allow the frontend origin and `credentials: true`.
4. **React 19** — No `React.StrictMode` double-render issues; interceptors are set up with a cleanup `eject` function.
5. **Vite CSS Modules** — Files ending in `.module.css` are automatically treated as CSS Modules by Vite.