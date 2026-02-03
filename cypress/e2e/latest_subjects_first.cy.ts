describe('Latest Subjects First', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.window().then((win) => {
            ['GUESS_THE_WORD_GAME_STATS', 'LISTEN_AND_GUESS_GAME_STATS', 'GUESS_THE_PHRASE_GAME_STATS'].forEach(key => {
                win.localStorage.removeItem(key);
                win.localStorage.removeItem(`${key}_ACTIVE_SUBJECTS`);
                win.localStorage.removeItem(`${key}_CONFIG`);
            });
        });
        cy.visit('/');
    });

    it('should present words from the latest added batch first', () => {
        // Navigate to Guess The Word
        cy.contains('Guess The Word').click();

        // Configure Game: 5 Words, Any
        cy.contains('button', '5 Words').click();
        cy.contains('button', 'Any').click();

        // Game starts
        cy.get('div[class*="MuiContainer-root"]', { timeout: 10000 }).should('exist');

        // Latest words (addedAt: 2026-01-28)
        const latestWordsBatch = new Set(['man', 'mango', 'neck', 'nose', 'octopus']);

        // Since we have exactly 5 words in the latest batch and requested a 5-word game,
        // all 5 rounds must be from this set, but their order within the set is now random.
        for (let i = 0; i < 5; i++) {
            cy.get(`[data-is-correct="true"]`)
                .invoke('attr', 'data-option-value')
                .then((word) => {
                    expect(latestWordsBatch.has(word!)).to.be.true;
                    latestWordsBatch.delete(word!); // Ensure each is played once
                });

            // Click the correct answer
            cy.get(`[data-is-correct="true"]`).click();

            // Proceed
            if (i < 4) {
                cy.contains('button', 'Next').click();
            } else {
                cy.contains('button', 'Finish!').click();
            }
            
            cy.wait(200);
        }

        // Verify Summary
        cy.contains('Great job!').should('be.visible');
        cy.contains('Correct: 5').should('be.visible');
    });
});