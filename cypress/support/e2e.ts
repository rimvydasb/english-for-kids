// cypress/support/e2e.ts

beforeEach(() => {
  cy.window().then((win) => {
    cy.spy(win.console, 'error').as('consoleError');
    cy.spy(win.console, 'warn').as('consoleWarn');
  });
});

afterEach(() => {
  // Check for console errors
  cy.get('@consoleError').should('have.callCount', 0);
  
  // Optional: Check for warnings if strictness is required, 
  // but user said "ensure no errors or exceptions". 
  // Warnings are often benign in dev mode (like hydration mismatches which are errors in new React but handled as warnings sometimes?)
  // React hydration mismatch IS an error usually.
});

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  // We want to ensure no exceptions, so we let it fail (default)
  return true;
});
