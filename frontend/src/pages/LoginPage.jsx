import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import "./LoginPage.css"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const navigate = useNavigate()

  async function logIn() {
    try {
      await signInWithEmailAndPassword(getAuth(), email, password)
      navigate("/")
    } catch (e) {
      setError("Invalid email or password")
    }
  }

  return (
    <div className="login-container">
      <h1>Login</h1>

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

      <button onClick={logIn}>Log In</button>

      <Link to="/create-account" className="create-account-link">
        Don't have an account? Create one here
      </Link>
    </div>
  )
}
