describe('Navigation tests', () => {
    context('720p resolution', () => {

        beforeEach(() => {
            cy.viewport(1280, 720)
        })

        describe('Non-logged-in navigations', () => {
            it(`Home navigation`, () => {
                cy.visit('localhost:8080');
                cy.contains('Home', { matchCase: false }).click();
                cy.url().should('eq', 'http://localhost:8080/');
            })

            it(`Register navigation`, () => {
                cy.visit('localhost:8080');
                cy.contains('Register', { matchCase: false }).click();
                cy.url().should('include', '/register');
            })

            it(`Login navigation`, () => {
                cy.visit('localhost:8080');
                cy.contains('Login', { matchCase: false }).click();
                cy.url().should('include', '/login');
            })

            it(`DarkTheme navigation`, () => {
                cy.visit('localhost:8080');
                cy.get('.theme-button > span > .mdi-brightness-4');
                cy.get('.theme-button').click();
                cy.get('.theme-button > span > .mdi-brightness-7');
            })

        })

        describe('Logged-in navigations', () => {
            beforeEach(() => {
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
            })

            afterEach(() => {
                if(Cypress.platform === 'win32'){
                    cy.exec('venv\\Scripts\\python.exe ../backend/manage.py runscript delete_test_user')
                } else {
                    cy.exec("./venv/bin/python ../backend/manage.py runscript delete_test_user")
                }
                localStorage.clear();
            })

            it(`Profile navigation`, () => {
                cy.visit('localhost:8080');
                cy.contains('Profile', { matchCase: false }).click();
                cy.url().should('include', '/profile');
            })

            it(`Files navigation`, () => {
                cy.visit('localhost:8080');
                cy.contains('Files', { matchCase: false }).click();
                cy.url().should('include', '/files');
            })

            it(`Tags navigation`, () => {
                cy.visit('localhost:8080');
                cy.contains('Tags', { matchCase: false }).click();
                cy.url().should('include', '/tags');
            })

            it(`Families navigation`, () => {
                cy.visit('localhost:8080');
                cy.contains('Families', { matchCase: false }).click();
                cy.url().should('include', '/families');
            })

            it(`Logout navigation`, () => {
                cy.visit('localhost:8080/families');
                cy.contains('Logout', { matchCase: false }).click();
                cy.url().should('eq', 'http://localhost:8080/');
            })
        })
    })

    context('Mobile resolution (360x760)', () => {

        beforeEach(() => {
            cy.viewport('samsung-s10');
        })

        describe('Non-logged-in navigations', () => {
            it(`Home navigation`, () => {
                cy.visit('localhost:8080');
                cy.get('.drawer-button').click();
                cy.get('.mobile-navigation').contains('Home', { matchCase: false }).click();
                cy.url().should('eq', 'http://localhost:8080/');
            })

            it(`Register navigation`, () => {
                cy.visit('localhost:8080');
                cy.get('.drawer-button').click();
                cy.get('.mobile-navigation').contains('Register', { matchCase: false }).click();
                cy.url().should('include', '/register');
            })

            it(`Login navigation`, () => {
                cy.visit('localhost:8080');
                cy.get('.drawer-button').click();
                cy.get('.mobile-navigation').contains('Login', { matchCase: false }).click();
                cy.url().should('include', '/login');
            })

            it(`DarkTheme navigation`, () => {
                cy.visit('localhost:8080');
                cy.get('.drawer-button').click();
                cy.get('.mobile-theme-button > div > .mdi-brightness-4');
                cy.get('.mobile-theme-button').click();
                cy.get('.mobile-theme-button > div > .mdi-brightness-7');
            })

        })

        describe('Logged-in navigations', () => {
            beforeEach(() => {
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
            })

            afterEach(() => {
                if(Cypress.platform === 'win32'){
                    cy.exec('venv\\Scripts\\python.exe ../backend/manage.py runscript delete_test_user')
                } else {
                    cy.exec("./venv/bin/python ../backend/manage.py runscript delete_test_user")
                }
                localStorage.clear();
            })

            it(`Profile navigation`, () => {
                cy.visit('localhost:8080');
                cy.get('.drawer-button').click();
                cy.get('.mobile-navigation').contains('Profile', { matchCase: false }).click();
                cy.url().should('include', '/profile');
            })

            it(`Files navigation`, () => {
                cy.visit('localhost:8080');
                cy.get('.drawer-button').click();
                cy.get('.mobile-navigation').contains('Files', { matchCase: false }).click();
                cy.url().should('include', '/files');
            })

            it(`Tags navigation`, () => {
                cy.visit('localhost:8080');
                cy.get('.drawer-button').click();
                cy.get('.mobile-navigation').contains('Tags', { matchCase: false }).click();
                cy.url().should('include', '/tags');
            })

            it(`Families navigation`, () => {
                cy.visit('localhost:8080');
                cy.get('.drawer-button').click();
                cy.get('.mobile-navigation').contains('Families', { matchCase: false }).click();
                cy.url().should('include', '/families');
            })

            it(`Logout navigation`, () => {
                cy.visit('localhost:8080/families');
                cy.get('.drawer-button').click();
                cy.get('.mobile-navigation').contains('Logout', { matchCase: false }).click();
                cy.url().should('eq', 'http://localhost:8080/');
            })
        })
    })
})