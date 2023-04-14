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

        it(`Collapse should collapse and expand`, () => {
            cy.get('[class*="feature-node-container"]').children().should('have.length', 3);
            cy.get('[class*="feature-node-container"]').children().contains('Root').rightclick();
            cy.get('[data-cy="context-menu-collapse"]').click();
            cy.get('[class*="feature-node-container"]').children().should('have.length', 1);
            cy.get('[class*="feature-node-container"]').children().contains('Root').rightclick();
            cy.get('[data-cy="context-menu-collapse"]').click();
            cy.get('[class*="feature-node-container"]').children().should('have.length', 3);
        })

        it(`Hide left nodes on "Feature B" should hide "Feature A"`, () => {
            cy.get('[class*="feature-node-container"]').children('.node').should('have.length', 3);
            cy.get('[class*="feature-node-container"]').children('.pseudo-node').should('not.exist');
            cy.get('[class*="feature-node-container"]').children().contains('Feature B').rightclick();
            cy.get('[data-cy="context-menu-hide-nodes"]').click();
            cy.get('[data-cy="context-menu-hide-left-siblings"]').click();
            cy.get('[class*="feature-node-container"]').children('.node').contains('Feature B').should('exist');
            cy.get('[class*="feature-node-container"]').children('.node').contains('Root').should('exist');
            cy.get('[class*="feature-node-container"]').children('.node').contains('Feature A').should('not.exist');
            cy.get('[class*="feature-node-container"]').children('.pseudo-node').should('have.length', 1);
            cy.get('[class*="feature-node-container"]').children().contains('Feature B').rightclick();
            cy.get('[data-cy="context-menu-hide-nodes"]').click();
            cy.get('[data-cy="context-menu-hide-left-siblings"]').click();
            cy.get('[class*="feature-node-container"]').children('.node').should('have.length', 3);
            cy.get('[class*="feature-node-container"]').children('.pseudo-node').should('not.exist');
        })

        it(`Hide right nodes on "Feature A" should hide "Feature B"`, () => {
            cy.get('[class*="feature-node-container"]').children('.node').should('have.length', 3);
            cy.get('[class*="feature-node-container"]').children('.pseudo-node').should('not.exist');
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').rightclick();
            cy.get('[data-cy="context-menu-hide-nodes"]').click();
            cy.get('[data-cy="context-menu-hide-right-siblings"]').click();
            cy.get('[class*="feature-node-container"]').children('.node').contains('Feature B').should('not.exist');
            cy.get('[class*="feature-node-container"]').children('.node').contains('Root').should('exist');
            cy.get('[class*="feature-node-container"]').children('.node').contains('Feature A').should('exist');
            cy.get('[class*="feature-node-container"]').children('.pseudo-node').should('have.length', 1);
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').rightclick();
            cy.get('[data-cy="context-menu-hide-nodes"]').click();
            cy.get('[data-cy="context-menu-hide-right-siblings"]').click();
            cy.get('[class*="feature-node-container"]').children('.node').should('have.length', 3);
            cy.get('[class*="feature-node-container"]').children('.pseudo-node').should('not.exist');
            //TODO: this functionality is bugged atm. see: https://github.com/h3ssto/ddueruem-web/issues/349
        })

        it(`Hide current node on "Feature A" should hide "Feature A"`, () => {
            cy.get('[class*="feature-node-container"]').children('.node').should('have.length', 3);
            cy.get('[class*="feature-node-container"]').children('.pseudo-node').should('not.exist');
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').rightclick();
            cy.get('[data-cy="context-menu-hide-nodes"]').click();
            cy.get('[data-cy="context-menu-hide-current-node"]').click();
            cy.get('[class*="feature-node-container"]').children('.node').contains('Feature B').should('exist');
            cy.get('[class*="feature-node-container"]').children('.node').contains('Root').should('exist');
            cy.get('[class*="feature-node-container"]').children('.node').contains('Feature A').should('not.exist');
            cy.get('[class*="feature-node-container"]').children('.pseudo-node').should('have.length', 1);
        })

        it(`Hide all other nodes on every level on "Feature A" should hide "Feature B" and children of "Feature A"`, () => {
            // add some children
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').rightclick();
            cy.contains('Add', { matchCase: true }).click();
            cy.contains('Add as child', { matchCase: true }).click();
            cy.get('[data-cy="add-feature-name"]').get('input').eq(1).type('Feature C');
            cy.get('[data-cy="tree-add-dialog-add-btn"]').click();

            // fit to view
            cy.get('[data-cy="feature-model-toolbar-view"]').click();
            cy.contains('Fit to view', { matchCase: true }).click();

            cy.get('[class*="feature-node-container"]').children('.node').should('have.length', 4);
            cy.get('[class*="feature-node-container"]').children('.pseudo-node').should('not.exist');
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').rightclick();
            cy.get('[data-cy="context-menu-hide-nodes"]').click();
            cy.get('[data-cy="context-menu-hide-all-other-nodes"]').click();
            cy.get('[class*="feature-node-container"]').children('.node').contains('Feature A').should('exist');
            cy.get('[class*="feature-node-container"]').children('.node').contains('Root').should('exist');
            cy.get('[class*="feature-node-container"]').children('.node').contains('Feature B').should('not.exist');
            cy.get('[class*="feature-node-container"]').children('.node').contains('Feature C').should('not.exist');
            cy.get('[class*="feature-node-container"]').children('.node').should('have.length', 2);
            cy.get('[class*="feature-node-container"]').children('.pseudo-node').should('have.length', 1);
        })

        it(`Hide all other siblings on this level on "Feature A" should hide "Feature B" and not children of "Feature A"`, () => {
            // add some children
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').rightclick();
            cy.contains('Add', { matchCase: true }).click();
            cy.contains('Add as child', { matchCase: true }).click();
            cy.get('[data-cy="add-feature-name"]').get('input').eq(1).type('Feature C');
            cy.get('[data-cy="tree-add-dialog-add-btn"]').click();

            // fit to view
            cy.get('[data-cy="feature-model-toolbar-view"]').click();
            cy.contains('Fit to view', { matchCase: true }).click();

            cy.get('[class*="feature-node-container"]').children('.node').should('have.length', 4);
            cy.get('[class*="feature-node-container"]').children('.pseudo-node').should('not.exist');
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').rightclick();
            cy.get('[data-cy="context-menu-hide-nodes"]').click();
            cy.get('[data-cy="context-menu-hide-all-other-siblings"]').click();
            cy.get('[class*="feature-node-container"]').children('.node').contains('Feature A').should('exist');
            cy.get('[class*="feature-node-container"]').children('.node').contains('Root').should('exist');
            cy.get('[class*="feature-node-container"]').children('.node').contains('Feature B').should('not.exist');
            cy.get('[class*="feature-node-container"]').children('.node').contains('Feature C').should('exist');
            cy.get('[class*="feature-node-container"]').children('.node').should('have.length', 3);
            cy.get('[class*="feature-node-container"]').children('.pseudo-node').should('have.length', 1);
        })

        it(`Highlight constraints on "Feature A" should show involved nodes colorized`, () => {
            cy.get('[data-cy="feature-model-constraints-button"]').click();
            cy.get('[data-cy="add-constraint-button"]').click();
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{enter}');   //select Feature A
            cy.get('[data-cy="add-constraint-and-button"]').click({force: true});
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{downArrow}{enter}'); //select Feature B
            cy.get('[data-cy="add-constraint-add-button"]').click();
            cy.get('[data-cy="close-constraint-window-button"]').click();

            cy.get('[class*="highlighted-constraints-container"]').children().should('have.length', 0);
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').rightclick();
            cy.get('[data-cy="context-menu-highlight-constraints"]').click();
            cy.get('[class*="highlighted-constraints-container"]').children().should('have.length', 2);
        })

        it(`Reset Highlight constraints on "Feature A" should remove involved nodes coloring`, () => {
            cy.get('[data-cy="feature-model-constraints-button"]').click();
            cy.get('[data-cy="add-constraint-button"]').click();
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{enter}');   //select Feature A
            cy.get('[data-cy="add-constraint-and-button"]').click({force: true});
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{downArrow}{enter}'); //select Feature B
            cy.get('[data-cy="add-constraint-add-button"]').click();
            cy.get('[data-cy="close-constraint-window-button"]').click();

            cy.get('[class*="highlighted-constraints-container"]').children().should('have.length', 0);
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').rightclick();
            cy.get('[data-cy="context-menu-highlight-constraints"]').click();
            cy.get('[class*="highlighted-constraints-container"]').children().should('have.length', 2);

            cy.get('[class*="feature-node-container"]').children().contains('Feature A').rightclick();
            cy.get('[data-cy="context-menu-reset-highlight-constraints"]').click();
            cy.get('[class*="highlighted-constraints-container"]').children().should('have.length', 0);
        })

        it(`Edit feature name should change name`, () => {
            cy.get('[class*="feature-node-container"]').children().contains('Root').should('exist');
            cy.get('[class*="feature-node-container"]').children().contains('Root').rightclick();
            cy.contains('Edit', { matchCase: true }).click();
            cy.get('[data-cy="edit-feature-name"]').get('input').eq(1).clear();
            cy.get('[data-cy="edit-feature-name"]').get('input').eq(1).type('hello');
            cy.get('[data-cy="tree-edit-dialog-edit-btn"]').click();
            cy.get('[class*="feature-node-container"]').children().contains('Root').should('not.exist');
            cy.get('[class*="feature-node-container"]').children().contains('hello').should('exist');
        })

        it(`Add as child should add child`, () => {
            cy.get('[class*="feature-node-container"]').children().contains('Feature C').should('not.exist');
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').rightclick();
            cy.contains('Add', { matchCase: true }).click();
            cy.contains('Add as child', { matchCase: true }).click();
            cy.get('[data-cy="add-feature-name"]').get('input').eq(1).type('Feature C');
            cy.get('[data-cy="tree-add-dialog-add-btn"]').click();
            cy.get('[class*="feature-node-container"]').children().contains('Feature C').should('exist');
        })

        it(`Add as sibling should add sibling`, () => {
            cy.get('[class*="feature-node-container"]').children().contains('Feature C').should('not.exist');
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').rightclick();
            cy.contains('Add', { matchCase: true }).click();
            cy.contains('Add as sibling', { matchCase: true }).click();
            cy.get('[data-cy="add-feature-name"]').get('input').eq(1).type('Feature C');
            cy.get('[data-cy="tree-add-dialog-add-btn"]').click();
            cy.get('[class*="feature-node-container"]').children().contains('Feature C').should('exist');
        })
    })
})