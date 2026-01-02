import { describe, it, expect } from "vitest"
import { getClassStyle } from "./classStyles"

describe("classStyles - getClassStyle", () => {
  it("returns exact match for standard class names", () => {
    const result = getClassStyle("BJJ - Gi")

    expect(result.color).toBe("bg-red-600")
    expect(result.hexColor).toBe("#DC2626")
    expect(result.logo).toBeDefined()
  })

  it("returns exact match for all class types", () => {
    expect(getClassStyle("BJJ - Gi").color).toBe("bg-red-600")
    expect(getClassStyle("BJJ - No-Gi").color).toBe("bg-gray-500")
    expect(getClassStyle("Yoga Flow").color).toBe("bg-green-500")
    expect(getClassStyle("Strength & Conditioning").color).toBe("bg-orange-500")
  })

  it("performs case-insensitive fuzzy matching", () => {
    const result = getClassStyle("bjj gi")

    // Should match "BJJ - Gi" despite different case and missing hyphen
    expect(result.color).toBe("bg-red-600")
  })

  it("handles special characters in fuzzy matching", () => {
    const result = getClassStyle("BJJ – Gi") // em dash instead of hyphen

    // Should still match "BJJ - Gi" after normalization
    expect(result.color).toBe("bg-red-600")
  })

  it("matches when title contains class name", () => {
    const result = getClassStyle("Advanced BJJ - Gi Techniques")

    // Should match "BJJ - Gi" since it's contained in the title
    expect(result.color).toBe("bg-red-600")
  })

  it("matches when class name contains title", () => {
    const result = getClassStyle("Yoga")

    // Should match "Yoga Flow" since "Yoga" is contained in it
    expect(result.color).toBe("bg-green-500")
  })

  it("returns fallback for unknown class types", () => {
    const result = getClassStyle("Pilates")

    expect(result.color).toBe("bg-gray-400")
    expect(result.logo).toBe("")
  })

  it("returns fallback for null/undefined input", () => {
    expect(getClassStyle(null).color).toBe("bg-gray-400")
    expect(getClassStyle(undefined).color).toBe("bg-gray-400")
    expect(getClassStyle("").color).toBe("bg-gray-400")
  })

  it("normalizes multiple spaces and special characters", () => {
    const result = getClassStyle("BJJ    -    Gi!!!")

    // Should normalize to "bjj gi" and match "BJJ - Gi"
    expect(result.color).toBe("bg-red-600")
  })

  it("handles mixed case and punctuation variations", () => {
    const result = getClassStyle("strength&conditioning")

    // Should match "Strength & Conditioning"
    expect(result.color).toBe("bg-orange-500")
  })

  it("returns first match when multiple classes could match", () => {
    // "BJJ" could match both "BJJ - Gi" and "BJJ - No-Gi"
    // Should return the first one found in the keys iteration
    const result = getClassStyle("BJJ")

    // Should match one of the BJJ classes (order depends on Object.keys)
    expect(result.color).toMatch(/bg-red-600|bg-gray-500/)
  })
})
