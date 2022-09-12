// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

before(() => {
    cy.exec('python -m venv venv')
    if(Cypress.platform === 'win32'){
        cy.exec('venv\\Scripts\\pip.exe install -r ../backend/requirements.txt', {timeout: 120000})
    } else {
        cy.exec("./venv/bin/pip install -r ../backend/requirements.txt", {timeout: 120000})
    }
})

after(() => {
    if(Cypress.platform === 'win32'){
        cy.exec('rmdir /s /q venv')
    } else {
        cy.exec('rm -r venv')
    }
})