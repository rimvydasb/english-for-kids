# English Learner

A Next.js application for learning English words with pronunciation. Browse illustrated cards with text-to-speech or
play a guessing game to memorize vocabulary.

## Overview

- Main menu with navigation to learning cards and the Guess Word Game
- Interactive word cards with click-to-pronounce functionality
- Nine illustrated words: apple, crayon, desk, dog, egg, farm, fish, painting, pencil
- Keyboard shortcut: press `X` on subpages to return to the main menu
- Real-time visual feedback when a word is being pronounced
- Responsive design that works on desktop, tablet, and mobile devices
- Built-in text-to-speech using the Web Speech API (no external audio files needed)

## Features

- All Words page: image + word cards with click-to-pronounce and `X` shortcut back to menu
- Guess Word Game: view the image, pick 1 of 5 options, hear pronunciation, and see your score
- Scoreboard shows learned words / total and percentage (100 / total * correctly guessed)
- Score persists in the browser so progress survives navigating away

## Technology Stack

### Frontend Framework

- **Next.js 16.0.5** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5.9.3** - Type-safe JavaScript

### UI Components & Styling

- **Material UI (MUI) 7.3.5** - React component library
- **MUI Icons Material 7.3.5** - Material Design icons
- **Emotion 11.14.0** - CSS-in-JS library (required by MUI)
- **@mui/material-nextjs** - MUI integration for Next.js App Router

### Development Tools

- **Node.js v25.2.0** - JavaScript runtime
- **npm 11.6.2** - Package manager
- **TypeScript** - Static type checking

## Project Structure

