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

  it(
    "should return a single plan by ID",
    async () => {
      const planId = "1m"
      const response = await request(app).get(`/api/plans/${planId}`).expect(200)

      // Response should be an object
      expect(response.body).toBeTypeOf("object")
      expect(Array.isArray(response.body)).toBe(false)

      // Should have expected structure
      expect(response.body).toHaveProperty("id", planId)
      expect(response.body).toHaveProperty("label")
      expect(response.body).toHaveProperty("price")
    },
    10000
  )

  it(
    "should return 404 for non-existent plan ID",
    async () => {
      const response = await request(app).get("/api/plans/invalid-id").expect(404)

      expect(response.body).toHaveProperty("message", "Plan not found")
    },
    10000
  )
})

describe("GET /api/classes", () => {
  it(
    "should return all class types",
    async () => {
      const response = await request(app).get("/api/classes").expect(200)

      // Response should be an array
      expect(Array.isArray(response.body)).toBe(true)

      // Should have at least one class
      expect(response.body.length).toBeGreaterThan(0)

      // First class should have expected structure
      const classType = response.body[0]
      expect(classType).toHaveProperty("name")
      expect(classType).toHaveProperty("description")
      expect(classType).toHaveProperty("teacherIds")
      expect(Array.isArray(classType.teacherIds)).toBe(true)
    },
    10000
  )
})

describe("GET /api/scheduled-classes", () => {
  it(
    "should return all scheduled classes sorted by start time",
    async () => {
      const response = await request(app).get("/api/scheduled-classes").expect(200)

      // Response should be an array
      expect(Array.isArray(response.body)).toBe(true)

      // Should have at least one scheduled class
      expect(response.body.length).toBeGreaterThan(0)

      // First scheduled class should have expected structure
      const scheduledClass = response.body[0]
      expect(scheduledClass).toHaveProperty("id")
      expect(scheduledClass).toHaveProperty("title")
      expect(scheduledClass).toHaveProperty("teacher")
      expect(scheduledClass).toHaveProperty("start")
      expect(scheduledClass).toHaveProperty("end")
      expect(scheduledClass).toHaveProperty("spots_booked")
      expect(scheduledClass).toHaveProperty("spots_total")
    },
    10000
  )

  it(
    "should respect limit query parameter",
    async () => {
      const limit = 5
      const response = await request(app).get(`/api/scheduled-classes?limit=${limit}`).expect(200)

      // Response should be an array
      expect(Array.isArray(response.body)).toBe(true)

      // Should return exactly 5 classes (or fewer if not enough exist)
      expect(response.body.length).toBeLessThanOrEqual(limit)
    },
    10000
  )
})
