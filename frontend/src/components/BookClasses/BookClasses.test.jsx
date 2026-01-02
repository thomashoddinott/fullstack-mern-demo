import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { BrowserRouter } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import BookClasses, { formatClassTime } from "./BookClasses"
import axios from "axios"

// Mock axios
vi.mock("axios")

// Mock authentication utilities
vi.mock("../../utils/api", () => ({
  getAuthToken: vi.fn().mockResolvedValue("mock-firebase-token"),
}))

// Mock useAuth hook
const mockCurrentUser = { uid: "test-user-123" }
vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({ currentUser: mockCurrentUser })),
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Helper to render with required providers
const renderWithProviders = (component) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe("BookClasses - Critical Business Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows loading state while fetching scheduled classes", () => {
    // Mock axios to never resolve (simulate loading)
    axios.get.mockImplementation(
      () =>
        new Promise(() => {
          /* never resolves */
        })
    )

    renderWithProviders(<BookClasses />)

    expect(screen.getByText("Loading classes...")).toBeInTheDocument()
  })

  it("shows error message when API request fails", async () => {
    axios.get.mockRejectedValue(new Error("Network error"))

    renderWithProviders(<BookClasses />)

    await waitFor(() => {
      expect(screen.getByText("Error loading classes")).toBeInTheDocument()
    })
  })

  it("blocks booking when subscription is inactive", async () => {
    const mockClasses = [
      {
        id: 1,
        title: "Test Class",
        teacher: "Instructor",
        spots_booked: 0,
        spots_total: 10,
        start: "2025-12-16T09:30:00Z",
        end: "2025-12-16T10:45:00Z",
      },
    ]

    axios.get.mockImplementation((url) => {
      if (url.includes("/api/scheduled-classes")) {
        return Promise.resolve({ data: mockClasses })
      }
      if (url.includes("/api/teachers")) {
        return Promise.resolve({ data: [] })
      }
      if (url.includes("/api/users/test-user-123")) {
        return Promise.resolve({
          data: { subscription: { status: "Inactive" } },
        })
      }
      if (url.includes("/api/users/test-user-123/booked-classes-id")) {
        return Promise.resolve({ data: { booked_classes_id: [] } })
      }
      return Promise.reject(new Error("Unknown URL"))
    })

    renderWithProviders(<BookClasses />)

    // The ClassCard should show "Inactive Subscription" button text
    await waitFor(() => {
      expect(screen.getByText("Inactive Subscription")).toBeInTheDocument()
    })
  })

  it("blocks classes already in user's booked list", async () => {
    const mockClasses = [
      {
        id: 1,
        title: "Already Booked Class",
        teacher: "Instructor",
        spots_booked: 5,
        spots_total: 10,
        start: "2025-12-16T09:30:00Z",
        end: "2025-12-16T10:45:00Z",
      },
    ]

    axios.get.mockImplementation((url) => {
      if (url.includes("/api/scheduled-classes")) {
        return Promise.resolve({ data: mockClasses })
      }
      if (url.includes("/api/teachers")) {
        return Promise.resolve({ data: [] })
      }
      if (url.includes("/api/users/test-user-123/booked-classes-id")) {
        return Promise.resolve({ data: { booked_classes_id: [1] } })
      }
      if (url.includes("/api/users/test-user-123")) {
        return Promise.resolve({
          data: { subscription: { status: "Active" } },
        })
      }
      return Promise.reject(new Error("Unknown URL"))
    })

    renderWithProviders(<BookClasses />)

    await waitFor(() => {
      // Should show "Already Booked" button text for the class
      expect(screen.getByText("Already Booked")).toBeInTheDocument()
    })
  })

  it("blocks booking when class is full", async () => {
    const mockClasses = [
      {
        id: 1,
        title: "Full Class",
        teacher: "Instructor",
        spots_booked: 10,
        spots_total: 10,
        start: "2025-12-16T09:30:00Z",
        end: "2025-12-16T10:45:00Z",
      },
    ]

    axios.get.mockImplementation((url) => {
      if (url.includes("/api/scheduled-classes")) {
        return Promise.resolve({ data: mockClasses })
      }
      if (url.includes("/api/teachers")) {
        return Promise.resolve({ data: [] })
      }
      if (url.includes("/api/users")) {
        return Promise.resolve({
          data: { subscription: { status: "Active" } },
        })
      }
      if (url.includes("/booked-classes-id")) {
        return Promise.resolve({ data: { booked_classes_id: [] } })
      }
      return Promise.reject(new Error("Unknown URL"))
    })

    renderWithProviders(<BookClasses />)

    await waitFor(() => {
      expect(screen.getByText("Class Full")).toBeInTheDocument()
    })
  })
})

describe("BookClasses - Utility Functions", () => {
  it("formats class times correctly", () => {
    const start = "2025-12-16T09:30:00Z"
    const end = "2025-12-16T10:45:00Z"

    const out = formatClassTime(start, end)

    // Expect pattern like "12/16 | 9:30 AM - 10:45 AM" (hours may be 1 or 2 digits)
    expect(out).toMatch(/^\d{2}\/\d{2} \| \d{1,2}:\d{2} (AM|PM) - \d{1,2}:\d{2} (AM|PM)$/)
  })
})
