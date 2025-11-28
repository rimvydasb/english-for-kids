# English Learner

A Next.js application for learning English words with pronunciation. Browse illustrated cards with text-to-speech or play a guessing game to memorize vocabulary.

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
│   └── words.ts            # WRODS_DICTIONARY and WordRecord helpers
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
- `lib/words.ts` exports `WRODS_DICTIONARY` (a list of `WordRecord`s) that powers the cards and image paths.

### User Experience

1. Click on any word card.
2. The card scales up and changes color to show it's active.
3. Speech synthesis pronounces the word.
4. The card returns to normal state when playback is complete.

### Adding More Words

1. Add a square-ish PNG to `public/images/` named with the lowercase word (e.g., `sun.png`).
2. Append `new WordRecord('sun')` to `WRODS_DICTIONARY` in `lib/words.ts`.
3. Restart dev server if running, then verify the new card appears with speech playback.

## Next Steps

Improve WordCard:

- [ ] When WordCard itself is clicked it flips and shows the word translation instead of the CardMedia.
- [ ] When flipped back, the image is shown again.

Refactor guess/page.tsx to use WordCard component.

- [ ] For the word to be guessed, use the same WordCard, but replace the english word with "???".

