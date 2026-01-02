import { describe, it, expect, beforeAll, afterAll } from "vitest"
import request from "supertest"
import { MongoClient } from "mongodb"
import { app, connectDB } from "./server.js"

/**
 * Integration tests for server.js API endpoints
 *
 * These tests use supertest to make actual HTTP requests to the Express app
 * with a real MongoDB connection.
 *
 * Note: server.js loads environment variables on import
 */

const MONGO_URI = "mongodb://localhost:27017"
const client = new MongoClient(MONGO_URI)

// Connect to database before running tests
beforeAll(async () => {
  await connectDB()
})

// Close database connection after all tests
afterAll(async () => {
  await client.close()
})

describe("GET /api/plans", () => {
  it(
    "should return all subscription plans",
    async () => {
      const response = await request(app).get("/api/plans").expect(200)

      // Response should be an array
      expect(Array.isArray(response.body)).toBe(true)

      // Should have at least one plan
      expect(response.body.length).toBeGreaterThan(0)

      // First plan should have expected structure
      const plan = response.body[0]
      expect(plan).toHaveProperty("id")
      expect(plan).toHaveProperty("label")
      expect(plan).toHaveProperty("price")
    },
    10000
  ) // 10 second timeout
})
