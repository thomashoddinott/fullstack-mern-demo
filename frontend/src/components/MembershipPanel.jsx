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
            <p className="membership-value">23</p>
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
        <p className="membership-autorenew">Auto-renewal: March 15, 2024</p>
      </div>
    </div>
  );
}
