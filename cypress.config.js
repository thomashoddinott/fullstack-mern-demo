import { config } from "dotenv"

// Load environment variables from .env file
config()

export default {
  e2e: {
    baseUrl: "http://localhost:5173",
    env: {
      // Load from environment variables (set in .env for local, GitHub Secrets for CI/CD)
      TEST_EMAIL: process.env.CYPRESS_TEST_EMAIL,
      TEST_PASSWORD: process.env.CYPRESS_TEST_PASSWORD,
    },
  },
}
