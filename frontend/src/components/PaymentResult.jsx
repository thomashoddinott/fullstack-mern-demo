import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import { useNavigate } from "react-router"

const PaymentResult = () => {
  const [loading, setLoading] = useState(true)
  const [paid, setPaid] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const hasExtended = useRef(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const session_id = params.get("session_id")
    const plan = params.get("plan")
    const userId = params.get("userId")

    if (!session_id) {
      setError("No session_id found in URL")
      setLoading(false)
      return
    }

    const fetchStatus = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/checkout/session", {
          params: { session_id },
        })

        setPaid(!!res.data.paid)

        // If payment was successful, extend the user's subscription (only once)
        if (res.data.paid && plan && userId && !hasExtended.current) {
          hasExtended.current = true
          await axios.patch(`http://localhost:8000/api/users/${userId}/extend-subscription/${plan}`)
        }
      } catch (err) {
        console.error(err)
        setError("Could not verify payment status")
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  // After loading finishes (success or failure), redirect home after 5s
  useEffect(() => {
    if (loading) return

    const timer = setTimeout(() => {
      navigate("/subscriptions")
    }, 5000)

    return () => clearTimeout(timer)
  }, [loading, navigate])

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Checking payment status…</div>
      </div>
    )

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold">Payment Failed ❌</div>
          <div className="mt-2">{error}</div>
          <div className="mt-4 text-sm text-gray-600">
            Redirecting to subscription page in 5 seconds…
          </div>
        </div>
      </div>
    )

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {paid ? (
          <>
            <h2 className="text-3xl font-bold">Payment Successful 🎉</h2>
            <p className="mt-4">Thank you — your subscription has been extended.</p>
            <div className="mt-4 text-sm text-gray-600">
              Redirecting to subscription page in 5 seconds…
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold">Payment Failed ❌</h2>
            <p className="mt-4">We couldn't confirm your payment.</p>
            <div className="mt-4 text-sm text-gray-600">
              Redirecting to subscription page in 5 seconds…
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentResult
