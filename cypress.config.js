export default {
  e2e: {
    baseUrl: "http://localhost:5173",
    env: {
      // Firebase test credentials
      // These should match a real user in your Firebase project
      TEST_EMAIL: "email@example.com",
      TEST_PASSWORD: "password123",
    },
  },
}
