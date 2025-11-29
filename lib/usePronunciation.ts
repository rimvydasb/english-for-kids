'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { WordRecord } from '@/lib/words';

interface PronounceOptions {
    allowExamples?: boolean;
    suppressPendingError?: boolean;
    suppressNotAllowedError?: boolean;
}

interface PendingPronunciation {
    word: WordRecord;
    options?: PronounceOptions;
}

export function usePronunciation() {
    const [activeWord, setActiveWord] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const lastPronouncedRef = useRef<{ word: string; timestamp: number } | null>(null);
    const pendingRef = useRef<PendingPronunciation | null>(null);
    const [voicesReady, setVoicesReady] = useState(false);

    const speakInternal = useCallback((wordData: WordRecord, options?: PronounceOptions) => {
        if (!wordData) {
            return;
        }

        const synth = synthRef.current;
        if (!synth) {
            setError('Speech synthesis is not available in this browser.');
            console.warn('[pronunciation] No speech engine available when trying to speak', wordData.word);
            return;
        }

        const now = Date.now();
        const last = lastPronouncedRef.current;
        const allowExamples = options?.allowExamples ?? true;
        const withinWindow = last && last.word === wordData.word && now - last.timestamp <= 5000;
        const hasExamples = Array.isArray(wordData.examples) && wordData.examples.length > 0;
        const shouldUseExample = allowExamples && withinWindow && hasExamples;
        const utteranceText = shouldUseExample
            ? wordData.examples![Math.floor(Math.random() * wordData.examples!.length)]
            : wordData.word;

        lastPronouncedRef.current = { word: wordData.word, timestamp: now };

        setActiveWord(wordData.word);
        setError(null);
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(utteranceText);
        console.info('[pronunciation] Speaking', {
            word: wordData.word,
            utterance: utteranceText,
            viaExample: shouldUseExample,
        });
        utterance.onend = () => setActiveWord((current) => (current === wordData.word ? null : current));
        utterance.onerror = (event) => {
            const voices = synth.getVoices();
            console.warn('[pronunciation] Speech synthesis error', {
                word: wordData.word,
                utterance: utteranceText,
                error: event?.error ?? 'unknown',
                type: event?.type,
                charIndex: event?.charIndex,
                elapsedTime: event?.elapsedTime,
                availableVoices: voices.length,
            });
            if (voices.length === 0) {
                setError('Speech voices are still loading. Please click again in a moment.');
            } else if (event?.error === 'not-allowed') {
                if (!options?.suppressNotAllowedError) {
                    setError('Browser blocked speech. Click the speaker again or allow audio.');
                }
            } else {
                setError('Failed to play pronunciation. Please try again.');
            }
            setActiveWord((current) => (current === wordData.word ? null : current));
        };

        synth.speak(utterance);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            setError('Speech synthesis is not available in this browser.');
            console.warn('[pronunciation] Speech synthesis missing in this environment');
            return undefined;
        }

        synthRef.current = window.speechSynthesis;

        const handleVoicesChanged = () => {
            synthRef.current = window.speechSynthesis;
            const voices = window.speechSynthesis.getVoices();
            setVoicesReady(voices.length > 0);
            if (voices.length > 0 && pendingRef.current) {
                const pending = pendingRef.current;
                pendingRef.current = null;
                console.info('[pronunciation] Voices ready, replaying pending word', {
                    word: pending.word.word,
                });
                speakInternal(pending.word, pending.options);
            }
        };

        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        window.setTimeout(() => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) {
                console.warn('[pronunciation] No speech synthesis voices available yet');
            } else {
                setVoicesReady(true);
            }
        }, 250);

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
            synthRef.current?.cancel();
        };
    }, [speakInternal]);

    const pronounceWord = useCallback(
        (wordData: WordRecord, options?: PronounceOptions) => {
            const synth = synthRef.current;
            if (!synth) {
                setError('Speech synthesis is not available in this browser.');
                console.warn('[pronunciation] No speech engine available when trying to speak', wordData.word);
                return;
            }

            const voices = synth.getVoices();
            if (!voicesReady || voices.length === 0) {
                const alreadyPending = pendingRef.current?.word.word === wordData.word;
                pendingRef.current = { word: wordData, options };
                if (!alreadyPending) {
                    if (!options?.suppressPendingError) {
                        setError('Speech voices are still loading. Please click again in a moment.');
                    }
                    console.info('[pronunciation] Delaying speech until voices are ready', {
                        word: wordData.word,
                        voicesAvailable: voices.length,
                        voicesReady,
                    });
                }
                return;
            }

            speakInternal(wordData, options);
        },
        [speakInternal, voicesReady],
    );

    const clearError = useCallback(() => setError(null), []);

    return { activeWord, error, pronounceWord, clearError, voicesReady };
}
