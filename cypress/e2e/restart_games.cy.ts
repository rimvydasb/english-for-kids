describe('Restart All Games', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it('should reset in-game statistics but preserve global statistics', () => {
        const wordKey = 'cat';
        const phraseKey = 'The Hello Song';

        const inGameStats = {
            [wordKey]: {
                key: wordKey,
                totalAttempts: 5,
                correctAttempts: 3,
                wrongAttempts: 2,
                learned: false,
            },
        };

        const phraseInGameStats = {
            [phraseKey]: {
                key: phraseKey,
                totalAttempts: 5,
                correctAttempts: 3,
                wrongAttempts: 2,
                learned: false,
            },
        };

        const globalWordStats = {
            [wordKey]: {
                key: wordKey,
                correctAttempts: 10,
                wrongAttempts: 5,
            },
        };

        const globalPhraseStats = {
            [phraseKey]: {
                key: phraseKey,
                correctAttempts: 10,
                wrongAttempts: 5,
            },
        };

        cy.window().then((win) => {
            win.localStorage.setItem('GUESS_THE_WORD_GAME_STATS', JSON.stringify(inGameStats));
            win.localStorage.setItem('LISTEN_AND_GUESS_GAME_STATS', JSON.stringify(inGameStats));
            win.localStorage.setItem('GUESS_THE_PHRASE_GAME_STATS', JSON.stringify(phraseInGameStats));

            win.localStorage.setItem('GLOBAL_WORD_STATS', JSON.stringify(globalWordStats));
            win.localStorage.setItem('GLOBAL_PHRASE_STATS', JSON.stringify(globalPhraseStats));
        });

        cy.visit('/words');

        // Handle confirmation dialog
        // Note: cy.on('window:confirm', cb) must be set up before the action that triggers it
        // However, Cypress automatically accepts confirmations by default, but we can be explicit.
        // Actually, if we want to confirm, we should let it default to true or explicitly return true.
        // But the click must happen after setting up the listener if we want to spy on it,
        // or just let it happen.
        // The implementation in component is: if (!window.confirm(...)) return;
        // Cypress auto-accepts alerts and confirms. So just clicking should work.

        cy.contains('button', 'Restart All Games').click();

        // Verify redirection
        cy.location('pathname').should('eq', '/');

        cy.window().then((win) => {
            const guessWordStats = JSON.parse(win.localStorage.getItem('GUESS_THE_WORD_GAME_STATS') || '{}');
            const listenGuessStats = JSON.parse(win.localStorage.getItem('LISTEN_AND_GUESS_GAME_STATS') || '{}');
            const phraseStats = JSON.parse(win.localStorage.getItem('GUESS_THE_PHRASE_GAME_STATS') || '{}');

            // In-game stats should be reset (values 0)
            expect(guessWordStats[wordKey].totalAttempts).to.equal(0);
            expect(listenGuessStats[wordKey].totalAttempts).to.equal(0);
            expect(phraseStats[phraseKey].totalAttempts).to.equal(0);

            const storedGlobalWordStats = JSON.parse(win.localStorage.getItem('GLOBAL_WORD_STATS') || '{}');
            const storedGlobalPhraseStats = JSON.parse(win.localStorage.getItem('GLOBAL_PHRASE_STATS') || '{}');

            // Global stats should be preserved
            expect(storedGlobalWordStats[wordKey].correctAttempts).to.equal(10);
            expect(storedGlobalPhraseStats[phraseKey].correctAttempts).to.equal(10);
        });
    });
});
