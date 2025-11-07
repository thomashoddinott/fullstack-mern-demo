import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      {/* Left: Logo + Academy name */}
      <div className="navbar-left">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKrfmniVCTDVQibp1OvqzPpovIAPmIDFJ63w&s"
          alt="Logo"
          className="navbar-logo"
        />
        <h1 className="navbar-title">BJJ Academy</h1>
      </div>

      {/* Center: Navigation links */}
      <div className="navbar-center">
        {["Dashboard", "Classes", "Subscriptions", "Schedule"].map((label) => (
          <NavLink
            key={label}
            to={`/${label === "Dashboard" ? "" : label.toLowerCase()}`}
            className={({ isActive }) =>
              `navbar-link ${isActive ? "navbar-link-active" : ""}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Right: User info */}
      <div className="navbar-right">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="User avatar"
          className="navbar-avatar"
        />
        <span className="navbar-username">John Doe</span>
      </div>
    </nav>
  );
}
