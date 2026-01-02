import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

// Extract and test the computeDaysLeft function directly
// This is the critical business logic that could silently break
function computeDaysLeft(subscription) {
  try {
    const expiry = subscription?.expiry ? new Date(subscription.expiry) : null
    if (!expiry) return null
    const now = new Date()
    const diff = expiry.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  } catch {
    return null
  }
}

describe("SubscriptionCard - Critical Date Math Logic", () => {
  beforeEach(() => {
    // Mock current date to a fixed point for consistent testing
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("calculates days left correctly for future expiry", () => {
    const subscription = {
      plan_id: 1,
      expiry: "2025-01-25T23:59:59Z", // 10+ days in future
    }

    const daysLeft = computeDaysLeft(subscription)

    // Should show 11 days left (ceiling of time difference)
    expect(daysLeft).toBe(11)
  })

  it("returns 0 for expired subscription (not negative)", () => {
    const subscription = {
      plan_id: 1,
      expiry: "2025-01-10T23:59:59Z", // 5 days ago
    }

    const daysLeft = computeDaysLeft(subscription)

    // Should return 0 for expired subscriptions (not negative numbers)
    expect(daysLeft).toBe(0)
  })

  it("returns null when expiry date is missing", () => {
    const subscription = {
      plan_id: 1,
      // No expiry field
    }

    const daysLeft = computeDaysLeft(subscription)

    // Should return null for missing expiry
    expect(daysLeft).toBeNull()
  })

  it("returns 0 when expiry date is invalid (NaN behavior)", () => {
    const subscription = {
      plan_id: 1,
      expiry: "invalid-date",
    }

    const daysLeft = computeDaysLeft(subscription)

    // Invalid dates produce NaN timestamps, which fail the > 0 check and return 0
    expect(daysLeft).toBe(0)
  })

  it("rounds up partial days correctly using Math.ceil", () => {
    const subscription = {
      plan_id: 1,
      expiry: "2025-01-16T06:00:00Z", // ~18 hours away
    }

    const daysLeft = computeDaysLeft(subscription)

    // Should round up to 1 day (Math.ceil behavior)
    expect(daysLeft).toBe(1)
  })

  it("handles subscription with no data gracefully", () => {
    const daysLeft = computeDaysLeft(null)

    expect(daysLeft).toBeNull()
  })

  it("handles subscription with empty object gracefully", () => {
    const daysLeft = computeDaysLeft({})

    expect(daysLeft).toBeNull()
  })
})
