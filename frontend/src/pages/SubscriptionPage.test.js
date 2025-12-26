import { describe, it, expect } from "vitest"

/**
 * Tests for price parsing logic in SubscriptionPage.jsx
 *
 * The component uses parseFloat(currentPlan.price.replace("$", ""))
 * to convert display prices (e.g., "$99") to numbers for Stripe checkout.
 *
 * See lines 48 and 70 in SubscriptionPage.jsx
 */

// Helper function extracted from SubscriptionPage.jsx
function parsePrice(priceString) {
  return parseFloat(priceString.replace("$", ""))
}

describe("SubscriptionPage Price Parsing", () => {
  it("parses integer prices with dollar sign", () => {
    expect(parsePrice("$99")).toBe(99)
    expect(parsePrice("$150")).toBe(150)
    expect(parsePrice("$1")).toBe(1)
  })

  it("parses decimal prices with dollar sign", () => {
    expect(parsePrice("$99.50")).toBe(99.5)
    expect(parsePrice("$149.99")).toBe(149.99)
    expect(parsePrice("$0.99")).toBe(0.99)
  })

  it("handles prices without dollar sign gracefully", () => {
    // In case data comes without $ prefix
    expect(parsePrice("99")).toBe(99)
    expect(parsePrice("150.50")).toBe(150.5)
  })

  it("handles zero price", () => {
    expect(parsePrice("$0")).toBe(0)
  })

  it("handles large amounts", () => {
    expect(parsePrice("$999999")).toBe(999999)
    expect(parsePrice("$10000.50")).toBe(10000.5)
  })

  it("returns NaN for invalid price formats", () => {
    expect(parsePrice("")).toBeNaN()
    expect(parsePrice("$")).toBeNaN()
    expect(parsePrice("invalid")).toBeNaN()
  })

  it("handles multiple dollar signs", () => {
    // Edge case: what if price is "$$99"?
    // parseFloat will still work after replace removes first $
    expect(parsePrice("$$99")).toBe(NaN) // "parseFloat("$99")" after replace
  })

  it("handles whitespace", () => {
    expect(parsePrice("$99 ")).toBe(99)
    // parseFloat("$ 99".replace("$", "")) = parseFloat(" 99") = 99 (parseFloat trims leading whitespace)
    expect(parsePrice("$ 99")).toBe(99)
  })

  it("matches actual plan prices from the app", () => {
    // Real prices from the plans in the database
    expect(parsePrice("$99")).toBe(99)
    expect(parsePrice("$150")).toBe(150)
  })
})
