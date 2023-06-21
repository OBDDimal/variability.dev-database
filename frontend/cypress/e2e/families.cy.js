describe('Families page tests', () => {
    context('720p resolution', () => {
    
        beforeEach(() => {
            cy.viewport(1280, 720)
            if(Cypress.platform === 'win32'){
                cy.exec('venv\\Scripts\\python.exe ../backend/manage.py runscript create_test_user')
            } else {
                cy.exec("./venv/bin/python ../backend/manage.py runscript create_test_user")
            }

            const email = 'cypress@uni-ulm.de';
            const password = 'testingIsFun1';

            const API_URL = `${Cypress.env('BASE_URL')}auth/`;

            cy.request('POST', `${API_URL}login/`, {email, password}).then((response) => {

                if (response.body.access && response.body.refresh) {
                    localStorage.setItem('access', JSON.stringify(response.body.access));
                    localStorage.setItem(
                        'refresh',
                        JSON.stringify(response.body.refresh),
                    );
                    localStorage.setItem('user', JSON.stringify(response.body.user));
                }

                return response.body;
            })
            cy.intercept('GET', 'families/').as('getFamilies');
            cy.intercept('POST', 'families/').as('postFamilies');
            cy.visit('localhost:8080/families');
        })

        afterEach(() => {
            if(Cypress.platform === 'win32'){
                cy.exec('venv\\Scripts\\python.exe ../backend/manage.py runscript delete_test_family').then((result) => {
                    cy.exec('venv\\Scripts\\python.exe ../backend/manage.py runscript delete_test_user')
                })
                
            } else {
                cy.exec("./venv/bin/python ../backend/manage.py runscript delete_test_family").then((result) => {
                    cy.exec("./venv/bin/python ../backend/manage.py runscript delete_test_user")
                })
            }
            localStorage.clear();
        })

        it(`Creating a family should add it to the table`, () => {
            cy.wait('@getFamilies').then((interception) => {
                cy.get('[data-cy="family-table"]').get('tr').its('length').then(($oldRowNumber) => {
                    //create the family
                    cy.get('[data-cy="new-family-button"]').click();
                    cy.get('[data-cy="family-edit-label-textfield"]').type('cypressfamilylabel');
                    cy.get('[data-cy="family-edit-description-textfield"]').type('cypressfamilydescription');
                    cy.get('[data-cy="family-edit-save-button"]').click();
                    cy.wait(['@postFamilies', '@getFamilies']).then((interception) => {
                        cy.get('[data-cy="family-table"]').get('tr').should('have.length', $oldRowNumber+1);
                        cy.get('[data-cy="family-table"]').get('tr').contains('cypressfamilylabel').should('exist');
                        cy.get('[data-cy="family-table"]').get('tr').contains('cypressfamilydescription').should('exist');

                        // TODO: These "cypressfamilylabel" and "cypressfamilydescription" families probably need to be sanitized in the live system,
                        // so the tests don't break if users create same labels or descriptions.
                        // Not sure how to achieve this.
                    })
                })
            })
        })

        it(`Searching a family should find it in the table`, () => {
            cy.wait('@getFamilies').then((interception) => {
                cy.get('[data-cy="family-table"]').get('tr').its('length').then(($oldRowNumber) => {
                    //create the family
                    cy.get('[data-cy="new-family-button"]').click();
                    cy.get('[data-cy="family-edit-label-textfield"]').type('cypressfamilylabel');
                    cy.get('[data-cy="family-edit-description-textfield"]').type('cypressfamilydescription');
                    cy.get('[data-cy="family-edit-save-button"]').click();
                    cy.wait(['@postFamilies', '@getFamilies']).then((interception) => {
                        cy.get('[data-cy="family-table"]').get('tr').should('have.length', $oldRowNumber+1);
                        cy.get('[data-cy="family-table"]').get('tr').contains('cypressfamilylabel').should('exist');
                        cy.get('[data-cy="family-table"]').get('tr').contains('cypressfamilydescription').should('exist');

                        //search the family
                        cy.get('[data-cy="family-search"]').type('cypressfamilylabel');
                        cy.get('[data-cy="family-table"]').get('tr').should('have.length', 2);
                        cy.get('[data-cy="family-table"]').get('tr').contains('cypressfamilylabel').should('exist');
                        cy.get('[data-cy="family-table"]').get('tr').contains('cypressfamilydescription').should('exist');

                        //clear search
                        cy.get('[data-cy="family-search"]').clear();
                        cy.get('[data-cy="family-table"]').get('tr').should('have.length', $oldRowNumber+1);
                    })
                })
            })
        })

        it(`Clicking on a family in the table should navigate to it`, () => {
            cy.wait('@getFamilies').then((interception) => {
                cy.get('[data-cy="family-table"]').get('tr').its('length').then(($oldRowNumber) => {
                    //create the family
                    cy.get('[data-cy="new-family-button"]').click();
                    cy.get('[data-cy="family-edit-label-textfield"]').type('cypressfamilylabel');
                    cy.get('[data-cy="family-edit-description-textfield"]').type('cypressfamilydescription');
                    cy.get('[data-cy="family-edit-save-button"]').click();
                    cy.wait(['@postFamilies', '@getFamilies']).then((interception) => {
                        cy.get('[data-cy="family-table"]').get('tr').should('have.length', $oldRowNumber+1);
                        cy.get('[data-cy="family-table"]').get('tr').contains('cypressfamilylabel').should('exist');
                        cy.get('[data-cy="family-table"]').get('tr').contains('cypressfamilydescription').should('exist');

                        cy.get('[data-cy="family-table"]').get('tr').contains('cypressfamilylabel').click();
                        cy.url().should('include', '/cypressfamilylabel');
                    })
                })
            })
        })
    })
})