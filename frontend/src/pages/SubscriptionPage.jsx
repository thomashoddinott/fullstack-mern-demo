import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./SubscriptionPage.css";

export default function SubscriptionPage() {
  const [plans, setPlans] = useState(null);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState(null);

  useEffect(() => {
    let mounted = true;
    axios
      .get('/api/plans')
      .then((res) => {
        if (mounted) setPlans(res.data);
      })
      .catch((err) => {
        console.error('Error fetching plans:', err);
        if (mounted) setPlansError(err);
      })
      .finally(() => {
        if (mounted) setPlansLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const currentMembership = {
    title: "1 Month",
    subtitle: "Unlimited access to all classes and facilities",
    daysLeft: 23,
    price: "$99",
    billing: "Monthly",
    autoRenew: "March 15, 2024",
  };

  return (
    <div className="subscription-wrapper">

      {/* CURRENT MEMBERSHIP */}
      <div className="current-card">
        <div>
          <h2 className="current-title">{currentMembership.title}</h2>
          <p className="current-subtitle">{currentMembership.subtitle}</p>

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
          <p className="autorenew-text">
            Auto-renewal: {currentMembership.autoRenew}
          </p>
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
