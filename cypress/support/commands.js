import { signInProgrammatically } from "./auth"

// Custom command to sign in programmatically with Firebase
Cypress.Commands.add(
  "signIn",
  (
    redirectPath = "/",
    credentials = {
      email: Cypress.env("TEST_EMAIL") || "test@example.com",
      password: Cypress.env("TEST_PASSWORD") || "testpassword123",
    }
  ) => {
    // Use cy.session to cache authentication across tests
    cy.session([credentials.email, credentials.password], () => {
      cy.visit("/login") // Visit login page to initialize Firebase

      // Wait for the page to load and Firebase to initialize
      cy.window().then(() => {
        // Sign in programmatically using Firebase SDK
        return cy.wrap(signInProgrammatically(credentials))
      })
    })

    // After session is restored, visit the desired path
    cy.visit(redirectPath)
  }
)

// Custom command to mock backend API responses for the authenticated user
Cypress.Commands.add("mockUserAPIs", (userId = "TwIjD4UmW4UJo4d8Vgg0CYR7HCy2") => {
  const now = new Date()
  const msPerDay = 24 * 60 * 60 * 1000
  const futureExpiry = new Date(now.getTime() + 10 * msPerDay).toISOString()

  const testUser = {
    id: userId,
    name: "John Firebase",
    rank: "Blue Belt",
    subscription: {
      plan_id: "1m",
      expiry: futureExpiry,
      status: "Active",
    },
    stats: {
      classes_this_month: 12,
      total_classes: 156,
      favorite_class: "BJJ Gi",
    },
    booked_classes: [],
  }

  // Intercept user API calls
  cy.intercept("GET", `/api/users/${userId}`, {
    statusCode: 200,
    body: testUser,
  }).as("getUser")

  // Intercept avatar API
  cy.intercept("GET", `/api/users/${userId}/avatar`, {
    statusCode: 200,
    headers: { "content-type": "image/jpeg" },
    body: "",
  }).as("getAvatar")

  // Intercept booked classes
  cy.intercept("GET", `/api/users/${userId}/booked-classes-id`, {
    statusCode: 200,
    body: [],
  }).as("getBookedClasses")
})
