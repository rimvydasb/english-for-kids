describe('Selected Words Functionality', () => {
    beforeEach(() => {
        cy.visit('/');
        // Clear local storage to start fresh
        cy.clearLocalStorage();
    });

    it('allows selecting words and playing with them', () => {
        // 1. Go to All Words
        cy.contains('All Words').click();
        cy.url().should('include', '/words');

        // 2. Click "Select Words to Learn"
        cy.contains('Select Words to Learn').click();
        cy.contains('Done Selecting').should('be.visible');

        // 3. Select 3 specific words (e.g., apple, cat, dog)
        // We assume these words exist. Based on config.ts they do.
        const wordsToSelect = ['apple', 'cat', 'dog'];

        wordsToSelect.forEach((word) => {
            cy.contains(word).parents('.MuiCard-root').click();
            // Verify visual indicator (thick border or checkmark)
            // The checkmark is an icon with CheckCircleIcon.
            // We can check if the card has specific border color or checkmark icon.
            cy.contains(word).parents('.MuiCard-root').find('svg[data-testid="CheckCircleIcon"]').should('exist');
        });

        // 4. Click "Done Selecting"
        cy.contains('Done Selecting').click();
        cy.contains('Select Words to Learn').should('be.visible');

        // 5. Go back to Home
        cy.get('button[aria-label="Return to main menu"]').click();

        // 6. Start "Guess the Word" game
        cy.contains('Guess The Word').click();

        // 7. Verify "Selected Words" button is active and click it
        cy.contains('button', 'Selected Words').should('not.be.disabled');
        cy.contains('button', 'Selected Words').click();

        // 8. Verify we are playing with selected words.
        // We can check if the current word to guess is one of the selected ones.
        // Since we selected 3 words, and decoys might be anything, checking the main word is safer.
        // We can iterate a few times or check the total count if displayed.

        // The header shows "0 / 3" (learned / total)
        cy.contains('0 / 3').should('exist');
    });

    it('disables Selected Words button if no words selected', () => {
        cy.visit('/guess-the-word');
        cy.contains('button', 'Selected Words').should('be.disabled');
    });
});
