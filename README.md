# English Learner

Next.js app for kids to learn vocabulary with images, speech, and two quiz variants.

## What’s Inside

- All Words: flip through illustrated cards; tap to hear pronunciation.
- Guess The Word: see the image (WordCard Guess mode), pick the matching word; options show text.
- Listen & Guess: hear the word (WordCard Listen mode), pick the correct translation.
- Guess Phrases: read and hear English phrases, then choose the right Lithuanian translation.
- Twenty-three bundled words with matching PNGs in `public/images/`.

## Gameplay Behavior

- On correct guess: replay speech, hide other options without shifting layout, rainbow-glow the right option, switch
  card to Learning mode, then show Next/Finish.
- On wrong guess: selected option shakes and flashes red; its learned flag is cleared.
- Guess header: left game icon, center progress bar made of small boxes (one per word); boxes fill with animated blue
  gradient when learned.
- Finish screen shows stats and a rainbow “Great job!”; game restart clears only the current variant stats. Separate
  control resets global stats.

## Statistics & Persistence

- Per-variant word stats stored in localStorage as `GUESS_THE_WORD_STATS` and `LISTEN_AND_GUESS_STATS`; track attempts,
  correctness, learned flags.
- `GLOBAL_WORD_STATS` holds aggregated correct/wrong counts; updated when a variant is finalized, not on every attempt.
- Phrases game uses `PHRASES_GUESS_STATS` for in-game tracking and `GLOBAL_PHRASE_STATS` for aggregated counts.
- In-memory and localStorage stay in sync; global reset clears only global records, variant reset clears only that
  variant.

## Pronunciation & Assets

- Speech via the browser Web Speech API; no external audio.
- Images live at `public/images/{word}.png`. Word data is stored in `lib/WORDS_DICTIONARY_DATA.ts` and exposed via
  `lib/words.ts` (`WordRecord`, `WORDS_DICTIONARY`).
- Phrases live in `lib/Config.ts` and flow through `lib/phrases.ts` (`PHRASES_DICTIONARY`);
  phrases are text-only with speech. Shared models live in `lib/types.ts`.

## Development

- Node 25+ recommended. Install with `npm install`.
- Scripts: `npm run dev` (port 7788), `npm run build`, `npm start`, `npm run lint`.

## Games Configuration

WordCard properties:

- showImage: whether to show image on the card
- showTranslation: whether to show Lithuanian translation under the card
- showWord: whether to show English word on the card
- showWordPronunciation: whether to show pronunciation icon `VolumeUpIcon` to hear the word

Option Button properties:

- showWordPronunciation: whether to show pronunciation icon `VolumeUpIcon` to hear the option word
- showOptionText: whether to show option text (English word or Lithuanian translation)
- optionWord: word in the option button (English word or Lithuanian translation), optional

| Name           | WordCardMode   | showImage | showTranslation | showWord | showWordPronunciation | options     | optionPronunciation |
|----------------|----------------|-----------|-----------------|----------|-----------------------|-------------|---------------------|
| Guess The Word | GuessWord      | true      | true            | false    | false                 | word        | true                |
| Listen & Guess | ListenAndGuess | false     | false           | false    | true                  | translation | false               |
| Guess Phrases  |                | false     | false           | true     | true                  | translation | false               |

## Next Steps

You will implement specific game rules for each game variant. Follow the checklist below:

- [ ] When I select any game, Material UI `Modal` opens with following options that are common for each game:
    - [ ] First row options: 5 words, 20 words, all words
    - [ ] Second row options: Any words, Numbers, Colors, Nouns, Adjectives
- [ ] Styling: each option is toggled button; when selected, button background color changes to indicate selection
- [ ] Styling: selected game option button should be animated with pulse effect to indicate it is selected
- [ ] As a default none of button is selected; user must select one option from each row to start the game. When
  remaining option is selected, do 1-second delay and start the game with selected options.
- [ ] Start using `GameRules` new fields `totalInGameSubjectsToLearn` and `selectedWordEntryTypes`. For now only one
  `selectedWordEntryTypes` is possible, but array is used for the future. If `selectedWordEntryTypes` is empty, the use
  all types.
- [ ] Implement and start using `totalInGameSubjectsToLearn`. If all words are selected, use
  `TOTAL_IN_GAME_SUBJECTS_TO_LEARN` constant value from `lib/Config.ts`.
- [ ] Update tests to cover start game rules.