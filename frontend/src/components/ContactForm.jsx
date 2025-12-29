import { useState, useEffect, useRef } from "react"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import "./ContactForm.css"

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="contact-form">
      <h3 className="contact-form-title">Contact Us</h3>

      <div className="contact-form-grid">
        <input
          className="contact-input"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="contact-input"
          placeholder="Subject (optional)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <input
          className="contact-input--full-width"
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
          <p className="contact-validation-error">Please enter a valid email address.</p>
        )}

        <textarea
          className="contact-textarea"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="contact-actions">
        <button
          className={
            contactMutation.isPending ? "contact-button-send--loading" : "contact-button-send"
          }
          onClick={handleSend}
          disabled={contactMutation.isPending}
        >
          {contactMutation.isPending ? "Sending..." : "Send"}
        </button>

        <button
          className="contact-button-cancel"
          onClick={handleCancel}
          disabled={contactMutation.isPending}
        >
          Cancel
        </button>

        {contactMutation.isSuccess && <p className="contact-success-message">{successMessage}</p>}

        {contactMutation.isError && (
          <p className="contact-error-message">Failed to send — please try again later.</p>
        )}

        {validationError && <p className="contact-error-message">{validationError}</p>}
      </div>
    </div>
  )
}
