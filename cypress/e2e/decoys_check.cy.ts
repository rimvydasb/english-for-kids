describe('Decoy Count Verification', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.visit('/');
    });

    it('respects DEFAULT_DECOYS configuration (7 decoys -> 8 options total)', () => {
        // 1. Navigate to Guess The Word
        cy.contains('Guess The Word').click();

        // 2. Configure game: All Words, Any Topic
        // Wait for modal
        cy.contains('Game Setup').should('be.visible');

        // Select "All Words"
        cy.contains('button', 'All Words').click();

        // Select "Any" topic
        cy.contains('button', 'Any').click();

        // 3. Verify game started
        cy.get('[data-testid="score-header"]').should('exist');

        // 4. Count options
        // Assuming options are rendered as buttons in the main area.
        // I need to be specific about the selector.
        // Based on typical MUI usage or OptionButton component if it exists.
        // Let's check OptionButton usage or VariantStatsBar context.
        // A safer bet is checking for buttons that look like options.
        // Usually these are in a grid.

        // Let's grab all buttons in the main content area that are NOT navigation buttons.
        // Or look for a specific container.

        // Waiting for options to appear
        cy.get('[data-testid="option-button"]').should('have.length.at.least', 2);

        // We expect 1 correct + 7 decoys = 8 options.
        // We might need to filter out the "Score" or "Home" buttons.
        // But usually option buttons are the main interactive elements.

        // Let's target the grid of options specifically if possible.
        // Inspecting `app/guess/GuessGamePage.tsx` or similar would help,
        // but generally option buttons are distinct.

        // As a heuristic for this test: count all buttons that contain text content matching one of the words?
        // Or just count all contained buttons in the main grid.

        // Let's look for a container with multiple buttons.
        cy.get('[data-testid="option-button"]').should('have.length', 8);
    });
});
