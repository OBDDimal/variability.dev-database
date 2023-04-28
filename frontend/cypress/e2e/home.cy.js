describe('Home page tests', () => {
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

            cy.intercept('GET', '/files/uploaded/confirmed').as('getFilesUploadedConfirmed');
            cy.intercept('GET', '/families/').as('getFamilies');
            cy.intercept('GET', '/tags/').as('getTags');

            cy.visit('localhost:8080');
            cy.contains('Close', { matchCase: false }).click(); //click tutorial away
        })

        afterEach(() => {
            if(Cypress.platform === 'win32'){
                cy.exec('venv\\Scripts\\python.exe ../backend/manage.py runscript delete_test_user')
            } else {
                cy.exec("./venv/bin/python ../backend/manage.py runscript delete_test_user")
            }
            localStorage.clear();
        })

        it(`Tutorial click should open the tutorial`, () => {
            cy.wait(['@getFilesUploadedConfirmed', '@getFamilies', '@getTags']).then(
                (interceptions) => {
                    cy.get('[data-cy="tutorial-mode-button"]').click();
                    cy.contains('START TUTORIAL', { matchCase: false }).click();
                    cy.contains('Welcome to the tutorial!', { matchCase: false }).should('exist');
                }
            )
        })

        it(`Create new feature model should open new editor`, () => {
            cy.wait(['@getFilesUploadedConfirmed', '@getFamilies', '@getTags']).then(
                (interceptions) => {
                    cy.get('[data-cy="feature-model-table-create-button"]').click();
                    cy.url().should('eq', 'http://localhost:8080/feature-model/new');
                }
            )
        })

        it(`Uploading a single feature model file should send a mail`, () => {
            cy.wait(['@getFilesUploadedConfirmed', '@getFamilies', '@getTags']).then(
                (interceptions) => {
                    cy.intercept('GET', '/Licenses/').as('getLicenses');

                    cy.get('[data-cy="feature-model-table-upload-button"]').click();
                    cy.get('[data-cy="file-create-label-textfield"]').type('cypresstestfilelabel');
                    cy.get('[data-cy="file-create-description-textfield"]').type('cypresstestfiledescription');
                    cy.get('[data-cy="file-create-file-input"]').selectFile('cypress/e2e/cypresstestfile.xml', {force: true});
                    cy.get('[data-cy="file-create-license-select"]').click().type('{downArrow}{enter}', {force: true});
                    cy.get('[data-cy="file-create-family-label-combobox"]').type('cypressfamilylabel{enter}');
                    cy.get('[data-cy="file-create-family-description-textfield"]').type('cypressfamilydescription{enter}');
                    cy.get('[data-cy="file-create-version-textfield"]').type('1.0.0{enter}');
                    cy.get('[data-cy="file-create-legal-share-checkbox"]').click({force: true});
                    cy.get('[data-cy="file-create-user-data-checkbox"]').click({force: true});
                    cy.get('[data-cy="file-create-open-source-checkbox"]').click({force: true});

                    cy.intercept('POST', '/families/').as('postFamilies');
                    cy.intercept('POST', '/bulk-upload/').as('postBulkUpload');

                    cy.get('[data-cy="file-create-upload-button"]').click();
                    cy.wait(['@postFamilies', '@postBulkUpload']).then(
                        (interceptions2) => {
                            //check for mail popup
                            cy.contains('Check your mails', { matchCase: false }).should('exist'); //click tutorial away
                        }
                    )
                }
            )
            //delete created family
            if(Cypress.platform === 'win32'){
                cy.exec('venv\\Scripts\\python.exe ../backend/manage.py runscript delete_test_family');
            } else {
                cy.exec("./venv/bin/python ../backend/manage.py runscript delete_test_family");
            }
        })

        it(`Uploading multiple feature model files should send a mail`, () => {
            cy.wait(['@getFilesUploadedConfirmed', '@getFamilies', '@getTags']).then(
                (interceptions) => {
                    cy.intercept('GET', '/Licenses/').as('getLicenses');

                    cy.get('[data-cy="feature-model-table-upload-button"]').click();
                    cy.get('[data-cy="file-create-multiple-upload-tab"]').click();
                    cy.get('[data-cy="file-create-multiple-file-input"]').selectFile(['cypress/e2e/cypresstestfile.xml', 'cypress/e2e/cypresstestfile2.xml'], {force: true});
                    cy.contains('2 files (752 B in total)', { matchCase: false }).should('exist');
                    cy.get('[data-cy="file-create-multiple-license-select"]').click().type('{downArrow}{enter}', {force: true});
                    cy.get('[data-cy="file-create-multiple-family-label-textfield"]').type('cypressfamilylabel{enter}');
                    cy.get('[data-cy="file-create-multiple-family-description-textfield"]').type('cypressfamilydescription{enter}');
                    cy.get('[data-cy="file-create-multiple-legal-share-checkbox"]').click({force: true});
                    cy.get('[data-cy="file-create-multiple-user-data-checkbox"]').click({force: true});
                    cy.get('[data-cy="file-create-multiple-open-source-checkbox"]').click({force: true});

                    cy.intercept('POST', '/families/').as('postFamilies');
                    cy.intercept('POST', '/bulk-upload/').as('postBulkUpload');

                    cy.get('[data-cy="file-create-multiple-upload-button"]').click();
                    cy.wait(['@postFamilies', '@postBulkUpload']).then(
                        (interceptions2) => {
                            //check for mail popup
                            cy.contains('Check your mails', { matchCase: false }).should('exist'); //click tutorial away
                        }
                    )
                }
            )
            //delete created family
            if(Cypress.platform === 'win32'){
                cy.exec('venv\\Scripts\\python.exe ../backend/manage.py runscript delete_test_family');
            } else {
                cy.exec("./venv/bin/python ../backend/manage.py runscript delete_test_family");
            }
        })

        it.only(`Uploading a zip file should send a mail`, () => {
            cy.wait(['@getFilesUploadedConfirmed', '@getFamilies', '@getTags']).then(
                (interceptions) => {
                    cy.intercept('GET', '/Licenses/').as('getLicenses');

                    cy.get('[data-cy="feature-model-table-upload-button"]').click();
                    cy.get('[data-cy="file-create-zip-upload-tab"]').click();
                    cy.get('[data-cy="file-create-zip-label-textfield"]').type('cypresstestfilelabel');
                    cy.get('[data-cy="file-create-zip-description-textfield"]').type('cypresstestfiledescription');
                    cy.get('[data-cy="file-create-zip-file-input"]').selectFile('cypress/e2e/cypresstestarchive.zip', {force: true});
                    cy.get('[data-cy="file-create-zip-license-select"]').click().type('{downArrow}{enter}', {force: true});
                    cy.get('[data-cy="file-create-zip-family-label-textfield"]').type('cypressfamilylabel{enter}');
                    cy.get('[data-cy="file-create-zip-family-description-textfield"]').type('cypressfamilydescription{enter}');
                    cy.get('[data-cy="file-create-zip-legal-share-checkbox"]').click({force: true});
                    cy.get('[data-cy="file-create-zip-user-data-checkbox"]').click({force: true});
                    cy.get('[data-cy="file-create-zip-open-source-checkbox"]').click({force: true});

                    cy.intercept('POST', '/families/').as('postFamilies');
                    cy.intercept('POST', '/bulk-upload/').as('postBulkUpload');

                    cy.get('[data-cy="file-create-zip-upload-button"]').click();
                    cy.wait(['@postFamilies', '@postBulkUpload']).then(
                        (interceptions2) => {
                            //check for mail popup
                            cy.contains('Check your mails', { matchCase: false }).should('exist'); //click tutorial away
                        }
                    )
                }
            )
            //delete created family
            if(Cypress.platform === 'win32'){
                cy.exec('venv\\Scripts\\python.exe ../backend/manage.py runscript delete_test_family');
            } else {
                cy.exec("./venv/bin/python ../backend/manage.py runscript delete_test_family");
            }
        })

    })
})