describe('Game Start Modal', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.visit('/');
    });

    const games = [
        {name: 'Guess The Word', hasTopic: true, urlPart: '/guess-the-word'},
        {name: 'Listen & Guess', hasTopic: true, urlPart: '/listen-and-guess'},
        {name: 'Guess Phrases', hasTopic: false, urlPart: '/guess-phrases'},
    ];

    games.forEach((game) => {
        it(`opens modal when starting ${game.name}`, () => {
            cy.contains(game.name).click();
            cy.contains('Game Setup').should('be.visible');
        });
    });

    it('selects options and starts Guess The Word', () => {
        cy.contains('Guess The Word').click();
        cy.contains('button', '5 Words').click();
        cy.contains('button', 'Cat, Dog...').click();

        cy.contains('Game Setup').should('not.exist');
        cy.url().should('include', '/guess-the-word');
        cy.get('[data-testid="score-header"]').should('exist');
    });

    it('selects options and starts Guess Phrases', () => {
        cy.contains('Guess Phrases').click();
        // Only count selection is available
        cy.contains('button', '5 Words').click();

        // Should start immediately after count selection since no topic needed
        cy.contains('Game Setup').should('not.exist');
        cy.url().should('include', '/guess-phrases');
        cy.get('[data-testid="score-header"]').should('exist');
    });

    it('closes modal and returns to home page', () => {
        cy.contains('Guess The Word').click();
        cy.get('button[aria-label="Close"]').click();
        cy.contains('Game Setup').should('not.exist');
        cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('resumes game without modal if already started', () => {
        // 1. Start game and select options
        cy.contains('Guess The Word').click();
        cy.contains('button', '5 Words').click();
        cy.contains('button', 'Cat, Dog...').click();

        // Wait for game to start
        cy.get('[data-testid="score-header"]').should('exist');

        // 2. Navigate away
        cy.get('button[aria-label="Return to main menu"]').click();
        cy.url().should('eq', Cypress.config().baseUrl + '/');

        // 3. Return to game - modal should NOT appear (resume behavior)
        cy.contains('Guess The Word').click();
        cy.contains('Game Setup').should('not.exist');
        cy.get('[data-testid="score-header"]').should('exist');
    });
});
