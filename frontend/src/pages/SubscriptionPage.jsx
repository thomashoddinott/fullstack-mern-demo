import React from "react"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import "./SubscriptionPage.css"
import SubscriptionCard from "../components/SubscriptionCard"
import { useAuth } from "../hooks/useAuth"
import { getAuthToken } from "../utils/api"

export default function SubscriptionPage() {
  const { currentUser } = useAuth()

  const {
    data: plans,
    isLoading: plansLoading,
    isError: plansError,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: () => axios.get("/api/plans").then((res) => res.data),
  })

  // Fetch user and plan via useQuery so handler can rely on cached data.
  const userQuery = useQuery({
    queryKey: ["user", currentUser?.uid],
    queryFn: async () => {
      const token = await getAuthToken()
      return axios
        .get(`/api/users/${currentUser?.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((r) => r.data)
    },
    enabled: !!currentUser?.uid,
    staleTime: 1000 * 60 * 1,
  })

  // Handler uses the cached queries rather than refetching inside the function.
  const handleExtend = async () => {
    // Use the existing subscription.plan_id to renew the same plan
    try {
      const currentPlanId = userQuery.data?.subscription?.plan_id
      if (!currentPlanId) {
        alert("No current plan found for user")
        return
      }

      const userId = userQuery.data?.id ?? 0

      // Find the current plan details to pass to Stripe
      const currentPlan = plans?.find((p) => p.id === currentPlanId)
      if (!currentPlan) {
        alert("Could not find plan details")
        return
      }

      // Create Stripe checkout session
      const token = await getAuthToken()
      const res = await axios.post(
        "http://localhost:8000/api/checkout",
        {
          plan: {
            id: currentPlan.id,
            name: currentPlan.label,
            price: parseFloat(currentPlan.price.replace("$", "")),
          },
          userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Redirect to Stripe checkout
      window.location.href = res.data.url
    } catch (err) {
      console.error("Extend failed", err)
      alert("Failed to initiate checkout")
    }
  }

  const handleSelectPlan = async (plan) => {
    try {
      const userId = userQuery.data?.id ?? 0

      // Create Stripe checkout session
      const token = await getAuthToken()
      const res = await axios.post(
        "http://localhost:8000/api/checkout",
        {
          plan: {
            id: plan.id,
            name: plan.label,
            price: parseFloat(plan.price.replace("$", "")),
          },
          userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Redirect to Stripe checkout
      window.location.href = res.data.url
    } catch (err) {
      console.error("Checkout failed", err)
      alert("Failed to initiate checkout")
    }
  }

  return (
    <div className="subscription-wrapper">
      {/* CURRENT MEMBERSHIP */}
      <div>
        <h2 className="plans-title">Current Plan</h2>

        <SubscriptionCard
          variant="secondary"
          userId={currentUser?.uid}
          buttonText={"Pay now"}
          onButtonClick={handleExtend}
        />
      </div>

      {/* AVAILABLE PLANS */}
      <div>
        <h2 className="plans-title">Available Plans</h2>

        <div className="plans-grid">
          {plansLoading && <div>Loading plans...</div>}
          {plansError && <div>Error loading plans</div>}
          {plans &&
            plans.map((plan) => (
              <div key={plan.id} className="plan-card">
                <h3 className="plan-title">{plan.label}</h3>
                <p className="plan-details">{plan.details}</p>

                <p className="plan-price">{plan.price}</p>

                <button className="select-btn" onClick={() => handleSelectPlan(plan)}>
                  Select Plan
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
