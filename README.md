# English Learner

Next.js app for kids to learn vocabulary with images, speech, and two quiz variants.

## What’s Inside
- All Words: flip through illustrated cards; tap to hear pronunciation.
- Guess The Word: see the image (WordCard Guess mode), pick the matching word; options show text.
- Listen & Guess: hear the word (WordCard Listen mode), pick the correct translation.
- Nine bundled words with matching PNGs in `public/images/`.

## Gameplay Behavior
- On correct guess: replay speech, hide other options without shifting layout, rainbow-glow the right option, switch card to Learning mode, then show Next/Finish.
- On wrong guess: selected option shakes and flashes red; its learned flag is cleared.
- Guess header: left game icon, center progress bar made of small boxes (one per word); boxes fill with animated blue gradient when learned.
- Finish screen shows stats and a rainbow “Great job!”; game restart clears only the current variant stats. Separate control resets global stats.

## Statistics & Persistence
- Per-variant word stats stored in localStorage as `GUESS_THE_WORD_STATS` and `LISTEN_AND_GUESS_STATS`; track attempts, correctness, learned flags.
- `GLOBAL_WORD_STATS` holds aggregated correct/wrong counts; updated when a variant is finalized, not on every attempt.
- In-memory and localStorage stay in sync; global reset clears only global records, variant reset clears only that variant.

## Pronunciation & Assets
- Speech via the browser Web Speech API; no external audio.
- Images live at `public/images/{word}.png`. Word list and helpers are in `lib/words.ts` (`WordRecord`, `WORDS_DICTIONARY_DATA`/`WORDS_DICTIONARY`).

## Development
- Node 25+ recommended. Install with `npm install`.
- Scripts: `npm run dev` (port 7788), `npm run build`, `npm start`, `npm run lint`.
