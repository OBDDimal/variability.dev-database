describe('Profile page tests', () => {
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

            cy.intercept('/files/uploaded/confirmed').as('getFilesUploadedConfirmed');
            cy.intercept('/families/').as('getFamilies');

            cy.visit('localhost:8080/profile');
        })

        afterEach(() => {
            if(Cypress.platform === 'win32'){
                cy.exec('venv\\Scripts\\python.exe ../backend/manage.py runscript delete_test_user')
            } else {
                cy.exec("./venv/bin/python ../backend/manage.py runscript delete_test_user")
            }
            localStorage.clear();
        })

        it(`Profile timeline should increase in size after tag operations`, () => {
            cy.wait(['@getFilesUploadedConfirmed', '@getFamilies']).then(
                (interceptions) => {
                    cy.get('[data-cy="profile-timeline-item"]').should('not.exist');
            
                    cy.intercept('GET', 'tags/').as('getTags');
                    cy.intercept('POST', 'tags/').as('postTags');
                    cy.visit('localhost:8080/tags');

                    cy.wait('@getTags').then((interception) => {
                        //create the tag
                        cy.get('[data-cy="new-tag-button"]').click();
                        cy.get('[data-cy="tag-edit-label-textfield"]').type('cypresstagtabel');
                        cy.get('[data-cy="tag-edit-description-textfield"]').type('cypresstagdescription');
                        cy.get('[data-cy="tag-edit-is-public-checkbox"]').click({force: true});
                        cy.get('[data-cy="tag-edit-save-button"]').click();

                        cy.wait('@postTags').then((interception) => {
                            

                            cy.visit('localhost:8080/profile');

                            cy.wait(['@getFilesUploadedConfirmed', '@getFamilies']).then(
                                (interceptions) => {

                                    cy.get('[data-cy="profile-timeline-item"]').should('exist');
                                    cy.get('[data-cy="profile-timeline-item"]').should('have.length', 1);
                                }
                            )
                        })
                    })
                }
            )

            cy.intercept('GET', 'tags/').as('getTags');
            cy.visit('localhost:8080/tags');

            cy.wait('@getTags').then((interception) => {
                //delete the tag
                cy.get('[data-cy="tag-delete-button"]').last().click();
                cy.get('[data-cy="tag-delete-confirm-button"]').click();
            })
        })
    })
})