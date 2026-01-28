describe('Game Option Type Consistency', () => {
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

    it('should always show options of the same type as the answer (Any Topic)', () => {
        cy.contains('Guess The Word').click();
        cy.contains('button', 'All Words').click();
        cy.contains('button', 'Any Topic').click();

        cy.get('div[class*="MuiContainer-root"]', { timeout: 10000 }).should('exist');

        // Play 10 rounds to increase chance of seeing different types if bug exists
        for (let i = 0; i < 10; i++) {
            cy.get('[data-testid="option-button"]').first().invoke('attr', 'data-option-type').then((expectedType) => {
                cy.log(`Expecting all options to be of type: ${expectedType}`);
                cy.get('[data-testid="option-button"]').each(($el) => {
                    cy.wrap($el).should('have.attr', 'data-option-type', expectedType);
                });
            });

            // Click correct answer to proceed
            cy.get(`[data-is-correct="true"]`).first().click();
            
            // Wait for Next or Finish button to appear
            cy.get('button').filter(':contains("Next"), :contains("Finish!")').should('be.visible').click();
            cy.wait(500);
        }
    });
});
