# TuneIn Frontend — Project Brief

## Overview
TuneIn is a music streaming single-page application (SPA) built with **React + Vite**. The backend is pre-built (JWT-based REST API). This repository contains the **frontend only**.

## Core Goals
1. Provide a polished, production-ready music streaming UI.
2. Implement secure JWT authentication (access token in memory, refresh token in HttpOnly cookie).
3. Handle silent token refresh transparently via Axios interceptors.
4. Deliver a responsive dark-mode UI consistent with modern streaming platforms (Spotify aesthetic).

## Scope
- Authentication pages (Login, Signup)
- Public Home page (marketing + personalised if logged in)
- Protected route infrastructure (ready for library/player pages)
- Navbar with auth-aware state
- Global dark CSS design system

## Out of Scope (v1)
- Music playback UI (player, queue, waveform)
- Search / browse pages
- User settings / profile edit page
- Backend implementation