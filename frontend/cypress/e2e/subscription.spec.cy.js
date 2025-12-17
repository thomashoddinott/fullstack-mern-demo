/* eslint-disable no-undef */
describe('Subscription renewal', () => {
  it('clicking Pay now increases Days Left by 31', () => {
    // Prepare initial user data: subscription expiry 10 days from now
    const now = new Date()
    const msPerDay = 24 * 60 * 60 * 1000
    const initialExpiry = new Date(now.getTime() + 10 * msPerDay).toISOString()

    const user = {
      _id: '0',
      name: 'Test User',
      subscription: {
        plan_id: 'basic',
        expiry: initialExpiry,
      },
    }

    // Plan data (if page fetches it)
    const plan = {
      id: 'basic',
      label: 'Basic Plan',
      months: 1,
    }

    // Intercept the user GET used by the page
    cy.intercept('GET', '/api/users/0', { statusCode: 200, body: user }).as('getUser')

    // If the page fetches a plan endpoint, stub it too
    cy.intercept('GET', '/api/plans/*', { statusCode: 200, body: plan }).as('getPlan')

    // Intercept the PATCH extend-subscription call. Return a new expiry 31 days later.
    cy.intercept('PATCH', '/api/users/0/extend-subscription/*', (req) => {
      const newExpiry = new Date(new Date(user.subscription.expiry).getTime() + 31 * msPerDay).toISOString()
      const updatedUser = Object.assign({}, user, {
        subscription: Object.assign({}, user.subscription, { expiry: newExpiry }),
      })
      req.reply({ statusCode: 200, body: updatedUser })
    }).as('extendSubscription')

    // Visit the subscriptions page
    cy.visit('/subscriptions')

    // Wait for initial user load
    cy.wait('@getUser')

    // Find the element that shows Days Left. The SubscriptionCard displays text like "Days Left: X"
    cy.contains(/Days Left/i).should('exist')

    // Extract the initial days left number
    cy.contains(/Days Left[:]?/i)
      .invoke('text')
      .then((text) => {
        const match = text.match(/(\d+)\s*$/)
        // If text ends with number, take it, otherwise attempt to find any number
        const initialDays = match ? parseInt(match[1], 10) : Number(text.replace(/[^0-9]/g, ''))
        // Click the Pay now button associated with the subscription card
        cy.contains('button', /Pay now/i).click()

        // Wait for PATCH request
        cy.wait('@extendSubscription')

        // After the server responds, the UI should update. Find Days Left again and assert it's increased by 31.
        cy.contains(/Days Left[:]?/i)
          .invoke('text')
          .then((updatedText) => {
            const updatedMatch = updatedText.match(/(\d+)\s*$/)
            const updatedDays = updatedMatch ? parseInt(updatedMatch[1], 10) : Number(updatedText.replace(/[^0-9]/g, ''))
            expect(updatedDays).to.equal(initialDays + 31)
          })
      })
  })
})
