import { describe, it, expect } from 'vitest'
import { formatClassTime } from './BookClasses'

describe('formatClassTime', () => {
  it('formats start and end datetimes into MM/DD | h:mm AM/PM - h:mm AM/PM', () => {
    const start = '2025-12-16T09:30:00Z'
    const end = '2025-12-16T10:45:00Z'

    const out = formatClassTime(start, end)

    // Expect pattern like "12/16 | 9:30 AM - 10:45 AM" (hours may be 1 or 2 digits)
    expect(out).toMatch(/^\d{2}\/\d{2} \| \d{1,2}:\d{2} (AM|PM) - \d{1,2}:\d{2} (AM|PM)$/)
  })
})
