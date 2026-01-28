describe('Game Start Modal', () => {
  beforeEach(() => {
    // Clear local storage to ensure fresh start for each test
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('opens modal when starting Guess The Word game', () => {
    cy.contains('Guess The Word').click();
    cy.contains('Game Setup').should('be.visible');
    cy.contains('How many words?').should('be.visible');
    cy.contains('What topic?').should('be.visible');
  });

  it('selects options and starts the game', () => {
    cy.contains('Guess The Word').click();

    // Select 5 words
    cy.contains('button', '5 Words').click();
    // Select Nouns
    cy.contains('button', 'Nouns').click();

    // Modal should close and game should start (check for specific game element)
    cy.contains('Game Setup').should('not.exist');
    cy.url().should('include', '/guess-the-word');
    // Check if score header is visible, indicating game start
    cy.get('[data-testid="score-header"]').should('exist'); 
  });

  it('closes modal and returns to home page', () => {
      // This test expects a close button on the modal, which needs to be implemented.
      // Assuming a close button with specific aria-label or text will be added.
      cy.contains('Guess The Word').click();
      cy.get('button[aria-label="Close"]').click();
      cy.contains('Game Setup').should('not.exist');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
    
  it('shows modal when returning to game', () => {
      // 1. Start game and select options
      cy.contains('Guess The Word').click();
      cy.contains('button', '5 Words').click();
      cy.contains('button', 'Nouns').click();
      
      // Wait for game to start
      cy.get('[data-testid="score-header"]').should('exist');
      
      // 2. Navigate away (e.g., to home)
      cy.get('button[aria-label="Return to main menu"]').click(); 
      cy.url().should('eq', Cypress.config().baseUrl + '/');

      // 3. Return to game - modal SHOULD appear (fixing the "bug")
      cy.contains('Guess The Word').click();
      cy.contains('Game Setup').should('be.visible');
  });
});
