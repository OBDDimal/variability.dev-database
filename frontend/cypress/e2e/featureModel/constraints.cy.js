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

        it(`Adding a constraint should add chip in constraint view`, () => {
            cy.get('[data-cy="feature-model-constraints-button"]').click();
            cy.get('[data-cy="constraint-chip"]').should('not.exist');
            cy.get('[data-cy="add-constraint-button"]').click();
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{enter}');   //select Feature A
            cy.get('[data-cy="add-constraint-and-button"]').click({force: true});
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{downArrow}{enter}'); //select Feature B
            cy.get('[data-cy="add-constraint-add-button"]').click();
            cy.get('[data-cy="constraint-chip"]').should('have.length', 1);
        })

        it(`Undo should revert the constraint operation`, () => {
            //add constraint
            cy.get('[data-cy="feature-model-constraints-button"]').click();
            cy.get('[data-cy="undo-constraint-operation-button"]').should('be.disabled');
            cy.get('[data-cy="constraint-chip"]').should('not.exist');
            cy.get('[data-cy="add-constraint-button"]').click();
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{enter}');   //select Feature A
            cy.get('[data-cy="add-constraint-and-button"]').click({force: true});
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{downArrow}{enter}'); //select Feature B
            cy.get('[data-cy="add-constraint-add-button"]').click();
            cy.get('[data-cy="constraint-chip"]').should('have.length', 1);
            
            //undo
            cy.get('[data-cy="undo-constraint-operation-button"]').should('not.be.disabled');
            cy.get('[data-cy="undo-constraint-operation-button"]').click();
            cy.get('[data-cy="constraint-chip"]').should('not.exist');
            cy.get('[data-cy="undo-constraint-operation-button"]').should('be.disabled');
            cy.get('[data-cy="redo-constraint-operation-button"]').should('not.be.disabled');
        })

        it(`Redo should redo the constraint operation`, () => {
            //add constraint
            cy.get('[data-cy="feature-model-constraints-button"]').click();
            cy.get('[data-cy="undo-constraint-operation-button"]').should('be.disabled');
            cy.get('[data-cy="constraint-chip"]').should('not.exist');
            cy.get('[data-cy="add-constraint-button"]').click();
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{enter}');   //select Feature A
            cy.get('[data-cy="add-constraint-and-button"]').click({force: true});
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{downArrow}{enter}'); //select Feature B
            cy.get('[data-cy="add-constraint-add-button"]').click();
            cy.get('[data-cy="constraint-chip"]').should('have.length', 1);
            
            //undo
            cy.get('[data-cy="undo-constraint-operation-button"]').should('not.be.disabled');
            cy.get('[data-cy="undo-constraint-operation-button"]').click();
            cy.get('[data-cy="constraint-chip"]').should('not.exist');
            cy.get('[data-cy="undo-constraint-operation-button"]').should('be.disabled');
            cy.get('[data-cy="redo-constraint-operation-button"]').should('not.be.disabled');

            //redo
            cy.get('[data-cy="redo-constraint-operation-button"]').click();
            cy.get('[data-cy="constraint-chip"]').should('exist');
            cy.get('[data-cy="undo-constraint-operation-button"]').should('not.be.disabled');
            cy.get('[data-cy="redo-constraint-operation-button"]').should('be.disabled');
        })

        it(`Close should close the constraint window`, () => {
            cy.get('[data-cy="add-constraint-button"]').should('not.exist')
            cy.get('[data-cy="feature-model-constraints-button"]').click();
            cy.get('[data-cy="add-constraint-button"]').should('be.visible')
            cy.get('[data-cy="close-constraint-window-button"]').click();
            cy.get('[data-cy="add-constraint-button"]').should('not.be.visible')
        })

        it(`Clicking chip should colorize the chip and the involved nodes`, () => {
            cy.get('[data-cy="feature-model-constraints-button"]').click();
            cy.get('[data-cy="add-constraint-button"]').click();
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{enter}');   //select Feature A
            cy.get('[data-cy="add-constraint-and-button"]').click({force: true});
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{downArrow}{enter}'); //select Feature B
            cy.get('[data-cy="add-constraint-add-button"]').click();
            
            cy.get('[data-cy="constraint-chip"]').should('have.attr', 'style', 'color: rgb(255, 255, 255);');
            cy.get('[class*="highlighted-constraints-container"]').children().should('have.length', 0);
            cy.get('[data-cy="constraint-chip"]').click();
            cy.get('[data-cy="constraint-chip"]').should('have.attr', 'style', 'color: rgb(255, 255, 255); background-color: rgb(244, 91, 105); border-color: rgb(244, 91, 105);');
            cy.get('[class*="highlighted-constraints-container"]').children().should('have.length', 2);
        })

        it(`Searching existing constraint should yield it as chip`, () => {
            cy.get('[data-cy="feature-model-constraints-button"]').click();
            cy.get('[data-cy="constraint-chip"]').should('not.exist');
            cy.get('[data-cy="add-constraint-button"]').click();
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{enter}');   //select Feature A
            cy.get('[data-cy="add-constraint-and-button"]').click({force: true});
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{downArrow}{enter}'); //select Feature B
            cy.get('[data-cy="add-constraint-add-button"]').click();
            cy.get('[data-cy="constraint-chip"]').should('have.length', 1);

            cy.get('[data-cy="constraint-search"]').type('Feature A');
            cy.get('[data-cy="constraint-chip"]').should('have.length', 1);
            cy.get('[data-cy="constraint-search"]').clear();
            cy.get('[data-cy="constraint-chip"]').should('have.length', 1);
        })

        it(`Searching non-existing constraint should yield no chips`, () => {
            cy.get('[data-cy="feature-model-constraints-button"]').click();
            cy.get('[data-cy="constraint-chip"]').should('not.exist');
            cy.get('[data-cy="add-constraint-button"]').click();
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{enter}');   //select Feature A
            cy.get('[data-cy="add-constraint-and-button"]').click({force: true});
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{downArrow}{enter}'); //select Feature B
            cy.get('[data-cy="add-constraint-add-button"]').click();
            cy.get('[data-cy="constraint-chip"]').should('have.length', 1);

            cy.get('[data-cy="constraint-search"]').type('Root');
            cy.get('[data-cy="constraint-chip"]').should('not.exist');
            cy.get('[data-cy="constraint-search"]').clear();
            cy.get('[data-cy="constraint-chip"]').should('have.length', 1);
        })

        it(`Deleting a constraint should remove the chip`, () => {
            cy.get('[data-cy="feature-model-constraints-button"]').click();
            cy.get('[data-cy="constraint-chip"]').should('not.exist');
            cy.get('[data-cy="add-constraint-button"]').click();
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{enter}');   //select Feature A
            cy.get('[data-cy="add-constraint-and-button"]').click({force: true});
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{downArrow}{enter}'); //select Feature B
            cy.get('[data-cy="add-constraint-add-button"]').click();
            cy.get('[data-cy="constraint-chip"]').should('have.length', 1);

            cy.get('[data-cy="constraint-delete"]').click();
            cy.get('[data-cy="constraint-chip"]').should('not.exist');
        })

        it(`Editing a constraint should adjust the chip`, () => {
            cy.get('[data-cy="feature-model-constraints-button"]').click();
            cy.get('[data-cy="constraint-chip"]').should('not.exist');
            cy.get('[data-cy="add-constraint-button"]').click();
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{enter}');   //select Feature A
            cy.get('[data-cy="add-constraint-and-button"]').click({force: true});
            cy.get('[data-cy="add-constraint-select-node-input"]').click().type('{downArrow}{downArrow}{downArrow}{enter}'); //select Feature B
            cy.get('[data-cy="add-constraint-add-button"]').click();
            cy.get('[data-cy="constraint-chip"]').should('have.length', 1);
            cy.get('[data-cy="constraint-chip"]').contains(' "Feature A" ∧ "Feature B" ').should('exist');

            cy.get('[data-cy="constraint-edit"]').click();
            cy.get('[data-cy="constraint-text"]').type('{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}Root');
            cy.get('[data-cy="add-constraint-add-button"]').click();
            cy.get('[data-cy="constraint-chip"]').contains(' "Feature A" ∧ Root ').should('exist');
        })
    })
})