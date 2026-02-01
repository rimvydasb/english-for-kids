describe('Health Check', () => {
  it('loads the home page and displays main menu', () => {
    cy.visit('/');
    cy.contains('h1', 'Learn English').should('be.visible');
    
    // Check for the 4 main game cards
    cy.contains('All Words').should('be.visible');
    cy.contains('Guess The Word').should('be.visible');
    cy.contains('Listen & Guess').should('be.visible');
    cy.contains('Guess Phrases').should('be.visible');
  });

  it('navigates to All Words page', () => {
    cy.visit('/');
    cy.contains('All Words').click();
    cy.url().should('include', '/words');
    cy.get('button[aria-label="Return to main menu"]').should('be.visible'); // Close button
  });
});
