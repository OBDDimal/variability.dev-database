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

            it(`DSGVO navigation`, () => {
                cy.visit('localhost:8080');
                cy.contains('dsgvo', { matchCase: false }).click();
                cy.url().should('include', '/dsgvo');
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

        // TODO: figure out programmatical login (https://docs.cypress.io/guides/end-to-end-testing/testing-your-app#Bypassing-your-UI)
        // describe('Logged-in navigations', () => {
        //     it(`Profile navigation`, () => {
        //         cy.visit('localhost:8080');
        //         cy.contains('Profile', { matchCase: false }).click();
        //         cy.url().should('include', '/profile');
        //     })

        //     it(`Files navigation`, () => {
        //         cy.visit('localhost:8080');
        //         cy.contains('Files', { matchCase: false }).click();
        //         cy.url().should('include', '/files');
        //     })

        //     it(`Tags navigation`, () => {
        //         cy.visit('localhost:8080');
        //         cy.contains('Tags', { matchCase: false }).click();
        //         cy.url().should('include', '/tags');
        //     })

        //     it(`Families navigation`, () => {
        //         cy.visit('localhost:8080');
        //         cy.contains('Families', { matchCase: false }).click();
        //         cy.url().should('include', '/families');
        //     })

        //     it(`Logout navigation`, () => {
        //         cy.visit('localhost:8080/families');
        //         cy.contains('Logout', { matchCase: false }).click();
        //         cy.url().should('eq', 'http://localhost:8080/');
        //     })
        // })
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

            it(`DSGVO navigation`, () => {
                cy.visit('localhost:8080');
                cy.get('.drawer-button').click();
                cy.get('.mobile-navigation').contains('dsgvo', { matchCase: false }).click();
                cy.url().should('include', '/dsgvo');
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

        // describe('Logged-in navigations', () => {
        //     it(`Profile navigation`, () => {
        //         cy.visit('localhost:8080');
        //         cy.get('.drawer-button').click();
        //         cy.contains('Profile', { matchCase: false }).click();
        //         cy.url().should('include', '/profile');
        //     })

        //     it(`Files navigation`, () => {
        //         cy.visit('localhost:8080');
        //         cy.get('.drawer-button').click();
        //         cy.contains('Files', { matchCase: false }).click();
        //         cy.url().should('include', '/files');
        //     })

        //     it(`Tags navigation`, () => {
        //         cy.visit('localhost:8080');
        //         cy.get('.drawer-button').click();
        //         cy.contains('Tags', { matchCase: false }).click();
        //         cy.url().should('include', '/tags');
        //     })

        //     it(`Families navigation`, () => {
        //         cy.visit('localhost:8080');
        //         cy.get('.drawer-button').click();
        //         cy.contains('Families', { matchCase: false }).click();
        //         cy.url().should('include', '/families');
        //     })

        //     it(`Logout navigation`, () => {
        //         cy.visit('localhost:8080/families');
        //         cy.get('.drawer-button').click();
        //         cy.contains('Logout', { matchCase: false }).click();
        //         cy.url().should('eq', 'http://localhost:8080/');
        //     })
        // })
    })
})