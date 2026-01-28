describe('Full Game Flow - Guess the Word (Numbers)', () => {
    const numberMap: Record<string, string> = {
        '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
        '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
        '10': 'ten', '11': 'eleven', '12': 'twelve', '13': 'thirteen',
        '14': 'fourteen', '15': 'fifteen', '16': 'sixteen', '17': 'seventeen',
        '18': 'eighteen', '19': 'nineteen', '20': 'twenty'
    };

    beforeEach(() => {
        cy.clearLocalStorage();
        // Clear all known storage keys explicitly
        cy.window().then((win) => {
            ['GUESS_THE_WORD_GAME_STATS', 'LISTEN_AND_GUESS_GAME_STATS', 'GUESS_THE_PHRASE_GAME_STATS'].forEach(key => {
                win.localStorage.removeItem(key);
                win.localStorage.removeItem(`${key}_ACTIVE_SUBJECTS`);
                win.localStorage.removeItem(`${key}_CONFIG`);
            });
            // Try to clear IndexedDB too
            if (win.indexedDB.databases) {
                win.indexedDB.databases().then((databases) => {
                    databases.forEach((db) => {
                        if (db.name) win.indexedDB.deleteDatabase(db.name);
                    });
                });
            }
        });
        cy.visit('/');
    });

    it('should play a full game with 5 numbers, make one mistake, and show stats', () => {
        // Navigate to Guess the Word
        cy.contains('Guess The Word').click();

        // Configure Game: 5 Words, Numbers
        cy.contains('button', '5 Words').click();
        cy.contains('button', 'Numbers').click();

        // Game should start automatically
        cy.get('div[class*="MuiContainer-root"]', { timeout: 10000 }).should('exist');
        
        // Verify stats are 0 at start to catch "starts with 1" bug
        cy.contains('Attempts: 0').should('exist');
        cy.contains('Wrong: 0').should('exist');

        let wrongGuessedWord = '';

        // Play 5 rounds
        for (let i = 0; i < 5; i++) {
            // Identify the correct answer from the card
            cy.get('.MuiCard-root', { timeout: 10000 }).should('be.visible').then(($card) => {
                // In Numbers mode, the card should contain a big digit
                const $numberText = $card.find('.MuiTypography-root').filter((_, el) => {
                    const text = el.innerText.trim();
                    return /^\d+$/.test(text);
                });

                if ($numberText.length === 0) {
                    throw new Error('Could not find a number digit in the card for Numbers mode');
                }

                const digit = $numberText.text().trim();
                const correctAnswer = numberMap[digit];

                if (!correctAnswer) {
                    throw new Error(`No mapping found for digit: ${digit}`);
                }

                cy.log(`Round ${i + 1}: Card shows ${digit}, expecting word "${correctAnswer}"`);

                // Assert data-option-type is number for ALL buttons
                cy.get('[data-testid="option-button"]').each(($el) => {
                    cy.wrap($el).should('have.attr', 'data-option-type', 'number');
                });

                // Perform actions
                if (i === 0) {
                    // Make a mistake on the first turn
                    wrongGuessedWord = correctAnswer;
                    
                    // Click a wrong option (any button that is not the correct answer)
                    cy.get('[data-testid="option-button"]')
                        .should('have.length.at.least', 2)
                        .each(($el) => {
                            const val = $el.attr('data-option-value');
                            if (val !== correctAnswer) {
                                cy.wrap($el).scrollIntoView().should('be.visible').click({ force: true });
                                return false; // break each
                            }
                        });
                    
                    cy.wait(1000); 
                }

                cy.wait(1000);

                // Click correct answer
                cy.get(`[data-is-correct="true"]`)
                    .scrollIntoView()
                    .should('be.visible')
                    .click();

                // Click Next or Finish
                if (i < 4) {
                    cy.contains('button', 'Next', { timeout: 10000 })
                        .should('be.visible')
                        .click()
                        .should('not.exist');
                } else {
                    cy.contains('button', 'Finish!', { timeout: 10000 })
                        .should('be.visible')
                        .click();
                }
            });
            
            cy.wait(500);
        }

        // Verify Summary
        cy.contains('h2', 'Great job!', { timeout: 10000 }).should('be.visible');
        
        cy.then(() => {
            cy.contains('Correct: 5').should('be.visible');
            // Wrong can be 1 or 2 depending on if the decoy was an active subject
            cy.contains(/Wrong:\s*[12]/).should('be.visible');

            // Check if the word we missed is in the "Worst Guesses" list
            if (wrongGuessedWord) {
                 cy.contains('.MuiTypography-root', wrongGuessedWord, { matchCase: false }).should('be.visible');
            }
        });

        // Test the Restart/Reset functionality
        cy.get('button[aria-label="restart"]').click();
        
        // Verify Game Setup modal appears
        cy.contains('h2', 'Game Setup').should('be.visible');

        // Select new rules: 5 Words, Colors
        cy.contains('button', '5 Words').click();
        cy.contains('button', 'Colors').click();

        // Verify game starts with Colors
        cy.get('div[class*="MuiContainer-root"]', { timeout: 10000 }).should('exist');
        cy.get('[data-testid="option-button"]').should('have.attr', 'data-option-type', 'color');
    });
});