```
EnglishLearner/
├── app/
│   ├── layout.tsx          # Root layout with MUI theme provider
│   ├── page.tsx            # Main menu with navigation
│   ├── guess/page.tsx      # Guess Word Game (image-first quiz)
│   └── words/page.tsx      # All Words listing with audio playback
├── lib/
│   └── words.ts            # WORDS_DICTIONARY and WordRecord helpers
├── theme.ts                # Material UI theme configuration
├── next.config.js          # Next.js configuration
├── public/images/          # Static PNGs for each word card
├── tsconfig.json           # TypeScript configuration
├── package.json            # Project dependencies and scripts
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher (recommended: v25.2.0)
- npm 10.0.0 or higher

### Installation

1. Install dependencies:

```bash
npm install
```

### Running the Application

#### Development Mode

Start the development server on port 7788:

```bash
npm run dev
```

The application will be available at [http://localhost:7788](http://localhost:7788)

#### Production Build

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Available Scripts

- `npm run dev` - Start development server on port 7788
- `npm run build` - Create production build
- `npm start` - Start production server on port 7788
- `npm run lint` - Run Next.js linting

## How It Works

### Pronunciation

- Uses the browser's Web Speech API to speak each word—no external audio files.
- Clicking a card triggers speech synthesis, highlights the active card, and clears the state when playback ends.

### Images

- Each word has a matching PNG in `public/images/{word}.png`.
- `lib/words.ts` exports `WORDS_DICTIONARY` (a list of `WordRecord`s) that powers the cards and image paths.

### User Experience

1. Click on any word card.
2. The card scales up and changes color to show it's active.
3. Speech synthesis pronounces the word.
4. The card returns to normal state when playback is complete.

### Adding More Words

1. Add a square-ish PNG to `public/images/` named with the lowercase word (e.g., `sun.png`).
2. Append `new WordRecord({ word: 'sun' })` to `WORDS_DICTIONARY_DATA` in `lib/words.ts`.
3. Restart dev server if running, then verify the new card appears with speech playback.

## Next Steps

Improve WordCard:

- [x] Implement `WordCardMode` different modes as per table:

| Mode           | Image | Word | Pronunciation | Translation | Description                                                      |
|----------------|-------|------|---------------|-------------|------------------------------------------------------------------|
| Learning       | ✓     | ✓    | ✓             | ✓           | Current mode with image and word displayed in All Words section  |
| GuessWord      | ✓     | ✗    | ✓             | ✓           | Word is replaced by ???                                          |
| ListenAndGuess | ✗     | ✗    | ✓             | ✗           | Instead of image ? mark is displayed and word is replaced by ??? |

Improve Guess Word Game:

- [x] Options Mode

| Mode          | Description                         | When Correct             | When Incorrect      |
|---------------|-------------------------------------|--------------------------|---------------------|
| WordModel     | Word is shown as text option        | Highlight and play sound | Shake and color red |
| TranslateMode | Word translation is shown as option | Only Highlight           | Shake and color red |

- [x] Split game into multiple variants:

| Variant        | Game Type          | Card Mode      | Options Mode  | Description                                                                 |
|----------------|--------------------|----------------|---------------|-----------------------------------------------------------------------------|
| Guess The Word | GuessWordGame      | GuessWord      | WordModel     | Random 5 word options are displayed and user needs to pick the correct one  |
| Listen & Guess | ListenAndGuessGame | ListenAndGuess | TranslateMode | No image is shown, user hears the word and picks translation from 5 options |

### Score Persistence

- [x] Each word has its own global statistics that are persisted in `localStorage` as "GLOBAL_WORD_STATS"
- [x] Show total attempts, correct attempts, wrong attempts per word
- [x] Each game variant has internal statistics that are also persisted in `localStorage`
1. Guess The Word variant stats stored as "GUESS_THE_WORD_STATS"
2. Listen & Guess variant stats stored as "LISTEN_AND_GUESS_STATS"

- [x] After each game statistics can be reset via a button on the end game page

- [x] Game Start:
1. `WORDS_DICTIONARY_DATA` is read to get the list of words and empty statistics are initialized if not present in localStorage
2. When a game starts or continues, the relevant statistics are loaded from localStorage
3. During the game, each attempt updates the statistics in memory and `localStorage`
4. Game randomly picks the word that has `correctAttempts` as 0 or `learned` is false
5. When user clicks a wrong option, then that option word's `wrongAttempts` is increased and `learned` is set to false
6. When user clicks the correct option, then that option word's `correctAttempts` is increased and `learned` is set to true
7. Game picks any random word as an option from absolutely all words in `WORDS_DICTIONARY_DATA`

- [x] Game finish:
1. Game finishes when all words have `learned` set to true and `correctAttempts` > 0
2. When user finishes the game, the statistics are saved to localStorage
3. When user selects a game or game is finished, then `FinishedSummary` is shown with the statistics summary
4. `FinishedSummary` has a reset button that clears the statistics from localStorage and memory

- [x] Guess is correct
1. Play pronunciation of the word again
2. Other options immediately disappear, but they still take that empty space, so the layout doesn't shift and correct option stays in the same place
3. Only the correct option is immediately highlighted with quick random animation similar to main menu `Learn English` animation
4. Statistics are updated in `localStorage` and memory
5. `WordCard` component mode is set to `WordCardMode.Learning` so the user will see the image and word
6. Below the options, a Next button appears to continue to the next word

- [x] Guess is incorrect
1. The selected wrong option shakes and turns red briefly
2. The selected wrong option's `learned` is set to false in statistics

- [x] Mark tasks completed in README.md when done

- [ ] Listen & Guess AND Guess The Word games are two different distinct games.
They both use `GUESS_THE_WORD_STATS` and `LISTEN_AND_GUESS_STATS` respectively to track their own statistics separately.
- [ ] `GLOBAL_WORD_STATS` are updated only at the end of each game variant.
- [ ] Introduce `GlobalWordStatistics` as a subset of `WordStatistics`. `GLOBAL_WORD_STATS` only saves `GlobalWordStatistics` records.

```typescript
interface GlobalWordStatistics {
    word: string;
    correctAttempts: number;
    wrongAttempts: number;
}


interface WordStatistics extends GlobalWordStatistics {
    learned: boolean;
    totalAttempts: number;
}
```

- [ ] `FinishedSummary.tsx` has only one button "Restart" that clears only the relevant game 
statistics from localStorage and memory to restart the game.
- [ ] Review linting problems for `Unused parameter ...` and remove unnecessary parameters from functions and components.
- [ ] Remove explanation `Pick the correct option below. The card stays put until you answer correctly.`
and `Pick the correct option below. The card stays put until you answer correctly.`.
No excessive instructions needed in the game!
- [ ] Other options immediately disappear, but they still take that empty space, so the layout doesn't shift and correct option stays in the same place
- [ ] `VariantStats` must have `learnedWordsCount` and `totalWordsCount` - show them as well.