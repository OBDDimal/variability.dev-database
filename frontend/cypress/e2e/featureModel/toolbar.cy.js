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

        it(`New empty model`, () => {
            cy.get('.feature-node-container').children().should('have.length', 3);
            cy.get('.empty-model-icon').click();
            cy.get('.feature-node-container').children().should('have.length', 1);
        })

        // TODO: figure out localStorage access during testing
        // it(`Local storage save`, () => {
        //     expect(window.localStorage.getItem('featureModelData')).to.be.null;
        //     cy.get('#feature-model-toolbar-save').click();
        //     cy.contains('Save', { matchCase: true }).click();
        //     cy.wait(5000);
        //     expect(window.localStorage.getItem('featureModelData')).to.not.be.null;
        // })

        it(`Undo changes`, () => {
            cy.get('#feature-model-toolbar-undo').should('have.class', 'v-icon--disabled');
            cy.get('[class*="feature-node-container"]').children().contains('Root').should('exist');
            cy.get('[class*="feature-node-container"]').children().contains('Root').rightclick();
            cy.contains('Edit', { matchCase: true }).click();
            cy.get('[data-cy="edit-feature-name"]').get('input').eq(1).clear();
            cy.get('[data-cy="edit-feature-name"]').get('input').eq(1).type('hello');
            cy.get('[data-cy="tree-edit-dialog-edit-btn"]').click();
            cy.get('[class*="feature-node-container"]').children().contains('Root').should('not.exist');
            cy.get('[class*="feature-node-container"]').children().contains('hello').should('exist');
            cy.get('#feature-model-toolbar-undo').should('not.have.class', 'v-icon--disabled');
            cy.get('#feature-model-toolbar-undo').click();
            cy.get('[class*="feature-node-container"]').children().contains('Root').should('exist');
            cy.get('[class*="feature-node-container"]').children().contains('hello').should('not.exist');
        })

        it(`Redo changes`, () => {
            cy.get('[data-cy="feature-model-toolbar-redo"]').should('have.class', 'v-icon--disabled');
            cy.get('[class*="feature-node-container"]').children().contains('Root').should('exist');
            cy.get('[class*="feature-node-container"]').children().contains('Root').rightclick();
            cy.contains('Edit', { matchCase: true }).click();
            cy.get('[data-cy="edit-feature-name"]').get('input').eq(1).clear();
            cy.get('[data-cy="edit-feature-name"]').get('input').eq(1).type('hello');
            cy.get('[data-cy="tree-edit-dialog-edit-btn"]').click();
            cy.get('[class*="feature-node-container"]').children().contains('Root').should('not.exist');
            cy.get('[class*="feature-node-container"]').children().contains('hello').should('exist');
            cy.get('#feature-model-toolbar-undo').click();
            cy.get('[class*="feature-node-container"]').children().contains('Root').should('exist');
            cy.get('[class*="feature-node-container"]').children().contains('hello').should('not.exist');
            cy.get('[data-cy="feature-model-toolbar-redo"]').should('not.have.class', 'v-icon--disabled');
            cy.get('[data-cy="feature-model-toolbar-redo"]').click();
            cy.get('[class*="feature-node-container"]').children().contains('Root').should('not.exist');
            cy.get('[class*="feature-node-container"]').children().contains('hello').should('exist');
        })

        it(`Coloring count`, () => {
            cy.get('[class*="feature-node-container"]').children().contains('Root').siblings().first().should('have.attr', 'fill', 'rgb(204, 204, 255)');
            cy.get('[data-cy="feature-model-toolbar-coloring"]').click();
            cy.contains('Count', { matchCase: true }).click();
            cy.get('[class*="feature-node-container"]').children().contains('Root').siblings().first().should('have.attr', 'fill', 'rgb(0, 0, 0)');
            //TODO: count does not seem to work atm, every node is displayed as rgb(0, 0, 0)
        })

        it(`Coloring direct children`, () => {
            // add some children
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').rightclick();
            cy.contains('Add', { matchCase: true }).click();
            cy.contains('Add as child', { matchCase: true }).click();
            cy.get('[data-cy="add-feature-name"]').get('input').eq(1).type('Feature A1');
            cy.get('[data-cy="tree-add-dialog-add-btn"]').click();

            // fit to view
            cy.get('[data-cy="feature-model-toolbar-view"]').click();
            cy.contains('Fit to view', { matchCase: true }).click();

            cy.get('[class*="feature-node-container"]').children().contains('Feature A1').rightclick();
            cy.contains('Add', { matchCase: true }).click();
            cy.contains('Add as child', { matchCase: true }).click({force: true});
            cy.get('[data-cy="add-feature-name"]').get('input').eq(1).type('Feature A11');
            cy.get('[data-cy="tree-add-dialog-add-btn"]').click();

            // fit to view
            cy.get('[data-cy="feature-model-toolbar-view"]').click();
            cy.contains('Fit to view', { matchCase: true }).click();

            cy.get('[class*="feature-node-container"]').children().contains('Feature B').rightclick();
            cy.contains('Add', { matchCase: true }).click();
            cy.contains('Add as child', { matchCase: true }).click();
            cy.get('[data-cy="add-feature-name"]').get('input').eq(1).type('Feature B1');
            cy.get('[data-cy="tree-add-dialog-add-btn"]').click();

            cy.get('[class*="feature-node-container"]').children().contains('Feature B').rightclick();
            cy.contains('Add', { matchCase: true }).click();
            cy.contains('Add as child', { matchCase: true }).click({force: true});
            cy.get('[data-cy="add-feature-name"]').get('input').eq(1).type('Feature B2');
            cy.get('[data-cy="tree-add-dialog-add-btn"]').click();

            // check the colors
            cy.get('[data-cy="feature-model-toolbar-coloring"]').click();
            cy.contains('Direct Children', { matchCase: true }).click();

            cy.get('[class*="feature-node-container"]').children().contains('Root').siblings().first().should('have.attr', 'fill', 'rgb(110, 0, 42)');
            
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').siblings().first().should('have.attr', 'fill', 'rgb(78, 120, 181)');
            cy.get('[class*="feature-node-container"]').children().contains('Feature A1').siblings().first().should('have.attr', 'fill', 'rgb(78, 120, 181)');
            cy.get('[class*="feature-node-container"]').children().contains('Feature A11').siblings().first().should('have.attr', 'fill', 'rgb(0, 0, 61)');
            
            cy.get('[class*="feature-node-container"]').children().contains('Feature B').siblings().first().should('have.attr', 'fill', 'rgb(110, 0, 42)');
            cy.get('[class*="feature-node-container"]').children().contains('Feature B1').siblings().first().should('have.attr', 'fill', 'rgb(0, 0, 61)');
            cy.get('[class*="feature-node-container"]').children().contains('Feature B2').siblings().first().should('have.attr', 'fill', 'rgb(0, 0, 61)');
        })

        it(`Coloring total children`, () => {
            // add some children
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').rightclick();
            cy.contains('Add', { matchCase: true }).click();
            cy.contains('Add as child', { matchCase: true }).click();
            cy.get('[data-cy="add-feature-name"]').get('input').eq(1).type('Feature A1');
            cy.get('[data-cy="tree-add-dialog-add-btn"]').click();

            // fit to view
            cy.get('[data-cy="feature-model-toolbar-view"]').click();
            cy.contains('Fit to view', { matchCase: true }).click();

            cy.get('[class*="feature-node-container"]').children().contains('Feature A1').rightclick();
            cy.contains('Add', { matchCase: true }).click();
            cy.contains('Add as child', { matchCase: true }).click({force: true});
            cy.get('[data-cy="add-feature-name"]').get('input').eq(1).type('Feature A11');
            cy.get('[data-cy="tree-add-dialog-add-btn"]').click();

            // fit to view
            cy.get('[data-cy="feature-model-toolbar-view"]').click();
            cy.contains('Fit to view', { matchCase: true }).click();

            cy.get('[class*="feature-node-container"]').children().contains('Feature B').rightclick();
            cy.contains('Add', { matchCase: true }).click();
            cy.contains('Add as child', { matchCase: true }).click();
            cy.get('[data-cy="add-feature-name"]').get('input').eq(1).type('Feature B1');
            cy.get('[data-cy="tree-add-dialog-add-btn"]').click();

            cy.get('[class*="feature-node-container"]').children().contains('Feature B').rightclick();
            cy.contains('Add', { matchCase: true }).click();
            cy.contains('Add as child', { matchCase: true }).click({force: true});
            cy.get('[data-cy="add-feature-name"]').get('input').eq(1).type('Feature B2');
            cy.get('[data-cy="tree-add-dialog-add-btn"]').click();

            // check the colors
            cy.get('[data-cy="feature-model-toolbar-coloring"]').click();
            cy.contains('Total Children', { matchCase: true }).click();

            cy.get('[class*="feature-node-container"]').children().contains('Root').siblings().first().should('have.attr', 'fill', 'rgb(110, 0, 42)');
            
            cy.get('[class*="feature-node-container"]').children().contains('Feature A').siblings().first().should('have.attr', 'fill', 'rgb(128, 177, 204)');
            cy.get('[class*="feature-node-container"]').children().contains('Feature A1').siblings().first().should('have.attr', 'fill', 'rgb(78, 120, 181)');
            cy.get('[class*="feature-node-container"]').children().contains('Feature A11').siblings().first().should('have.attr', 'fill', 'rgb(30, 64, 157)');
            
            cy.get('[class*="feature-node-container"]').children().contains('Feature B').siblings().first().should('have.attr', 'fill', 'rgb(128, 177, 204)');
            cy.get('[class*="feature-node-container"]').children().contains('Feature B1').siblings().first().should('have.attr', 'fill', 'rgb(30, 64, 157)');
            cy.get('[class*="feature-node-container"]').children().contains('Feature B2').siblings().first().should('have.attr', 'fill', 'rgb(30, 64, 157)');
        })
    })
})