import React from "react";
import "./SubscriptionCard.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function computeDaysLeft(subscription) {
  try {
    const expiry = subscription?.expiry ? new Date(subscription.expiry) : null;
    if (!expiry) return null;
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  } catch {
    return null;
  }
}

export default function SubscriptionCard({
  variant = "primary",
  userId = 0,
  buttonText = "Renew Subscription",
  onButtonClick = () => {},
  colors = null, // optional: { rootStyle: {}, buttonStyle: {} }
}) {
  const { data: user } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => axios.get(`/api/users/${userId}`).then((r) => r.data),
    staleTime: 1000 * 60 * 1,
  });

  const planId = user?.subscription?.plan_id;
  const { data: planData } = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => axios.get(`/api/plans/${planId}`).then((r) => r.data),
    enabled: !!planId,
    staleTime: 1000 * 60 * 5,
  });

  const daysLeft = computeDaysLeft(user?.subscription);

  const rootClass = `subscription-card-ui subscription-card-ui--${variant}`;

  return (
    <div className={rootClass} style={colors?.rootStyle}>
      <div className="subscription-left-ui">
        <h2 className="subscription-title-ui">
          {planData?.label ?? "Premium Membership"}
        </h2>
        <p className="subscription-subtitle-ui">
          Unlimited access to all classes and facilities
        </p>

        <div className="subscription-stats-ui">
          <div>
            <p className="subscription-value-ui">{daysLeft ?? "—"}</p>
            <p className="subscription-label-ui">Days Left</p>
          </div>
          <div>
            <p className="subscription-value-ui">{planData?.price ?? "$99"}</p>
            <p className="subscription-label-ui">
              {planData?.billing ?? "Monthly"}
            </p>
          </div>
        </div>
      </div>

      <div className="subscription-right-ui">
        <button
          className="subscription-button-ui"
          onClick={() => onButtonClick(user, planData)}
          style={colors?.buttonStyle}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
