# Repository Guidelines

## Project Structure & Modules

- `app/page.tsx` is the main menu linking to `app/words/page.tsx` (all word cards) and `app/guess/page.tsx` (guessing game); `app/layout.tsx` wraps the MUI theme from `app/ThemeRegistry.tsx` / `theme.ts`.
- `lib/words.ts` holds `WORDS_DICTIONARY` (JSON-style word list) and `WordRecord` with `getImageUrl()`. Keep entries aligned with PNGs in `public/images/`.
- Static assets live under `public/images/` with lowercase filenames that match each word (e.g., `crayon.png`). Avoid adding assets outside `public/`.
- No Gemini or other external AI integrations should be added; the app relies solely on local assets and browser speech synthesis.

## Build, Test, and Development Commands

- `npm install` — install dependencies (Node 25+ recommended; scripts target port 7788).
- `npm run dev` — start the Next.js dev server at http://localhost:7788.
- `npm run build` — create the production bundle.
- `npm start` — run the built app on port 7788.
- `npm run lint` — Next.js/ESLint checks; run before shipping changes.
- `npm run format` — run Prettier to format the codebase.

### Cypress Testing

Running Cypress on existing server:

- Use the helper script `bin/test-cypress.sh` to safely start the server.
- The most important test is be `health.cy.ts` - if this test fails, there's no reason to continue with other tests.
  Warn use if health check fails!
- For failed test cases, search images in `cypress/screenshots` and analyze them to identify UI issues.
- You can add `datatest-id` attributes to elements to simplify Cypress selector scoping. However, button search and
  click should happen by text content to mimic user behavior.
- Tests must manually clear IndexedDB (`edgerules-modeler`) to ensure a clean state, as the app persists
  data locally.

**Executing all tests or individual ones:**

```bash
./bin/test-cypress.sh
```

Or run specific spec:

```bash
./bin/test-cypress.sh --spec "cypress/e2e/health.cy.ts"
```

## Coding Style & Naming Conventions

- TypeScript with strict settings; prefer functional React components and hooks.
- Use 4-space indentation and aim for 120-character lines.
- Apply the `@/*` alias for shared modules. Default to server components unless interactivity demands `'use client'` (navigation, speech, game state).
- Component and file names should be descriptive (`GuessWordGame`, `WordsPage`). Keep static filenames lowercase with safe characters.

## Testing Guidelines

- Automated: `npm run lint` is the baseline.
- Manual checks: main menu navigation, `X` shortcut on subpages, All Words page shows all images and plays audio on click, Guess Word Game presents 5 options, speaks the word, updates the learned/total scoreboard, and persists score in the browser.

## Commit & Pull Request Guidelines

- Use clear, conventional commits (e.g., `feat: add guess word game`, `fix: guard speech synthesis errors`).
- Pull requests should outline the change, link issues, and include screenshots or GIFs for UI updates; mention any manual test steps run.

## Security & Configuration Notes

- No third-party API keys are required; if environment variables are added later, keep `.env*` out of version control.
- Static assets are served as-is from `public/`; ensure newly added images are safe, licensed, and optimized.
