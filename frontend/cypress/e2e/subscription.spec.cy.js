/* eslint-disable no-undef */
describe('Subscription renewal', () => {
  it('clicking Pay now increases Days Left by 31', () => {
    // Prepare initial user data: subscription expiry 10 days from now
    const now = new Date()
    const msPerDay = 24 * 60 * 60 * 1000
    const initialExpiry = new Date(now.getTime() + 10 * msPerDay).toISOString()

    const user = {
      id: 0,
      name: 'Test User',
      subscription: {
        plan_id: '1m',
        expiry: initialExpiry,
      },
    }
    let currentUser = Object.assign({}, user)

    // Plan data (if page fetches it)
    const plan = {
      id: '1m',
      label: '1 month'
    }

    // Intercept the user GET used by the page. Return `currentUser` so we can update it after PATCH.
    cy.intercept('GET', '/api/users/0', (req) => {
      req.reply({ statusCode: 200, body: currentUser })
    }).as('getUser')

    // If the page fetches a plan endpoint, stub it too
    cy.intercept('GET', '/api/plans/*', { statusCode: 200, body: plan }).as('getPlan')

    // Intercept the PATCH extend-subscription call. Return a new expiry 31 days later.
    cy.intercept('PATCH', '/api/users/0/extend-subscription/*', (req) => {
      const newExpiry = new Date(new Date(currentUser.subscription.expiry).getTime() + 31 * msPerDay).toISOString()
      const updatedUser = Object.assign({}, currentUser, {
        subscription: Object.assign({}, currentUser.subscription, { expiry: newExpiry }),
      })
      // update the GET responder's currentUser so subsequent refetches return the updated expiry
      currentUser = updatedUser
      req.reply({ statusCode: 200, body: updatedUser })
    }).as('extendSubscription')

    // Visit the subscriptions page
    cy.visit('/subscriptions')

    // Wait for initial user load
    cy.wait('@getUser')

    // Find the element that shows Days Left. The SubscriptionCard renders the numeric value in
    // `.subscription-value-ui` alongside a `.subscription-label-ui` that contains the text "Days Left".
    cy.contains('.subscription-label-ui', /Days Left/i).should('exist')

    // Extract the initial days left number by finding the sibling value element.
    cy.contains('.subscription-label-ui', /Days Left/i)
      .parent()
      .find('.subscription-value-ui')
      .invoke('text')
      .then((text) => {
        const initialDays = parseInt(text.trim(), 10)

        // Click the Pay now button associated with the subscription card
        cy.contains('button', /Pay now/i).click()

        // Wait for PATCH request and for the refetch of the user data
        cy.wait('@extendSubscription')
        cy.wait('@getUser')

        // After the server responds and the query refetch completes, the UI should update.
        // Wait for the Days Left value to be a valid number (not "—")
        cy.contains('.subscription-label-ui', /Days Left/i)
          .parent()
          .find('.subscription-value-ui')
          .should('not.contain', '—')
          .invoke('text')
          .then((updatedText) => {
            const updatedDays = parseInt(updatedText.trim(), 10)
            expect(updatedDays).to.equal(initialDays + 31)
          })
      })
  })
})
