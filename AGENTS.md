# Repository Guidelines

## Project Structure & Modules
- `app/page.tsx` hosts the interactive word cards and speech playback; `app/layout.tsx` wraps the MUI theme from `app/ThemeRegistry.tsx` / `theme.ts`.
- `lib/words.ts` defines `WRODS_DICTIONARY` and `WordRecord` (image URL helper) that drive the card list.
- `public/images/` holds the PNGs used for each word; filenames match the lowercase word.

## Build, Test, and Development Commands
- `npm install` — install dependencies (Node 25+ recommended; repo scripts target port 7788).
- `npm run dev` — start the Next.js dev server at http://localhost:7788.
- `npm run build` — create the production bundle.
- `npm start` — run the built app on port 7788.
- `npm run lint` — Next.js/ESLint checks; run before sending changes.

## Coding Style & Naming Conventions
- TypeScript with strict mode enabled (`tsconfig.json`); prefer functional React components and hooks.
- Keep 4-space indentation and 120 line length.
- Use the `@/*` path alias for shared modules.
- Static assets belong under `public/` with lowercase, dash/underscore-safe filenames.
- Favor server components unless interactivity requires `'use client'` (as in `app/page.tsx`); speech synthesis runs client-side only.

## Testing Guidelines
- Lint (`npm run lint`) is the primary automated check.
- Manual QA: confirm cards render correctly, audio plays, and hover/active states look right across viewport sizes.

## Security & Configuration Notes
- No third-party API keys are required; keep `.env*` files out of version control if you add environment settings later.
- Static assets under `public/` are served as-is
