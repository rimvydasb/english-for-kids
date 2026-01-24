'use client';

import {useMemo} from 'react';
import GuessGamePage from '../guess/GuessGamePage';
import {ListenAndGuessGameManager} from '@/lib/game/WordGameManager';
import {WORDS_DICTIONARY} from '@/lib/words';

export default function ListenAndGuessPage() {
    const gameManager = useMemo(() => new ListenAndGuessGameManager(WORDS_DICTIONARY), []);
    return <GuessGamePage gameManager={gameManager} />;
}
