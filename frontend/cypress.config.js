const { defineConfig } = require("cypress");

module.exports = defineConfig({
  env: {
    BASE_URL: 'http://localhost:8000/',   //TODO: somehow make this variable based on .env.development, .env.production and env.testing
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
