import {defineConfig} from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:7788',
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        supportFile: 'cypress/support/e2e.ts',
    },
});
