'use client';

import {useMemo} from 'react';
import PhraseGuessGamePage from './PhraseGuessGamePage';
import {PhasesGameManager} from '@/lib/game/PhasesGameManager';
import {PHRASES_DICTIONARY} from '@/lib/phrases';

export default function GuessPhrasesPage() {
    const gameManager = useMemo(() => new PhasesGameManager(PHRASES_DICTIONARY), []);
    return <PhraseGuessGamePage gameManager={gameManager} />;
}
