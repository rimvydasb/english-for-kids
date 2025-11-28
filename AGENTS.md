# Repository Guidelines

## Project Structure & Modules
- `app/page.tsx` hosts the interactive word cards and audio playback; `app/layout.tsx` wraps the MUI theme from `app/ThemeRegistry.tsx` / `theme.ts`.
- `public/` holds any static assets; cards currently render stylized initials instead of fetched images.

## Build, Test, and Development Commands
- `npm install` — install dependencies (Node 20+ recommended; repo scripts target port 7788).
- `npm run dev` — start the Next.js dev server at http://localhost:7788.
- `npm run build` — create the production bundle.
- `npm start` — run the built app on port 7788.
- `npm run lint` — Next.js/ESLint checks; run before sending changes.

## Coding Style & Naming Conventions
- TypeScript with strict mode enabled (`tsconfig.json`); prefer functional React components and hooks.
- Keep 2-space indentation and use the `@/*` path alias for shared modules.
- If you add static assets, use lowercase, dash/underscore-safe filenames under `public/`.
- Favor server components unless interactivity requires `'use client'` (as in `app/page.tsx`).

## Testing Guidelines
- Lint (`npm run lint`) is the primary automated check.
- Manual QA: confirm cards render correctly, audio plays, and hover/active states look right across viewport sizes.

## Commit & Pull Request Guidelines
- Follow short, imperative commit titles (e.g., `Add image cache guard`, `Update card layout`); keep scope tight.
- PRs should include: what changed, why, screenshots for UI updates, steps to reproduce/test, and any env/config updates.
- Link related issues when available and note any new files added under `public/`.

## Security & Configuration Notes
- No third-party API keys are required; keep `.env*` files out of version control if you add environment settings later.
- Static assets under `public/` are served as-is; avoid committing large binaries unless necessary.
