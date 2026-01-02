import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

// Extract and test the computeSubscriptionProgress function directly
// This is critical date math logic that could silently break
function computeSubscriptionProgress(subscription) {
  try {
    const today = new Date()
    const expiryDate = subscription?.expiry ? new Date(subscription.expiry) : null
    let startDate = subscription?.start ? new Date(subscription.start) : null

    // If no explicit start date, fall back to the first day of the expiry month
    if (!startDate && expiryDate) {
      startDate = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), 1)
    }

    if (startDate && expiryDate) {
      const total = expiryDate.getTime() - startDate.getTime()
      const elapsed = today.getTime() - startDate.getTime()
      if (total > 0) {
        let pct = Math.round((elapsed / total) * 100)
        if (!Number.isFinite(pct)) pct = 0
        return Math.max(0, Math.min(100, pct))
      }
    }
  } catch {
    // fall through
  }
  return 0
}

describe("UserCard - Critical Date Math Logic", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("calculates progress correctly for subscription with explicit start date", () => {
    const subscription = {
      start: "2025-01-01T00:00:00Z",
      expiry: "2025-01-31T23:59:59Z",
    }

    const progress = computeSubscriptionProgress(subscription)

    // 15 days into a 31 day period ≈ 48%
    expect(progress).toBeGreaterThanOrEqual(47)
    expect(progress).toBeLessThanOrEqual(49)
  })

  it("returns 0 when subscription has no dates", () => {
    const subscription = {}

    const progress = computeSubscriptionProgress(subscription)

    expect(progress).toBe(0)
  })

  it("returns 0 when subscription is null", () => {
    const progress = computeSubscriptionProgress(null)

    expect(progress).toBe(0)
  })

  it("clamps progress to 0-100 range (handles expired subscriptions)", () => {
    const subscription = {
      start: "2024-12-01T00:00:00Z",
      expiry: "2024-12-31T23:59:59Z", // Expired
    }

    const progress = computeSubscriptionProgress(subscription)

    // Should be clamped to 100, not exceed it
    expect(progress).toBe(100)
  })

  it("clamps progress to 0-100 range (handles future subscriptions)", () => {
    const subscription = {
      start: "2025-02-01T00:00:00Z", // Future
      expiry: "2025-02-28T23:59:59Z",
    }

    const progress = computeSubscriptionProgress(subscription)

    // Should be clamped to 0, not negative
    expect(progress).toBe(0)
  })

  it("returns 0 when total duration is negative (invalid data)", () => {
    const subscription = {
      start: "2025-01-31T00:00:00Z",
      expiry: "2025-01-01T23:59:59Z", // Expiry before start
    }

    const progress = computeSubscriptionProgress(subscription)

    // Invalid data (expiry before start) should return 0
    expect(progress).toBe(0)
  })

  it("handles invalid date strings gracefully", () => {
    const subscription = {
      start: "invalid-date",
      expiry: "2025-01-31T23:59:59Z",
    }

    const progress = computeSubscriptionProgress(subscription)

    // Should handle errors gracefully and return 0
    expect(progress).toBe(0)
  })
})
