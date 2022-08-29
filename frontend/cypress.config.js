const { defineConfig } = require("cypress");

module.exports = defineConfig({
  VIRTUAL_ENV: 'C:/Users/SebastianBudsa/PycharmProjects/backend/venv',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
