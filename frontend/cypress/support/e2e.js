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
//import { existsSync } from 'node:fs';

// Alternatively you can use CommonJS syntax:
// require('./commands')

//------------------------------------------------------------------------------------------------------
// !!! uncomment this if you want to re-enable venv + requirements installation for each cypress run !!!
//------------------------------------------------------------------------------------------------------

// before(() => {
//     const path = '/venv';

//     if(!existsSync(path)){
//         cy.exec('python -m venv venv')
//         if(Cypress.platform === 'win32'){
//             cy.exec('venv\\Scripts\\pip.exe install -r ../backend/requirements.txt', {timeout: 240000})
//         } else {
//             cy.exec("./venv/bin/pip install -r ../backend/requirements.txt", {timeout: 240000})
//         }
//     }
// })

// after(() => {
//     // uncomment this if the venv installation is somehow messed up
//     // if(Cypress.platform === 'win32'){
//     //     cy.exec('rmdir /s /q venv')
//     // } else {
//     //     cy.exec('rm -r venv')
//     // }
// })