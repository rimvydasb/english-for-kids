'use client';

import { useMemo } from 'react';
import GuessGamePage from '../guess/GuessGamePage';
import { GuessTheWordGameManager } from '@/lib/game/WordGameManager';
import { WORDS_DICTIONARY } from '@/lib/words';

export default function GuessTheWordPage() {
    const gameManager = useMemo(() => new GuessTheWordGameManager(WORDS_DICTIONARY), []);
    return <GuessGamePage gameManager={gameManager} />;
}
