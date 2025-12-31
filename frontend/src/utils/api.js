import { getAuth } from "firebase/auth"
import axios from "axios"

/**
 * Get the current user's Firebase ID token
 * @returns {Promise<string>} - The ID token
 * @throws {Error} - If user is not authenticated
 */
export async function getAuthToken() {
  const auth = getAuth()
  const user = auth.currentUser

  if (!user) {
    // Redirect to login if not authenticated
    console.warn("User not authenticated, redirecting to login")
    window.location.href = "/login"
    throw new Error("User not authenticated. Please log in.")
  }

  try {
    return await user.getIdToken()
  } catch (error) {
    console.error("Failed to get Firebase ID token:", error)
    window.location.href = "/login"
    throw new Error("Session expired. Please log in again.")
  }
}

/**
 * Wrapper around fetch() that automatically includes Firebase ID token
 * in the Authorization header for authenticated requests.
 * Also handles common auth errors automatically.
 *
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>} - The fetch response
 * @throws {Error} - If user is not authenticated or request fails
 */
export async function authenticatedFetch(url, options = {}) {
  try {
    const idToken = await getAuthToken()

    // Merge Authorization header with any existing headers
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${idToken}`,
    }

    // Make the request with the token
    const response = await fetch(url, { ...options, headers })

    // Handle authentication errors
    if (response.status === 401) {
      console.warn("401 Unauthorized - redirecting to login")
      window.location.href = "/login"
      throw new Error("Session expired. Please log in again.")
    }

    // Handle authorization errors
    if (response.status === 403) {
      console.warn("403 Forbidden - access denied")
      throw new Error("You don't have permission to access this resource.")
    }

    return response
  } catch (error) {
    // Re-throw error with context
    console.error("Authenticated fetch failed:", error)
    throw error
  }
}

/**
 * Create an axios instance with authentication headers and error interceptors
 * Usage: const axiosInstance = await getAuthenticatedAxios()
 *        const response = await axiosInstance.get('/api/users/123')
 */
export async function getAuthenticatedAxios() {
  const idToken = await getAuthToken()

  const instance = axios.create({
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  })

  // Add response interceptor to handle auth errors
  instance.interceptors.response.use(
    (response) => response, // Pass through successful responses
    (error) => {
      // Handle 401 Unauthorized - redirect to login
      if (error.response?.status === 401) {
        console.warn("401 Unauthorized - redirecting to login")
        window.location.href = "/login"
        return Promise.reject(new Error("Session expired. Please log in again."))
      }

      // Handle 403 Forbidden
      if (error.response?.status === 403) {
        console.warn("403 Forbidden - access denied")
        return Promise.reject(new Error("You don't have permission to access this resource."))
      }

      // Pass through other errors
      return Promise.reject(error)
    }
  )

  return instance
}
