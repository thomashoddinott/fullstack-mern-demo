import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
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
