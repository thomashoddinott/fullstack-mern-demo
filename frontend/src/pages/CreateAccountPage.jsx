import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import "./CreateAccountPage.css"

export default function CreateAccountPage() {
  const [name, setName] = useState("")
  const [rank, setRank] = useState("White Belt")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  const navigate = useNavigate()

  async function createAccount() {
    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password)
      const firebaseUid = userCredential.user.uid

      // Create MongoDB user record
      const response = await fetch("http://localhost:8000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: firebaseUid,
          name: name.trim(),
          rank: rank,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create user profile")
      }

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
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select value={rank} onChange={(e) => setRank(e.target.value)}>
        <option value="White Belt">White Belt</option>
        <option value="Blue Belt">Blue Belt</option>
        <option value="Purple Belt">Purple Belt</option>
        <option value="Brown Belt">Brown Belt</option>
        <option value="Black Belt">Black Belt</option>
      </select>

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
