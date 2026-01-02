import { describe, it, expect } from "vitest"
import { convertDollarsToCents, isValidPlan } from "./server.js"

/**
 * Unit tests for Stripe-related helper functions from server.js
 *
 * These tests focus on pure functions used in the /api/checkout endpoint:
 * - Price conversion (dollars to cents)
 * - Plan validation
 */

describe("Stripe Price Calculation", () => {
  it("converts integer dollar amounts to cents", () => {
    expect(convertDollarsToCents(99)).toBe(9900)
    expect(convertDollarsToCents(150)).toBe(15000)
    expect(convertDollarsToCents(1)).toBe(100)
  })

  it("converts decimal dollar amounts to cents", () => {
    expect(convertDollarsToCents(99.5)).toBe(9950)
    expect(convertDollarsToCents(99.99)).toBe(9999)
    expect(convertDollarsToCents(0.5)).toBe(50)
  })

  it("handles zero amount", () => {
    expect(convertDollarsToCents(0)).toBe(0)
  })

  it("handles large amounts", () => {
    expect(convertDollarsToCents(999999)).toBe(99999900)
    expect(convertDollarsToCents(10000.5)).toBe(1000050)
  })

  it("handles floating point precision edge cases", () => {
    // These test cases expose potential floating point issues
    expect(convertDollarsToCents(29.99)).toBe(2999)
    expect(convertDollarsToCents(19.95)).toBe(1995)
  })
})

describe("Plan Validation", () => {
  it("validates plan with all required fields", () => {
    const validPlan = {
      name: "Monthly",
      price: 99,
      id: 1,
    }
    expect(isValidPlan(validPlan)).toBe(true)
  })

  it("rejects plan with missing name", () => {
    const invalidPlan = {
      price: 99,
      id: 1,
    }
    expect(isValidPlan(invalidPlan)).toBe(false)
  })

  it("rejects plan with missing price", () => {
    const invalidPlan = {
      name: "Monthly",
      id: 1,
    }
    expect(isValidPlan(invalidPlan)).toBe(false)
  })

  it("rejects null plan", () => {
    expect(isValidPlan(null)).toBe(false)
  })

  it("rejects undefined plan", () => {
    expect(isValidPlan(undefined)).toBe(false)
  })

  it("rejects plan with empty name", () => {
    const invalidPlan = {
      name: "",
      price: 99,
    }
    expect(isValidPlan(invalidPlan)).toBe(false)
  })

  it("rejects plan with zero price", () => {
    const invalidPlan = {
      name: "Free",
      price: 0,
    }
    expect(isValidPlan(invalidPlan)).toBe(false)
  })

  it("accepts plan with extra fields", () => {
    const validPlan = {
      name: "Annual",
      price: 999,
      id: 2,
      description: "Best value",
      features: ["unlimited", "priority support"],
    }
    expect(isValidPlan(validPlan)).toBe(true)
  })
})
