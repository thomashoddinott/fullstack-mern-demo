/* eslint-disable no-undef */
describe('Contact Us E2E', () => {
  beforeEach(() => {
    // Default stub for POST /api/contact
    cy.intercept('POST', '/api/contact', (req) => {
      req.reply({ statusCode: 200, body: { success: true } });
    }).as('postContact')
  })

  it('submits Contact Us form and shows success then closes', () => {
    cy.visit('http://localhost:5173/about')

    // Open the contact form
    cy.contains('button', 'Contact Us').click()

    // Fill required fields
    cy.get('input[placeholder="Name"]').type('Cypress Tester')
    cy.get('input[placeholder="Email"]').type('cypress@example.com')
    cy.get('textarea[placeholder="Message"]').type('Hello from Cypress E2E test')

    // Submit
    cy.contains('button', 'Send').click()

    // Assert API was called with expected payload
    cy.wait('@postContact').its('request.body').should((body) => {
      expect(body).to.have.property('name', 'Cypress Tester')
      expect(body).to.have.property('email', 'cypress@example.com')
      expect(body).to.have.property('message', 'Hello from Cypress E2E test')
    })

    // Success message (matches AboutPage successMessage for Contact Us)
    cy.contains('Message sent — thanks!').should('be.visible')

    // Form should auto-close after the configured delay (AboutPage uses 700ms)
    cy.wait(1200)
    cy.get('textarea[placeholder="Message"]').should('not.exist')
  })

  it('prefills Book Trial Lesson and can submit', () => {
    // Use a separate intercept alias for clarity
    cy.intercept('POST', '/api/contact', { statusCode: 200, body: { success: true } }).as('postContact2')

    cy.visit('http://localhost:5173/about')
    cy.contains('button', 'Book Trial Lesson').click()

    // Prefilled subject and message from AboutPage
    cy.get('input[placeholder="Subject (optional)"]').should('have.value', 'Trial lesson')
    cy.get('textarea[placeholder="Message"]').should('have.value', "I'm interested in trying BJJ...")

    // Fill required fields and submit
    cy.get('input[placeholder="Name"]').type('Trial User')
    cy.get('input[placeholder="Email"]').type('trial@example.com')
    cy.contains('button', 'Send').click()

    cy.wait('@postContact2').its('request.body').should((body) => {
      expect(body.subject).to.equal('Trial lesson')
      expect(body.message).to.contain("I'm interested in trying BJJ")
      expect(body.name).to.equal('Trial User')
    })

    // AboutPage sets a different success message for trial flow
    cy.contains('Someone will be in touch shortly').should('be.visible')
  })

})
