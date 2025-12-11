import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import "./SubscriptionPage.css";
import SubscriptionCard from "../components/SubscriptionCard";

export default function SubscriptionPage() {
  const { data: plans, isLoading: plansLoading, isError: plansError } = useQuery({
    queryKey: ['plans'],
    queryFn: () => axios.get('/api/plans').then((res) => res.data),
  });

  return (
    <div className="subscription-wrapper">

      {/* CURRENT MEMBERSHIP */}
      <SubscriptionCard
        variant="secondary"
        userId={0}
        buttonText={"Pay now"}
        onButtonClick={() => alert("Open billing portal (placeholder)")}
      />

      {/* AVAILABLE PLANS */}
      <div>
        <h2 className="plans-title">Available Plans</h2>

        <div className="plans-grid">
          {plansLoading && <div>Loading plans...</div>}
          {plansError && <div>Error loading plans</div>}
          {plans && plans.map((plan) => (
            <div key={plan.id} className="plan-card">
              <h3 className="plan-title">{plan.label}</h3>
              <p className="plan-details">{plan.details}</p>

              <p className="plan-price">{plan.price}</p>

              <button
                className="select-btn"
                onClick={() => alert(`You selected: ${plan.label}`)}
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
