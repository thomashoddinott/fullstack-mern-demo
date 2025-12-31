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
    throw new Error("User not authenticated. Please log in.")
  }

  return await user.getIdToken()
}

/**
 * Wrapper around fetch() that automatically includes Firebase ID token
 * in the Authorization header for authenticated requests.
 *
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>} - The fetch response
 * @throws {Error} - If user is not authenticated
 */
export async function authenticatedFetch(url, options = {}) {
  const idToken = await getAuthToken()

  // Merge Authorization header with any existing headers
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${idToken}`,
  }

  // Make the request with the token
  return fetch(url, { ...options, headers })
}

/**
 * Create an axios instance with authentication headers
 * Usage: const response = await authenticatedAxios.get('/api/users/123')
 */
export async function getAuthenticatedAxios() {
  const idToken = await getAuthToken()

  return axios.create({
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  })
}
