describe('Toolbar tests', () => {
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

            cy.visit('localhost:8080/feature-model/new');
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

        it(`Toolbar expansion`, () => {
            cy.get('aside')
                .should('have.class', 'v-navigation-drawer--mini-variant');
            cy.get('#feature-model-toolbar-extend').click();
            cy.get('aside')
                .should('not.have.class', 'v-navigation-drawer--mini-variant');
        })

        it(`New empty model click`, () => {
            cy.get('.feature-node-container').children().should('have.length', 3);
            cy.get('.empty-model-icon').click();
            cy.get('.feature-node-container').children().should('have.length', 1);
        })

        it(`Local storage save click`, () => {
            expect(localStorage.getItem("featureModelData")).to.be.null;
            cy.get('#feature-model-toolbar-save').click();
            cy.contains('Save', { matchCase: true }).click();
            expect(localStorage.getItem("featureModelData")).to.not.be.null;
        })

        it(`Undo changes click`, () => {
            cy.get('#feature-model-toolbar-undo').should('be.disabled');
            cy.get('.feature-node-container').contains('Root', { matchCase: true }).rightclick();
            cy.contains('Edit', { matchCase: true }).click();
            cy.get('.edit-feature-name').get('input').type('hello');
            cy.contains('Edit', { matchCase: true }).click();
            cy.get('#feature-model-toolbar-undo').should('not.be.disabled');
            cy.get('#feature-model-toolbar-undo').click();
            expect(cy.get('.feature-node-container').contains('Root', { matchCase: true })).to.be.true;
        })
    })
})