/* eslint-disable no-undef */
describe("Subscription renewal", () => {
  const TEST_USER_ID = "TwIjD4UmW4UJo4d8Vgg0CYR7HCy2"

  it("clicking Pay now initiates Stripe checkout with correct data", () => {
    // Prepare initial user data: subscription expiry 10 days from now
    const now = new Date()
    const msPerDay = 24 * 60 * 60 * 1000
    const initialExpiry = new Date(now.getTime() + 10 * msPerDay).toISOString()

    const user = {
      id: TEST_USER_ID,
      name: "John Firebase",
      subscription: {
        plan_id: "1m",
        expiry: initialExpiry,
      },
    }

    // Plan data
    const plan = {
      id: "1m",
      label: "1 month",
      price: "$99",
      billing: "Monthly",
    }

    const plans = [plan]

    // Intercept the user GET
    cy.intercept("GET", `/api/users/${TEST_USER_ID}`, { statusCode: 200, body: user }).as(
      "getUser"
    )

    // Intercept avatar
    cy.intercept("GET", `/api/users/${TEST_USER_ID}/avatar`, {
      statusCode: 200,
      headers: { "content-type": "image/jpeg" },
      body: "",
    }).as("getAvatar")

    // Intercept the plans endpoint
    cy.intercept("GET", "/api/plans", { statusCode: 200, body: plans }).as("getPlans")

    // Intercept individual plan fetch
    cy.intercept("GET", "/api/plans/*", { statusCode: 200, body: plan }).as("getPlan")

    // Mock the Stripe checkout session creation
    cy.intercept("POST", "http://localhost:8000/api/checkout", (req) => {
      // Verify the request contains the correct plan data
      expect(req.body.plan.id).to.equal("1m")
      expect(req.body.plan.name).to.equal("1 month")
      expect(req.body.plan.price).to.equal(99)
      expect(req.body.userId).to.equal(TEST_USER_ID)

      // Don't actually respond - this will prevent the redirect
      // Just let it hang so we can verify the request was made
      req.reply({ forceNetworkError: true })
    }).as("createCheckout")

    // Sign in and visit the subscriptions page
    cy.signIn("/subscriptions")

    // Wait for initial data load
    cy.wait("@getUser")
    cy.wait("@getPlans")

    // Find the element that shows Days Left
    cy.contains(".subscription-label-ui", /Days Left/i).should("exist")

    // Click the Pay now button
    cy.contains("button", /Pay now/i).click()

    // Wait for and verify Stripe checkout session was requested with correct data
    cy.wait("@createCheckout").then((interception) => {
      // Additional verification
      expect(interception.request.body.plan.id).to.equal("1m")
      expect(interception.request.body.userId).to.equal(TEST_USER_ID)
    })
  })

  it("simulates successful payment and subscription extension", () => {
    // This test simulates the webhook flow after Stripe payment
    const now = new Date()
    const msPerDay = 24 * 60 * 60 * 1000
    const initialExpiry = new Date(now.getTime() + 10 * msPerDay).toISOString()

    const user = {
      id: TEST_USER_ID,
      name: "John Firebase",
      subscription: {
        plan_id: "1m",
        expiry: initialExpiry,
      },
    }
    let currentUser = Object.assign({}, user)

    const plan = {
      id: "1m",
      label: "1 month",
      price: "$99",
      billing: "Monthly",
    }

    // Intercept the user GET - return current user state
    cy.intercept("GET", `/api/users/${TEST_USER_ID}`, (req) => {
      req.reply({ statusCode: 200, body: currentUser })
    }).as("getUser")

    // Intercept avatar
    cy.intercept("GET", `/api/users/${TEST_USER_ID}/avatar`, {
      statusCode: 200,
      headers: { "content-type": "image/jpeg" },
      body: "",
    }).as("getAvatar")

    // Intercept the plans endpoint
    cy.intercept("GET", "/api/plans", { statusCode: 200, body: [plan] }).as("getPlans")

    // Intercept individual plan fetch
    cy.intercept("GET", "/api/plans/*", { statusCode: 200, body: plan }).as("getPlan")

    // Mock the subscription extension endpoint (called by webhook)
    cy.intercept("PATCH", `/api/users/${TEST_USER_ID}/extend-subscription/*`, (req) => {
      const newExpiry = new Date(
        new Date(currentUser.subscription.expiry).getTime() + 31 * msPerDay
      ).toISOString()
      const updatedUser = Object.assign({}, currentUser, {
        subscription: Object.assign({}, currentUser.subscription, { expiry: newExpiry }),
      })
      currentUser = updatedUser
      req.reply({ statusCode: 200, body: updatedUser })
    }).as("extendSubscription")

    // Sign in and visit the subscriptions page
    cy.signIn("/subscriptions")

    // Wait for initial data load
    cy.wait("@getUser")
    cy.wait("@getPlans")

    // Get initial days left
    cy.contains(".subscription-label-ui", /Days Left/i)
      .parent()
      .find(".subscription-value-ui")
      .should("not.contain", "—")
      .invoke("text")
      .then((text) => {
        const initialDays = parseInt(text.trim(), 10)

        // Manually update currentUser to simulate webhook
        const newExpiry = new Date(
          new Date(currentUser.subscription.expiry).getTime() + 31 * msPerDay
        ).toISOString()
        currentUser = Object.assign({}, currentUser, {
          subscription: Object.assign({}, currentUser.subscription, { expiry: newExpiry }),
        })

        // Reload to trigger refetch (simulating return from Stripe)
        cy.reload()

        // Wait for data reload - should now return the updated currentUser
        cy.wait("@getUser")

        // Verify the days increased by 31
        cy.contains(".subscription-label-ui", /Days Left/i)
          .parent()
          .find(".subscription-value-ui")
          .should("not.contain", "—")
          .invoke("text")
          .then((updatedText) => {
            const updatedDays = parseInt(updatedText.trim(), 10)
            expect(updatedDays).to.equal(initialDays + 31)
          })
      })
  })

  it("inactive user renews subscription from homepage to active state", () => {
    // Start with an expired subscription (inactive user)
    const now = new Date()
    const msPerDay = 24 * 60 * 60 * 1000
    const expiredDate = new Date(now.getTime() - 5 * msPerDay).toISOString() // 5 days ago

    const user = {
      id: TEST_USER_ID,
      name: "John Firebase",
      rank: "Blue Belt",
      subscription: {
        plan_id: "1m",
        expiry: expiredDate,
        status: "Inactive",
      },
      stats: {
        classes_this_month: 12,
        total_classes: 156,
        favorite_class: "BJJ Gi",
      },
    }
    let currentUser = Object.assign({}, user)

    const plan = {
      id: "1m",
      label: "1 month",
      price: "$99",
      billing: "Monthly",
    }

    // Intercept the user GET - return current user state
    cy.intercept("GET", `/api/users/${TEST_USER_ID}`, (req) => {
      req.reply({ statusCode: 200, body: currentUser })
    }).as("getUser")

    // Intercept the avatar endpoint (return empty blob)
    cy.intercept("GET", `/api/users/${TEST_USER_ID}/avatar`, {
      statusCode: 200,
      headers: { "content-type": "image/jpeg" },
      body: "",
    }).as("getAvatar")

    // Intercept booked classes
    cy.intercept("GET", `/api/users/${TEST_USER_ID}/booked-classes-id`, {
      statusCode: 200,
      body: [],
    }).as("getBookedClasses")

    // Intercept the plans endpoint
    cy.intercept("GET", "/api/plans", { statusCode: 200, body: [plan] }).as("getPlans")

    // Intercept individual plan fetch
    cy.intercept("GET", "/api/plans/*", { statusCode: 200, body: plan }).as("getPlan")

    // Mock Stripe checkout (won't actually redirect)
    cy.intercept("POST", "http://localhost:8000/api/checkout", (req) => {
      // Simulate successful payment by updating the user subscription
      const newExpiry = new Date(now.getTime() + 31 * msPerDay).toISOString()
      currentUser = Object.assign({}, currentUser, {
        subscription: Object.assign({}, currentUser.subscription, {
          expiry: newExpiry,
          status: "Active",
        }),
      })
      req.reply({ forceNetworkError: true })
    }).as("createCheckout")

    // Step 1: Begin on homepage with inactive user
    cy.signIn("/")

    // Wait for initial data load
    cy.wait("@getUser")

    // Verify user status is "Inactive" on homepage
    cy.contains(".user-status", "Inactive").should("exist")

    // Step 2: Click "Renew Subscription" button
    cy.contains("button", /Renew Subscription/i).click()

    // Step 3: Verify navigation to /subscriptions
    cy.url().should("include", "/subscriptions")
    cy.wait("@getPlans")

    // Step 4: Click "Pay now" button to extend subscription
    cy.contains("button", /Pay now/i).click()
    cy.wait("@createCheckout")

    // Simulate return from Stripe by reloading (user is now updated)
    cy.reload()
    cy.wait("@getUser")

    // Verify subscription is extended on subscriptions page (days > 25)
    cy.contains(".subscription-label-ui", /Days Left/i)
      .parent()
      .find(".subscription-value-ui")
      .invoke("text")
      .then((text) => {
        const days = parseInt(text.trim(), 10)
        expect(days).to.be.greaterThan(25) // Should be around 31 days
      })

    // Step 5: Navigate back to homepage
    cy.contains("a", /Home/i).click()

    // Wait for user data to load
    cy.wait("@getUser")

    // Step 6: Verify user status is now "Active" on homepage
    cy.contains(".user-status", "Active").should("exist")
  })
})
