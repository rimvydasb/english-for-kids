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

## Phrases List

| English phrase                | Lithuanian translation                 |
|-------------------------------|----------------------------------------|
| The Hello Song                | Pasisveikinimo daina                   |
| Hello                         | Labas                                  |
| Hello, hello                  | Labas, labas                           |
| How are you today?            | Kaip šiandien sekasi?                  |
| How are you?                  | Kaip tu laikaisi?                      |
| And how about you?            | O kaip tau?                            |
| How about you?                | O kaip tu? / O tavo?                   |
| I’m fine, thank you           | Man viskas gerai, ačiū                 |
| I’m fine, thank you.          | Puikiai, ačiū.                         |
| What’s your name?             | Koks tavo vardas?                      |
| My name is Ariele             | Mano vardas yra Arielė                 |
| Goodbye!                      | Viso gero!                             |
| What's your favourite colour? | Kokia yra tavo mėgstamiausia spalva?   |
| My favourite colour is red.   | Mano mėgstamiausia spalva yra raudona. |
| My favourite colour is green. | Mano mėgstamiausia spalva yra žalia.   |
| What's this?                  | Kas tai?                               |
| It's a desk.                  | Tai yra rašomasis stalas.              |
| Is it a plane?                | Ar tai lėktuvas?                       |
| Yes, it is.                   | Taip, tai yra.                         |
| No, it isn't.                 | Ne, tai nėra.                          |

## Word List

| English  | Lithuanian       |
|----------|------------------|
| apple    | obuolys          |
| baloon   | balionas         |
| black    | juodas           |
| brown    | rudas            |
| cat      | katė             |
| crayon   | kreidelė         |
| desk     | rašomasis stalas |
| dog      | šuo              |
| egg      | kiaušinis        |
| elephant | dramblys         |
| farm     | ferma            |
| fish     | žuvis            |
| green    | žalias           |
| notebook | sąsiuvinis       |
| pencil   | pieštukas        |
| pink     | rožinis          |
| plain    | lyguma           |
| puppet   | lėlė             |
| purple   | violetinis       |
| red      | raudonas         |
| teddy    | meškiukas        |
| white    | baltas           |
| yellow   | geltonas         |

# Phrases Guess Game

- [x] Create the new page `/guess-phrases` similar to `/guess-the-word`.
- [x] Instead of `WordCard.tsx` create `PhraseCard.tsx` that shows an English phrase with pronunciation icon
- [x] Below the phrase show multiple Lithuanian translation options to choose from.
- [x] User is able to see the English phrase in `PhraseCard.tsx`, listen for english pronunciation, and pick the correct
  Lithuanian translation from the options.
- [x] Implement the same game logic, statistics tracking, and persistence as in the existing word guessing games.
- [x] Use the phrases list provided in the README for the game content.
- [x] Implement `PhrasesStatisticsManager.ts` and `PhrasesStatisticsManager.test.ts`
- [x] Add all phrases from Phrases List to `PHRASES_DICTIONARY_DATA`
- [x] Add new Game in the main menu to access the Phrases Guess Game.

## Next Steps:

- [ ] Split WordsGameManager to GuessTheWordGameManager and ListenAndGuessGameManager for better separation of concerns.
- [ ] GuessTheWordGameManager, ListenAndGuessGameManager and PhasesGameManager draws subjects based on
  GlobalConfig.TOTAL_IN_GAME_SUBJECTS_TO_LEARN so subjects will be constructed in constructor (not accepted by it)
- [ ] Use DEFAULT_DECOYS from GlobalConfig
- [ ] Game managers will be constructed in page.tsx files (GuessTheWordPage, ListenAndGuessPage, GuessPhrasesPage)
- [ ] `GameVariant` will be returned by game managers

### Do a complete refactoring and simplification of statistics management:

- [ ] Create a base class `BaseStatisticsManager` that will handle common statistics logic
- [ ] `BaseStatisticsManager` will accept:
    - `storageKey: string` in the constructor to handle localStorage operations
    - `globalStorageKey: string` in the constructor to handle global statistics updates
    - storage (for testing the mock will be passed)
- [ ] global statistics should not live in global state, but must be updated in localStorage only when a game variant is finalized.
Global statistics are used in GUI only in `words/page.tsx`
- [ ] Rename `GeneralPhraseVariantStats` to `InGameAggregatedStatistics`
- [ ] `BaseStatisticsManager` will have a method:
  `recordAttempt(current: InGameStatsMap, subject: string, isCorrect: boolean): InGameStatsMap`
1. This method will update in-game statistics map with the new attempt and will return the updated map.
2. This method will persist to local storage only the updated in-game statistics map.
3. This method will NOT update global statistics yet.
- [ ] `BaseStatisticsManager` will also provide aggregation method:
  `aggregate(current: InGameStatsMap): InGameAggregatedStatistics`
- [ ] `BaseStatisticsManager` will have a method to finalize the variant:
  `finishGame(current: InGameStatsMap): InGameAggregatedStatistics`
1. `GlobalStatistics` will be updated based on `globalStorageKey`
2. `InGameStatsMap` will NOT be cleared from localStorage
3. `InGameAggregatedStatistics` will be returned based on current in-game statistics map
- [ ] `BaseStatisticsManager` will have a method to reset global statistics:
  `resetGlobalStatistics(): void`
- [ ] `BaseStatisticsManager` will have a method to reset in-game statistics:
  `resetInGameStatistics(): void`