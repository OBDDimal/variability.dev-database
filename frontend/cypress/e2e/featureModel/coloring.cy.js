describe('Coloring tests', () => {
    const coloringTypes = ['Count', 'Direct Children', 'Total Children'];
    coloringTypes.forEach(coloringType => {
        it(`Colors with ${coloringType}`, () => {
        cy.visit('localhost:8080/feature-model');

            cy.get('.mdi-palette').click();
            cy.get('div').contains(coloringType).click();
            cy.get('.feature-node-container rect').each(e => {
                cy.wrap(e).invoke('attr', 'fill').should(e => {
                    expect(e).to.match(/rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)/)
                });
            });
        })
    });
})