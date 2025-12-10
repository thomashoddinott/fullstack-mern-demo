import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import "./SubscriptionPage.css";

export default function SubscriptionPage() {
  const { data: plans, isLoading: plansLoading, isError: plansError } = useQuery({
    queryKey: ['plans'],
    queryFn: () => axios.get('/api/plans').then((res) => res.data),
  });

  const currentMembership = {
    title: "1 Month",
    daysLeft: 23,
    price: "$99",
    billing: "Monthly",
  };

  return (
    <div className="subscription-wrapper">

      {/* CURRENT MEMBERSHIP */}
      <div className="current-card">
        <div>
          <h2 className="current-title">{currentMembership.title}</h2>
          <p className="current-subtitle">Unlimited access to all classes and facilities</p>

          <div className="current-stats">
            <div>
              <p className="stat-value">{currentMembership.daysLeft}</p>
              <p className="stat-label">Days Left</p>
            </div>
            <div>
              <p className="stat-value">{currentMembership.price}</p>
              <p className="stat-label">{currentMembership.billing}</p>
            </div>
          </div>
        </div>

        <div className="current-actions">
          <button
            className="renew-btn"
            onClick={() => alert("Renew Subscription Clicked")}
          >
            Renew Subscription
          </button>
        </div>
      </div>

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
