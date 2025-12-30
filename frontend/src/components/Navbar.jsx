import { NavLink, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { getAuth, signOut } from "firebase/auth"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "../hooks/useAuth"
import "./Navbar.css"

export default function Navbar() {
  const [showLogout, setShowLogout] = useState(false)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const { data: user } = useQuery({
    queryKey: ["user", currentUser?.uid],
    queryFn: () => axios.get(`/api/users/${currentUser?.uid}`).then((res) => res.data),
    enabled: !!currentUser?.uid,
    staleTime: 1000 * 60 * 1,
  })

  const { data: avatarUrl } = useQuery({
    queryKey: ["avatar", currentUser?.uid],
    queryFn: () =>
      axios
        .get(`/api/users/${currentUser?.uid}/avatar`, { responseType: "blob" })
        .then((res) => URL.createObjectURL(res.data)),
    enabled: !!currentUser?.uid,
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl)
    }
  }, [avatarUrl])

  async function handleLogout() {
    try {
      await signOut(getAuth())
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <nav className="navbar">
      {/* Left: Logo + Academy name */}
      <NavLink to="/about" className="navbar-left">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKrfmniVCTDVQibp1OvqzPpovIAPmIDFJ63w&s"
          alt="Logo"
          className="navbar-logo"
        />
        <h1 className="navbar-title">BJJ Academy</h1>
      </NavLink>

      {/* Center: Navigation links */}
      <div className="navbar-center">
        {/* todo: update links, refactor link, probably don't use map  */}
        {["Home", "Classes", "Subscriptions", "Schedule"].map((label) => (
          <NavLink
            key={label}
            to={`/${label === "Home" ? "" : label.toLowerCase()}`}
            className={({ isActive }) => `navbar-link ${isActive ? "navbar-link-active" : ""}`}
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Right: User info and Logout Button */}
      <div
        className="navbar-right"
        onMouseEnter={() => setShowLogout(true)}
        onMouseLeave={() => setShowLogout(false)}
      >
        {/* Load avatar for user id=0, fall back to static url while loading/error */}
        <img
          src={avatarUrl ?? "https://randomuser.me/api/portraits/men/32.jpg"}
          alt="User avatar"
          className="navbar-avatar"
        />

        <div className="navbar-identity">
          {showLogout ? (
            <button className="logout-button" onClick={handleLogout}>
              log out
            </button>
          ) : (
            <span className="navbar-username">{user?.name ?? "Loading..."}</span>
          )}
        </div>
      </div>
    </nav>
  )
}
