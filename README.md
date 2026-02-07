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

You will implement an ability to select a words to learn, so user can choose to learn only a subset of the words.

- [ ] Selected words will be stored in localStorage under the key `SELECTED_WORDS_TO_LEARN` as an array of strings.
  Develop `SelectedWordsStorage` class in `lib/selectedWordsStorage.ts` with CRUD methods to manage the selected words.
- [ ] In All Words window add a button "Select Words to Learn". When user clicks it:
    - [ ] Button gets highlighted with the same animation as correct option in the quiz games.
    - [ ] User is able to click on a card to select it or unselect it (`SelectedWordsStorage::addWord` and
      `SelectedWordsStorage::removeWord` methods).
    - [ ] Selected cards get a border highlight.
    - [ ] Button text changes to "Done Selecting".
- [ ] When user clicks "Done Selecting" button:
    - [ ] Button highlight is removed.
    - [ ] User is no longer able to select/unselect cards.
    - [ ] Button text changes back to "Select Words to Learn".
- [ ] Develop Cypress tests to cover all of this functionality of words selection.
- [ ] In the quiz games (Guess The Word and Listen & Guess) only the selected words will be used. If no words are
  selected, all words will be used as before.
- [ ] `GameConfigModal` component will have the new button: `Selected Words`
    - [ ] When clicked, it starts the game only with the selected words. Modify `GameManager::startTheGame` to use
      `SelectedWordsStorage::getSelectedWords` method to get the list of selected words.
    - [ ] Modify `GameManager::startTheGame` to accept `config: Partial<GameRules>` and remove
      `setConfig(config: Partial<GameRules>)` method. With this modification you will simplify the game start logic.
- [ ] Mark tasks as done when completed (do not commit to git, not allowed)
- [ ] Ensure Cypress tests pass as well as Jest tests. If any tests fail, fix the issues and ensure all tests pass before marking tasks as done.