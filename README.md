# English Learner

A single-page application for learning English words with pronunciation. Click on any word to hear how it's pronounced using text-to-speech technology.

## Features

- Interactive word cards with click-to-pronounce functionality
- Three words to learn: car, robot, spoon
- Real-time visual feedback when a word is being pronounced
- Responsive design that works on desktop, tablet, and mobile devices
- Built-in text-to-speech using the Web Speech API (no external audio files needed)

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
├── theme.ts                # Material UI theme configuration
├── next.config.js          # Next.js configuration
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

### Audio Pronunciation Implementation

The application uses **high-quality MP3 audio files** from Oxford Learner's Dictionaries:

- Professional British English pronunciation
- Native speaker recordings from Oxford University Press
- Crystal-clear audio quality optimized for language learning
- Uses HTML5 Audio API for playback
- Direct streaming from Oxford's CDN - no local storage needed

Each word has its audio URL configured:
```typescript
const words = [
  {
    word: 'car',
    audioUrl: 'https://www.oxfordlearnersdictionaries.com/media/english/uk_pron/c/car/car__/car__gb_1.mp3'
  },
  // ... more words
];
```

### User Experience

1. Click on any word card
2. The card scales up and changes color to show it's active
3. High-quality Oxford audio pronunciation plays instantly
4. The card returns to normal state when pronunciation is complete
5. Error messages appear if audio fails to load

### Adding More Words

To add new words with pronunciation:

1. Visit [Oxford Learner's Dictionaries](https://www.oxfordlearnersdictionaries.com/)
2. Search for your word
3. Find the audio player element and extract the MP3 URL from `data-src-mp3` attribute
4. Add the word and audio URL to the `words` array in `app/page.tsx`

## Browser Compatibility

The HTML5 Audio API is supported in all modern browsers:
- Chrome/Edge (full support)
- Safari (full support)
- Firefox (full support)
- Opera (full support)

No special configuration needed - works everywhere!

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
