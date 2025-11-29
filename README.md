# English Learner

Next.js app for kids to learn vocabulary with images, speech, and two quiz variants.

## What’s Inside

- All Words: flip through illustrated cards; tap to hear pronunciation.
- Guess The Word: see the image (WordCard Guess mode), pick the matching word; options show text.
- Listen & Guess: hear the word (WordCard Listen mode), pick the correct translation.
- Nine bundled words with matching PNGs in `public/images/`.

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
- In-memory and localStorage stay in sync; global reset clears only global records, variant reset clears only that
  variant.

## Pronunciation & Assets

- Speech via the browser Web Speech API; no external audio.
- Images live at `public/images/{word}.png`. Word list and helpers are in `lib/words.ts` (`WordRecord`,
  `WORDS_DICTIONARY_DATA`/`WORDS_DICTIONARY`).

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
| red      | raudonas         |
| green    | žalias           |
| blue     | mėlynas          |
| yellow   | geltonas         |
| orange   | oranžinis        |
| purple   | violetinis       |
| pink     | rožinis          |
| brown    | rudas            |
| black    | juodas           |
| white    | baltas           |
| pencil   | pieštukas        |
| crayon   | kreidelė         |
| notebook | sąsiuvinis       |
| chair    | kėdė             |
| desk     | rašomasis stalas |
| egg      | kiaušinis        |
| elephant | dramblys         |
| farm     | ferma            |
| fish     | žuvis            |
| balloon  | balionas         |
| puppet   | lėlė             |
| teddy    | meškiukas        |
| robot    | robotas          |
| plane    | lėktuvas         |

# Phrases Guess Game

- [ ] Create the new page `/guess-phrases` similar to `/guess-the-word`.
- [ ] Instead of `WordCard.tsx` create `PhraseCard.tsx` that shows an English phrase with pronunciation icon
- [ ] Below the phrase show multiple Lithuanian translation options to choose from.
- [ ] User is able to see the English phrase in `PhraseCard.tsx`, listen for english pronunciation, and pick the correct Lithuanian translation from the options.
- [ ] Implement the same game logic, statistics tracking, and persistence as in the existing word guessing games.
- [ ] Use the phrases list provided in the README for the game content.
- [ ] Implement `PhrasesStatisticsManager.ts` and `PhrasesStatisticsManager.test.ts`
- [ ] Add all phrases from Phrases List to `PHRASES_DICTIONARY_DATA`
- [ ] Add new Game in the main menu to access the Phrases Guess Game.

## Phrase Statistics & Persistence

```typescript
export interface PhraseEntry {
    phrase: string;
    translation?: string;
}

export const PHRASES_DICTIONARY_DATA: PhraseEntry[] = [...];
```

```typescript
export interface GlobalPhraseStatstics {
    phrase: string;
    correctAttempts: number;
    wrongAttempts: number;
}

export interface InGamePhraseStatstics extends GlobalPhraseStatstics {
    totalAttempts: number;
    learned: boolean;
}
```

## Clarifications

- phrase does not have an image, only text and speech