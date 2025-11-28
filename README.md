# English Learner

A single-page application for learning English words with pronunciation. Click on any word to hear how it's pronounced using text-to-speech technology.
Play interactive games to memorize vocabulary effectively.

## Overview

- Interactive word cards with click-to-pronounce functionality
- Four illustrated words: crayon, desk, painting, pencil
- Real-time visual feedback when a word is being pronounced
- Responsive design that works on desktop, tablet, and mobile devices
- Built-in text-to-speech using the Web Speech API (no external audio files needed)

## Features

### First Page Menu

- [ ] Start Learning Words (forwards to the page with word cards)
- [ ] Play Guess Word Game (forwards to the Guess Word Game page)

### All words

- [ ] List all words with images in one page

### Guess Word Game

- [ ] Show image only, user guesses the word from 5 different options
- [ ] User can also click to hear the pronunciation of the word
- [ ] Show score in the top right corner: Learned words / Total words, Score
- [ ] Score is calculated as: 100 / Total words * Correctly guessed words

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
│   └── page.tsx            # Main page with word cards
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

## Browser Compatibility

Speech synthesis is supported in all modern browsers, though available voices may differ slightly:
- Chrome/Edge (full support)
- Safari (full support)
- Firefox (full support)
- Opera (full support)

No special configuration needed—if speech synthesis is unavailable, an on-page error appears.

## Customization

### Changing the Theme

Edit `app/ThemeRegistry.tsx` to customize colors, typography, and other theme settings:

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Change this
    },
  },
});
```

### Adjusting Port

The application runs on port 7788 by default. To change it, edit the scripts in `package.json`:

```json
"scripts": {
  "dev": "next dev -p YOUR_PORT",
  "start": "next start -p YOUR_PORT"
}
```

## Development Best Practices

This project follows React and Next.js best practices:

- **Server Components by default** - Only using 'use client' where necessary (for interactivity)
- **TypeScript** - Full type safety throughout the application
- **Component composition** - Clean, reusable component structure
- **Responsive design** - Mobile-first approach with Material UI Grid system
- **Accessibility** - Semantic HTML and ARIA-friendly MUI components
- **Error handling** - Graceful fallbacks for unsupported features

## License

This project is open source and available for educational purposes.

## Contributing

Feel free to submit issues and enhancement requests!
