import "./MembershipPanel.css";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function MembershipPanel() {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["user", 0],
    queryFn: () => axios.get(`/api/users/0`).then((r) => r.data),
    staleTime: 1000 * 60 * 1,
  });

  const planId = user?.subscription?.plan_id;
  const { data: planData } = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => axios.get(`/api/plans/${planId}`).then((r) => r.data),
    enabled: !!planId,
    staleTime: 1000 * 60 * 5,
  });

  // compute days left until expiry (rounded up), returns null when unknown
  function computeDaysLeft(subscription) {
    try {
      const expiry = subscription?.expiry ? new Date(subscription.expiry) : null;
      if (!expiry) return null;
      const now = new Date();
      // difference in milliseconds, convert to days (round up so partial day counts)
      const diff = expiry.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    } catch {
      return null;
    }
  }

  const daysLeft = computeDaysLeft(user?.subscription);

  return (
    <div className="membership-panel">
      {/* Left: Membership info */}
      <div className="membership-left">
        <h2 className="membership-title">{planData?.label ?? "Premium Membership"}</h2>
        <p className="membership-subtitle">
          Unlimited access to all classes and facilities
        </p>

        <div className="membership-stats">
          <div>
            <p className="membership-value">{daysLeft ?? "—"}</p>
            <p className="membership-label">Days Left</p>
          </div>
          <div>
            <p className="membership-value">$99</p>
            <p className="membership-label">Monthly</p>
          </div>
        </div>
      </div>

      {/* Right: Renew button */}
      <div className="membership-right">
        <button
          className="membership-button"
          onClick={() => navigate("/subscriptions")}
        >
          Renew Subscription
        </button>
      </div>
    </div>
  );
}
