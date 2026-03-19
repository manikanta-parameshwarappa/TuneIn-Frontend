# Product Context

## Why TuneIn Exists
TuneIn is a music streaming application that lets users discover, stream, and manage music. The frontend must feel as polished and fast as Spotify or Apple Music — dark aesthetic, smooth transitions, and instant perceived performance.

## Problems Solved
| Problem | Solution |
|---------|----------|
| Token theft via XSS | Access token stored only in React memory (never localStorage/sessionStorage) |
| Session persistence across page refreshes | HttpOnly cookie carries refresh token; silent refresh on app boot restores session |
| Stale token on long sessions | Axios response interceptor auto-refreshes on every 401, retries original request |
| Mobile usability | Responsive navbar with hamburger menu; fluid layouts throughout |

## User Experience Goals
- **Instant boot**: App silently checks for an existing session in the background; users are never shown a flash of unauthenticated content on protected routes.
- **Seamless auth flow**: After login/signup → redirected to home. After logout → redirected to login.
- **Consistent design**: Dark background (`#0a0a12`), green accent (`#1db954`), soft surface cards — same visual language from navbar to forms to home page.
- **Helpful forms**: Inline validation, visible errors, password reveal toggle, loading states on submit.

## Assumed API Response Shapes

```
POST login   → { accessToken: string, user: { id, name, email } }
POST signup  → { accessToken: string, user: { id, name, email } }
DELETE logout  → 200 OK  (server clears HttpOnly cookie)
POST refresh → { accessToken: string, user?: { id, name, email } }
```

All protected endpoints return `401` when the access token is missing or expired, triggering the silent refresh flow.