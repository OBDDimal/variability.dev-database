describe('Search tests', () => {
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

        it(`Search expansion and focus`, () => {
            cy.get('[data-cy="feature-model-search"]').parent().parent().parent().parent().click();
            cy.get('[data-cy="feature-model-search"]').parent().parent().parent().parent().should('not.have.class', 'closed');
            cy.focused().should('have.attr', 'data-cy').and('eq', 'feature-model-search');
        })

        it(`Searching "Feature" should show two paths for the search that can be swapped via chevron click`, () => {
            cy.get('[data-cy="feature-model-search"]').parent().parent().parent().parent().click();
            cy.get('[data-cy="feature-model-search"]').type('Feature');
            cy.get('[class*="feature-node-container"]').children().contains('Root').siblings().first().should('have.class', 'is-searched-feature');
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').siblings().first().should('have.class', 'is-searched-feature');
            cy.get('[class*="feature-node-container"]').children().contains('Feature B').siblings().first().should('not.have.class', 'is-searched-feature');
            cy.get('[data-cy="feature-model-search-left-button"]').should('be.disabled');
            cy.get('[data-cy="feature-model-search-right-button"]').should('not.be.disabled');
            cy.get('[data-cy="feature-model-search-right-button"]').click();
            cy.get('[class*="feature-node-container"]').children().contains('Root').siblings().first().should('have.class', 'is-searched-feature');
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').siblings().first().should('not.have.class', 'is-searched-feature');
            cy.get('[class*="feature-node-container"]').children().contains('Feature B').siblings().first().should('have.class', 'is-searched-feature');
            cy.get('[data-cy="feature-model-search-left-button"]').should('not.be.disabled');
            cy.get('[data-cy="feature-model-search-right-button"]').should('be.disabled');
        })

        it(`Searching " A" should show only show A path`, () => {
            cy.get('[data-cy="feature-model-search"]').parent().parent().parent().parent().click();
            cy.get('[data-cy="feature-model-search"]').type(' A');
            cy.get('[class*="feature-node-container"]').children().contains('Root').siblings().first().should('have.class', 'is-searched-feature');
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').siblings().first().should('have.class', 'is-searched-feature');
            cy.get('[class*="feature-node-container"]').children().contains('Feature B').siblings().first().should('not.have.class', 'is-searched-feature');
            cy.get('[data-cy="feature-model-search-left-button"]').should('be.disabled');
            cy.get('[data-cy="feature-model-search-right-button"]').should('be.disabled');
        })

        it(`Searching " B" should show only show B path`, () => {
            cy.get('[data-cy="feature-model-search"]').parent().parent().parent().parent().click();
            cy.get('[data-cy="feature-model-search"]').type(' B');
            cy.get('[class*="feature-node-container"]').children().contains('Root').siblings().first().should('have.class', 'is-searched-feature');
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').siblings().first().should('not.have.class', 'is-searched-feature');
            cy.get('[class*="feature-node-container"]').children().contains('Feature B').siblings().first().should('have.class', 'is-searched-feature');
            cy.get('[data-cy="feature-model-search-left-button"]').should('be.disabled');
            cy.get('[data-cy="feature-model-search-right-button"]').should('be.disabled');
        })

        it.only(`Pressing X button in the search should clear colors and searchtext`, () => {
            cy.get('[data-cy="feature-model-search"]').parent().parent().parent().parent().click();
            cy.get('[data-cy="feature-model-search"]').type(' A');
            cy.get('[class*="feature-node-container"]').children().contains('Root').siblings().first().should('have.class', 'is-searched-feature');
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').siblings().first().should('have.class', 'is-searched-feature');
            cy.get('[class*="feature-node-container"]').children().contains('Feature B').siblings().first().should('not.have.class', 'is-searched-feature');
            cy.get('[aria-label="clear icon"]').click();
            cy.get('[class*="feature-node-container"]').children().contains('Root').siblings().first().should('not.have.class', 'is-searched-feature');
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').siblings().first().should('not.have.class', 'is-searched-feature');
            cy.get('[class*="feature-node-container"]').children().contains('Feature B').siblings().first().should('not.have.class', 'is-searched-feature');
            cy.get('[data-cy="feature-model-search"]').should('have.value', '');
        })
    })
})