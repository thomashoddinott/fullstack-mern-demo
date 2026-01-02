import "./MembershipPanel.css"
import SubscriptionCard from "../SubscriptionCard/SubscriptionCard"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

export default function MembershipPanel() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  return (
    <SubscriptionCard
      variant="primary"
      userId={currentUser?.uid}
      buttonText={"Renew Subscription"}
      onButtonClick={() => navigate("/subscriptions")}
    />
  )
}
