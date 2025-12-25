import React from "react"
import axios from "axios"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import "./SubscriptionPage.css"
import SubscriptionCard from "../components/SubscriptionCard"

export default function SubscriptionPage() {
  const {
    data: plans,
    isLoading: plansLoading,
    isError: plansError,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: () => axios.get("/api/plans").then((res) => res.data),
  })

  const qc = useQueryClient()
  // Fetch user and plan via useQuery so handler can rely on cached data.
  const userQuery = useQuery({
    queryKey: ["user", 0],
    queryFn: () => axios.get("/api/users/0").then((r) => r.data),
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
      await axios.patch(`/api/users/${userId}/extend-subscription/${currentPlanId}`)
      // refresh cached user data
      qc.invalidateQueries(["user", userId])
      alert("Subscription extended")
    } catch (err) {
      console.error("Extend failed", err)
      alert("Failed to extend subscription")
    }
  }

  return (
    <div className="subscription-wrapper">
      {/* CURRENT MEMBERSHIP */}
      <div>
        <h2 className="plans-title">Current Plan</h2>

        <SubscriptionCard
          variant="secondary"
          userId={0}
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

                <button className="select-btn" onClick={() => alert(`You selected: ${plan.label}`)}>
                  Select Plan
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
