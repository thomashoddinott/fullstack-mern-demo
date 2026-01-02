import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import ClassCard from "./ClassCard"
import axios from "axios"

// Mock axios
vi.mock("axios")

// Mock authentication utilities
vi.mock("../utils/api", () => ({
  getAuthToken: vi.fn().mockResolvedValue("mock-firebase-token"),
}))

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

describe("ClassCard - Critical Booking Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("makes correct API calls when booking a class", async () => {
    axios.put.mockResolvedValue({ data: {} })

    renderWithProviders(
      <ClassCard
        id={1}
        title="Test Class"
        teacher="Instructor"
        datetime="12/16 | 9:30 AM - 10:45 AM"
        spots="5/10 spots"
      />
    )

    const bookButton = screen.getByRole("button", { name: /book class/i })
    await userEvent.click(bookButton)

    // Should add booking to user's booked classes
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/users/test-user-123/booked-classes",
        {
          action: "add",
          classId: 1,
        },
        {
          headers: { Authorization: "Bearer mock-firebase-token" },
        }
      )
    })

    // Should increment spots_booked on the scheduled class
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/scheduled-classes/1/plus1", null, {
        headers: { Authorization: "Bearer mock-firebase-token" },
      })
    })
  })

  it("prevents booking when subscription is inactive", async () => {
    renderWithProviders(
      <ClassCard
        id={1}
        title="Test Class"
        teacher="Instructor"
        datetime="12/16 | 9:30 AM - 10:45 AM"
        spots="5/10 spots"
        subscriptionInactive={true}
      />
    )

    const bookButton = screen.getByRole("button", { name: /inactive subscription/i })
    expect(bookButton).toBeDisabled()

    await userEvent.click(bookButton)

    // Should NOT make any API calls
    expect(axios.put).not.toHaveBeenCalled()
  })

  it("prevents booking when class is already booked", async () => {
    renderWithProviders(
      <ClassCard
        id={1}
        title="Test Class"
        teacher="Instructor"
        datetime="12/16 | 9:30 AM - 10:45 AM"
        spots="5/10 spots"
        disabled={true}
      />
    )

    const bookButton = screen.getByRole("button", { name: /already booked/i })
    expect(bookButton).toBeDisabled()

    await userEvent.click(bookButton)

    // Should NOT make any API calls
    expect(axios.put).not.toHaveBeenCalled()
  })

  it("prevents booking when class is full", async () => {
    renderWithProviders(
      <ClassCard
        id={1}
        title="Test Class"
        teacher="Instructor"
        datetime="12/16 | 9:30 AM - 10:45 AM"
        spots="10/10 spots"
        isFull={true}
      />
    )

    const bookButton = screen.getByRole("button", { name: /class full/i })
    expect(bookButton).toBeDisabled()

    await userEvent.click(bookButton)

    // Should NOT make any API calls
    expect(axios.put).not.toHaveBeenCalled()
  })

  it("handles booking errors gracefully by rolling back optimistic update", async () => {
    axios.put.mockRejectedValueOnce(new Error("Network error"))

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <ClassCard
          id={1}
          title="Test Class"
          teacher="Instructor"
          datetime="12/16 | 9:30 AM - 10:45 AM"
          spots="5/10 spots"
        />
      </QueryClientProvider>
    )

    const bookButton = screen.getByRole("button", { name: /book class/i })
    await userEvent.click(bookButton)

    // The mutation should fail and queries should be invalidated
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled()
    })

    // Button should return to "Book Class" state after error
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /book class/i })).toBeInTheDocument()
    })
  })
})
