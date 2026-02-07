# Repository Guidelines

## Project Structure & Modules

### Core Pages

- `app/page.tsx`: Main menu linking to sub-games and learning pages.
- `app/words/page.tsx`: "All Words" page. Displays all words with flip cards for translation/pronunciation. **Includes "Restart All Games" functionality** at the bottom to reset in-game progress.
- `app/guess/page.tsx`: Entry point for guessing games.
- `app/layout.tsx`: Root layout, wraps the MUI theme (`app/ThemeRegistry.tsx`).

### Game Logic & Statistics (`lib/`)

- **Configuration**: `lib/Config.ts` contains global game constants (e.g., `TOTAL_IN_GAME_SUBJECTS_TO_LEARN`), storage keys, and the source data for `WORDS_DICTIONARY` and `PHRASES_DICTIONARY`.
- **Game Managers** (`lib/game/`):
    - `GameManager.ts`: Base class for game logic (selection, progression).
    - `WordGameManager.ts` & `PhasesGameManager.ts`: Specialized managers for word and phrase-based games.
- **Statistics** (`lib/statistics/`):
    - `AStatisticsManager.ts`: Base class for handling statistics. Implements the core logic for **Global** (long-term) vs **In-Game** (session) stats.
    - `WordStatisticsManager.ts` & `PhrasesStatisticsManager.ts`: Concrete implementations.
    - **Storage**: Stats are persisted in `localStorage`. Keys are defined in `lib/Config.ts`.

### Assets & Data

- `lib/words.ts` & `lib/phrases.ts`: Expose the dictionary objects (`WordRecord`, `PhraseRecord`) used throughout the app.
- `public/images/`: Static assets. Filenames must match the word (lowercase, e.g., `crayon.png`).

## Statistics Architecture

The application maintains two types of statistics (persisted in `localStorage`):

1.  **Global Statistics**: Long-term tracking of correct/wrong answers for every word/phrase across all game modes. Used to determine difficulty and sort items.
2.  **In-Game Statistics**: Tracks progress for the current "run" or game session. Can be reset via "Restart All Games".

## Build, Test, and Development Commands

- `npm install` — install dependencies (Node 25+ recommended).
- `npm run dev` — start Next.js dev server at `http://localhost:7788`.
- `npm run build` — create production bundle.
- `npm start` — run built app.
- `npm run lint` — Next.js/ESLint checks.
- `npm run format` — run Prettier.

### Image Optimization

Resize/optimize new PNGs:

```bash
magick mogrify -resize '1024x1024>' -define png:compression-filter=5 -define png:compression-level=9 -define png:compression-strategy=1 public/images/*.png
```

### Cypress Testing

**Helper Script:**
Use `bin/test-cypress.sh` to safely start the server and run tests.

```bash
# Run all tests
./bin/test-cypress.sh

# Run specific spec
./bin/test-cypress.sh --spec "cypress/e2e/restart_games.cy.ts"
```

- **Health Check**: `cypress/e2e/health.cy.ts` is the critical smoke test.
- **State Manipulation**: Tests like `restart_games.cy.ts` demonstrate how to inject `localStorage` state to verify game logic.
- **Debugging**: Check `cypress/screenshots` for failures.

## Coding Style & Naming Conventions

- **TypeScript**: Strict mode. Prefer functional React components/hooks.
- **Formatting**: 4-space indentation, 120-char line limit.
- **Imports**: Use `@/*` alias.
- **Client vs Server**: Default to Server Components. Use `'use client'` only when necessary (interactivity, hooks).

## Testing Guidelines

- **Automated**: `npm run lint` + Cypress tests.
- **Manual Checks**:
    - **All Words Page**: Check images, audio, and the "Restart All Games" button (ensure it resets game progress but keeps global stats).
    - **Games**: Verify game loops, score updates, and persistence.

## Commit & Pull Request Guidelines

- **Commits**: Conventional commits (e.g., `feat: add reset button`, `fix: stats calculation`).
- **PRs**: Description, issue links, screenshots for UI changes.

## Security & Configuration Notes

- No external AI/API integrations.
- Local assets only.
- No sensitive keys required.

# Banned Actions

- **Git**: Do NOT commit/push automatically. Only perform git operations if explicitly requested.
