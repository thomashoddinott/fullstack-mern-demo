import "./MembershipPanel.css"
import SubscriptionCard from "./SubscriptionCard"
import { useNavigate } from "react-router-dom"

export default function MembershipPanel() {
  const navigate = useNavigate()

  return (
    <SubscriptionCard
      variant="primary"
      userId={0}
      buttonText={"Renew Subscription"}
      onButtonClick={() => navigate("/subscriptions")}
    />
  )
}
