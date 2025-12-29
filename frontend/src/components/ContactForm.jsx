//refactor CSS?

import React, { useState, useEffect, useRef } from "react"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"

export default function ContactForm({
  visible = false,
  onClose = () => {},
  initialData = null,
  successMessage = "Message sent — thanks!",
  closeDelay = 700,
}) {
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [validationError, setValidationError] = useState(null)
  const closeTimeout = useRef(null)

  const contactMutation = useMutation({
    mutationFn: (formData) => axios.post("/api/contact", formData),
    onSuccess: () => {
      // Clear form fields
      setName("")
      setSubject("")
      setEmail("")
      setMessage("")
      // Auto-close after showing success message
      closeTimeout.current = setTimeout(() => {
        contactMutation.reset()
        onClose()
      }, closeDelay)
    },
  })

  useEffect(() => {
    if (!visible) {
      // clear transient state when collapsed
      setValidationError(null)
      contactMutation.reset()
      // clear any initial values when closing
      if (!initialData) {
        setName("")
        setSubject("")
        setEmail("")
        setMessage("")
      }
    } else if (visible && initialData) {
      // prefill when opening with initialData
      setName(initialData.name ?? "")
      setSubject(initialData.subject ?? "")
      setEmail(initialData.email ?? "")
      setMessage(initialData.message ?? "")
    }

    // Cleanup timeout on unmount
    return () => {
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current)
        closeTimeout.current = null
      }
    }
  }, [visible, initialData])

  // simple email validation
  function isValidEmail(value) {
    if (!value) return false
    // basic RFC-like check (not exhaustive)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  if (!visible) return null

  const handleSend = () => {
    if (!name || !email || !message) {
      setValidationError("Please fill name, email and message.")
      return
    }

    if (!isValidEmail(email)) {
      setValidationError("Please enter a valid email address.")
      return
    }

    setValidationError(null)
    contactMutation.mutate({ name, subject, email, message })
  }

  const handleCancel = () => {
    setName("")
    setSubject("")
    setEmail("")
    setMessage("")
    setValidationError(null)
    contactMutation.reset()
    onClose()
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Subject (optional)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <input
          className="border rounded px-3 py-2 w-full md:col-span-2"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            // clear email-related validation errors while typing
            if (validationError && validationError.toLowerCase().includes("email")) {
              setValidationError(null)
            }
          }}
        />

        {!isValidEmail(email) && email.length > 0 && (
          <p className="text-sm text-red-600 md:col-span-2">Please enter a valid email address.</p>
        )}

        <textarea
          className="border rounded px-3 py-2 w-full md:col-span-2 h-32 resize-none"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          className={`px-4 py-2 rounded-lg text-white ${contactMutation.isPending ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"}`}
          onClick={handleSend}
          disabled={contactMutation.isPending}
        >
          {contactMutation.isPending ? "Sending..." : "Send"}
        </button>

        <button
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
          onClick={handleCancel}
          disabled={contactMutation.isPending}
        >
          Cancel
        </button>

        {contactMutation.isSuccess && <p className="text-sm text-green-600 ml-3">{successMessage}</p>}

        {contactMutation.isError && (
          <p className="text-sm text-red-600 ml-3">Failed to send — please try again later.</p>
        )}

        {validationError && <p className="text-sm text-red-600 ml-3">{validationError}</p>}
      </div>
    </div>
  )
}
