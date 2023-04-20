describe('Tags page tests', () => {
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
            cy.intercept('tags/').as('getTags');
            cy.visit('localhost:8080/tags');
        })

        afterEach(() => {
            if(Cypress.platform === 'win32'){
                cy.exec('venv\\Scripts\\python.exe ../backend/manage.py runscript delete_test_user')
            } else {
                cy.exec("./venv/bin/python ../backend/manage.py runscript delete_test_user")
            }
            localStorage.clear();
        })

        it(`Creating a tag should add it to the table, deleting it should remove it from the table`, () => {
            cy.wait('@getTags').then((interception) => {
                cy.get('[data-cy="tag-table"]').get('tr').its('length').then(($oldRowNumber) => {
                    //create the tag
                    cy.get('[data-cy="new-tag-button"]').click();
                    cy.get('[data-cy="tag-edit-label-textfield"]').type('cypresstagtabel');
                    cy.get('[data-cy="tag-edit-description-textfield"]').type('cypresstagdescription');
                    cy.get('[data-cy="tag-edit-is-public-checkbox"]').click({force: true});
                    cy.get('[data-cy="tag-edit-save-button"]').click();
                    cy.get('[data-cy="tag-table"]').get('tr').should('have.length', $oldRowNumber+1);
                    cy.get('[data-cy="tag-table"]').get('tr').contains('cypresstagtabel').should('exist');
                    cy.get('[data-cy="tag-table"]').get('tr').contains('cypresstagdescription').should('exist');
                    
                    //delete the tag
                    cy.get('[data-cy="tag-delete-button"]').should('have.length', $oldRowNumber);
                    cy.get('[data-cy="tag-delete-button"]').last().click();
                    cy.get('[data-cy="tag-delete-confirm-button"]').click();
                    cy.get('[data-cy="tag-delete-button"]').should('have.length', $oldRowNumber-1);
                    cy.get('[data-cy="tag-table"]').get('tr').should('have.length', $oldRowNumber);
                    cy.get('[data-cy="tag-table"]').get('tr').contains('cypresstagtabel').should('not.exist');
                    cy.get('[data-cy="tag-table"]').get('tr').contains('cypresstagdescription').should('not.exist');

                    // TODO: These "cypresstaglabel" and "cypresstagdescription" tags probably need to be sanitized in the live system,
                    // so the tests don't break if users create same labels or descriptions.
                    // Not sure how to achieve this.
                })
            })
        })

        it(`Searching a tag should find it in the table`, () => {
            cy.wait('@getTags').then((interception) => {
                cy.get('[data-cy="tag-table"]').get('tr').its('length').then(($oldRowNumber) => {
                    //create the tag
                    cy.get('[data-cy="new-tag-button"]').click();
                    cy.get('[data-cy="tag-edit-label-textfield"]').type('cypresstagtabel');
                    cy.get('[data-cy="tag-edit-description-textfield"]').type('cypresstagdescription');
                    cy.get('[data-cy="tag-edit-is-public-checkbox"]').click({force: true});
                    cy.get('[data-cy="tag-edit-save-button"]').click();
                    cy.get('[data-cy="tag-table"]').get('tr').should('have.length', $oldRowNumber+1);
                    cy.get('[data-cy="tag-table"]').get('tr').contains('cypresstagtabel').should('exist');
                    cy.get('[data-cy="tag-table"]').get('tr').contains('cypresstagdescription').should('exist');

                    //search the tag
                    cy.get('[data-cy="tag-search"]').type('cypresstagtabel');
                    cy.get('[data-cy="tag-table"]').get('tr').should('have.length', 2);
                    cy.get('[data-cy="tag-table"]').get('tr').contains('cypresstagtabel').should('exist');
                    cy.get('[data-cy="tag-table"]').get('tr').contains('cypresstagdescription').should('exist');

                    //clear search
                    cy.get('[data-cy="tag-search"]').clear();
                    
                    //delete the tag
                    cy.get('[data-cy="tag-delete-button"]').should('have.length', $oldRowNumber);
                    cy.get('[data-cy="tag-delete-button"]').last().click();
                    cy.get('[data-cy="tag-delete-confirm-button"]').click();
                    cy.get('[data-cy="tag-delete-button"]').should('have.length', $oldRowNumber-1);
                    cy.get('[data-cy="tag-table"]').get('tr').should('have.length', $oldRowNumber);
                    cy.get('[data-cy="tag-table"]').get('tr').contains('cypresstagtabel').should('not.exist');
                    cy.get('[data-cy="tag-table"]').get('tr').contains('cypresstagdescription').should('not.exist');
                })
            })
        })
    })
})