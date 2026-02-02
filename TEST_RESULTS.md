# Test Results

## Jest Tests
All Jest tests passed successfully.
- **Pass:** 26
- **Fail:** 0
- **Total:** 26

## Cypress Tests
Cypress tests had some failures.
- **Pass:** 5
- **Fail:** 9
- **Total:** 14

### Failures

#### `game_start_modal.cy.ts` (5 failures)
- Resumes game without modal if already started
- Opens modal when starting Guess The Word
- Opens modal when starting Listen & Guess
- Opens modal when starting Guess Phrases
- Selects options and starts Guess The Word

Error: Elements like 'Nouns' or 'Any Topic' buttons were not found.

#### `health.cy.ts` (1 failure)
- Navigates to All Words page
  - Error: Navigation to `/words` failed (timeout).

#### `type_consistency.cy.ts` (1 failure)
- Should always show options of the same type as the answer (Any Topic)
  - Error: 'Any Topic' button not found.

#### `full_game_flow.cy.ts` (2 failures)
- (Specific failure details were not fully captured in the log snippet but likely related to similar UI issues)
