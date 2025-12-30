import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import "./CreateAccountPage.css"

export default function CreateAccountPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  const navigate = useNavigate()

  async function createAccount() {
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      await createUserWithEmailAndPassword(getAuth(), email, password)
      navigate("/")
    } catch (e) {
      setError("Error creating account: " + e.message)
    }
  }

  return (
    <div className="create-account-container">
      <h1>Create Account</h1>

      {error && <p className="error">{error}</p>}

      <input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button onClick={createAccount}>Create Account</button>

      <Link to="/login" className="login-link">
        Already have an account? Log In
      </Link>
    </div>
  )
}
