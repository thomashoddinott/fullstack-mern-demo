import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import UpcomingClasses from "./UpcomingClasses"
import axios from "axios"

// Mock axios
vi.mock("axios")

// Mock useAuth hook
const mockCurrentUser = { uid: "test-user-123" }
vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({ currentUser: mockCurrentUser })),
}))

// Helper to render with required providers
const renderWithProviders = (component) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>)
}

describe("UpcomingClasses - Critical Mutation Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows loading state while fetching booked classes", () => {
    // Mock axios to never resolve (simulate loading)
    axios.get.mockImplementation(
      () =>
        new Promise(() => {
          /* never resolves */
        })
    )

    renderWithProviders(<UpcomingClasses />)

    expect(screen.getByText("Loading upcoming classes...")).toBeInTheDocument()
  })

  it("shows error message when API request fails", async () => {
    axios.get.mockRejectedValue(new Error("Network error"))

    renderWithProviders(<UpcomingClasses />)

    await waitFor(() => {
      expect(screen.getByText("Error loading upcoming classes")).toBeInTheDocument()
    })
  })

  it("shows empty state when user has no booked classes", async () => {
    axios.get.mockResolvedValueOnce({ data: { booked_classes_id: [] } })

    renderWithProviders(<UpcomingClasses />)

    await waitFor(() => {
      expect(screen.getByText("You have no upcoming classes.")).toBeInTheDocument()
    })
  })

  it("makes correct API calls when removing a class", async () => {
    const mockBookedIds = { booked_classes_id: [1, 2] }
    const mockClass1 = { id: 1, title: "BJJ Fundamentals", start: "2025-01-20T10:00:00Z" }
    const mockClass2 = { id: 2, title: "Advanced Techniques", start: "2025-01-21T10:00:00Z" }

    // First call: get booked class IDs
    // Second call: get class 1 details
    // Third call: get class 2 details
    axios.get
      .mockResolvedValueOnce({ data: mockBookedIds })
      .mockResolvedValueOnce({ data: mockClass1 })
      .mockResolvedValueOnce({ data: mockClass2 })

    // Mock the PUT calls for removing
    axios.put.mockResolvedValue({ data: {} })

    renderWithProviders(<UpcomingClasses />)

    // Wait for classes to load
    await waitFor(() => {
      expect(screen.getByText("BJJ Fundamentals")).toBeInTheDocument()
    })

    // Click cancel button on first class
    const cancelButtons = screen.getAllByLabelText(/Cancel/)
    await userEvent.click(cancelButtons[0])

    // Should call API to remove from user's booked classes
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/users/test-user-123/booked-classes", {
        action: "remove",
        classId: 1,
      })
    })

    // Should also decrement spots_booked on the scheduled class
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/scheduled-classes/1/minus1")
    })
  })

  it("sorts classes chronologically by start date", async () => {
    const mockBookedIds = { booked_classes_id: [1, 2, 3] }
    const mockClass1 = { id: 1, title: "Class A", start: "2025-01-22T10:00:00Z" } // Latest
    const mockClass2 = { id: 2, title: "Class B", start: "2025-01-20T10:00:00Z" } // Earliest
    const mockClass3 = { id: 3, title: "Class C", start: "2025-01-21T10:00:00Z" } // Middle

    axios.get
      .mockResolvedValueOnce({ data: mockBookedIds })
      .mockResolvedValueOnce({ data: mockClass1 })
      .mockResolvedValueOnce({ data: mockClass2 })
      .mockResolvedValueOnce({ data: mockClass3 })

    renderWithProviders(<UpcomingClasses />)

    await waitFor(() => {
      expect(screen.getByText("Class B")).toBeInTheDocument()
    })

    // Get all class titles and verify order
    const classTitles = screen.getAllByText(/Class [ABC]/).map((el) => el.textContent)

    // Should be sorted: Class B (earliest), Class C (middle), Class A (latest)
    expect(classTitles).toEqual(["Class B", "Class C", "Class A"])
  })
})
